import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Validates if a string is a valid email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that all required environment variables are set
 */
function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_SENDER"];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Sends an email using the configured SMTP transporter
 * @param options - Email options including recipient, subject, and content
 * @returns Promise with success status, message ID, or error details
 */
export async function sendVerifEmail(options: EmailOptions): Promise<SendEmailResult> {
  // Validate input parameters
  if (!options.to || !options.subject) {
    return {
      success: false,
      error: "Missing required parameters: 'to' and 'subject' are required",
    };
  }

  if (!isValidEmail(options.to)) {
    return {
      success: false,
      error: `Invalid email address: ${options.to}`,
    };
  }

  if (!options.text && !options.html) {
    return {
      success: false,
      error: "At least one of 'text' or 'html' content is required",
    };
  }

  // Validate environment variables
  const envValidation = validateEnvironmentVariables();
  if (!envValidation.valid) {
    return {
      success: false,
      error: `Missing required environment variables: ${envValidation.missing.join(", ")}`,
    };
  }

  try {
    // Create transporter with proper type casting
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Add timeout and connection pool settings for better reliability
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
      connectionTimeout: 60000,
      greetingTimeout: 15000,
      socketTimeout: 45000,
    });

    // Verify transporter configuration before sending
    await transporter.verify();

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
      response: info.response,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    console.error("❌ Error sending email:", {
      to: options.to,
      subject: options.subject,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Provide more specific error messages based on common issues
    if (errorMessage.includes("ETIMEDOUT") || errorMessage.includes("timeout")) {
      return {
        success: false,
        error: "Connection timeout. Please check your SMTP server and network connection.",
      };
    }

    if (errorMessage.includes("EAUTH") || errorMessage.includes("Invalid login")) {
      return {
        success: false,
        error: "Authentication failed. Please check your SMTP credentials.",
      };
    }

    if (errorMessage.includes("ECONNREFUSED")) {
      return {
        success: false,
        error: "Connection refused. Please check your SMTP host and port.",
      };
    }

    return {
      success: false,
      error: `Failed to send email: ${errorMessage}`,
    };
  }
}

/**
 * Convenience function to send a verification email
 * @param to - Recipient email address
 * @param verificationCode - Verification code to include in the email
 * @returns Promise with send result
 */
export async function sendVerificationEmail(to: string, verificationCode: string): Promise<SendEmailResult> {
  const subject = "Verify your email address";
  const text = `Your verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p style="color: #666;">Thank you for signing up! Please use the verification code below to complete your registration:</p>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333;">${verificationCode}</span>
      </div>
      <p style="color: #666;">This code will expire in 15 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this verification, please ignore this email.</p>
    </div>
  `;

  return sendVerifEmail({ to, subject, text, html });
}
