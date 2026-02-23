import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendVerifEmail, sendVerificationEmail } from "@/lib/sendEmail/sendEmail";
import nodemailer from "nodemailer";

// Mock nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(),
  },
}));

// Mock dotenv
vi.mock("dotenv", () => ({
  default: {
    config: vi.fn(),
  },
}));

describe("sendEmail Module", () => {
  const mockTransporter = {
    verify: vi.fn(),
    sendMail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (nodemailer.createTransport as ReturnType<typeof vi.fn>).mockReturnValue(mockTransporter);

    // Set up default environment variables
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASSWORD = "password";
    process.env.EMAIL_SENDER = "noreply@example.com";
    process.env.SMTP_SECURE = "false";
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.EMAIL_SENDER;
    delete process.env.SMTP_SECURE;
  });

  describe("sendVerifEmail", () => {
    describe("Input Validation", () => {
      it("should return error when 'to' is missing", async () => {
        const result = await sendVerifEmail({
          to: "",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required parameters");
      });

      it("should return error when 'subject' is missing", async () => {
        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required parameters");
      });

      it("should return error when email address is invalid", async () => {
        const result = await sendVerifEmail({
          to: "invalid-email",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Invalid email address");
      });

      it("should return error when both text and html are missing", async () => {
        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("At least one of 'text' or 'html' content is required");
      });

      it("should accept valid email addresses", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(true);
      });

      it("should accept email with subdomain", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        const result = await sendVerifEmail({
          to: "test@mail.example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(true);
      });

      it("should accept email with plus addressing", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        const result = await sendVerifEmail({
          to: "test+tag@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Environment Variable Validation", () => {
      it("should return error when SMTP_HOST is missing", async () => {
        delete process.env.SMTP_HOST;

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required environment variables");
        expect(result.error).toContain("SMTP_HOST");
      });

      it("should return error when SMTP_PORT is missing", async () => {
        delete process.env.SMTP_PORT;

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required environment variables");
        expect(result.error).toContain("SMTP_PORT");
      });

      it("should return error when SMTP_USER is missing", async () => {
        delete process.env.SMTP_USER;

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required environment variables");
        expect(result.error).toContain("SMTP_USER");
      });

      it("should return error when SMTP_PASSWORD is missing", async () => {
        delete process.env.SMTP_PASSWORD;

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required environment variables");
        expect(result.error).toContain("SMTP_PASSWORD");
      });

      it("should return error when EMAIL_SENDER is missing", async () => {
        delete process.env.EMAIL_SENDER;

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Missing required environment variables");
        expect(result.error).toContain("EMAIL_SENDER");
      });

      it("should return error with all missing environment variables", async () => {
        delete process.env.SMTP_HOST;
        delete process.env.SMTP_PORT;
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASSWORD;
        delete process.env.EMAIL_SENDER;

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("SMTP_HOST");
        expect(result.error).toContain("SMTP_PORT");
        expect(result.error).toContain("SMTP_USER");
        expect(result.error).toContain("SMTP_PASSWORD");
        expect(result.error).toContain("EMAIL_SENDER");
      });
    });

    describe("Transporter Configuration", () => {
      it("should create transporter with correct configuration", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
          host: "smtp.example.com",
          port: 587,
          secure: false,
          auth: {
            user: "test@example.com",
            pass: "password",
          },
          pool: true,
          maxConnections: 1,
          maxMessages: 100,
          connectionTimeout: 60000,
          greetingTimeout: 15000,
          socketTimeout: 45000,
        });
      });

      it("should use default port 587 when SMTP_PORT is not a number", async () => {
        process.env.SMTP_PORT = "invalid";
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(nodemailer.createTransport).toHaveBeenCalledWith(
          expect.objectContaining({
            port: 587,
          }),
        );
      });

      it("should set secure to true when SMTP_SECURE is 'true'", async () => {
        process.env.SMTP_SECURE = "true";
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(nodemailer.createTransport).toHaveBeenCalledWith(
          expect.objectContaining({
            secure: true,
          }),
        );
      });

      it("should set secure to false when SMTP_SECURE is not 'true'", async () => {
        process.env.SMTP_SECURE = "false";
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(nodemailer.createTransport).toHaveBeenCalledWith(
          expect.objectContaining({
            secure: false,
          }),
        );
      });

      it("should verify transporter before sending email", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(mockTransporter.verify).toHaveBeenCalled();
        expect(mockTransporter.sendMail).toHaveBeenCalled();
      });
    });

    describe("Email Sending Success", () => {
      it("should send email successfully with text content", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({
          messageId: "test-message-id",
          response: "250 OK",
        });

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(true);
        expect(result.messageId).toBe("test-message-id");
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: "noreply@example.com",
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
          html: undefined,
        });
      });

      it("should send email successfully with html content", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({
          messageId: "test-message-id",
          response: "250 OK",
        });

        const htmlContent = "<h1>Test HTML</h1>";

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          html: htmlContent,
        });

        expect(result.success).toBe(true);
        expect(result.messageId).toBe("test-message-id");
        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
          from: "noreply@example.com",
          to: "test@example.com",
          subject: "Test Subject",
          text: undefined,
          html: htmlContent,
        });
      });

      it("should send email successfully with both text and html content", async () => {
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({
          messageId: "test-message-id",
          response: "250 OK",
        });

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
          html: "<h1>Test HTML</h1>",
        });

        expect(result.success).toBe(true);
        expect(result.messageId).toBe("test-message-id");
      });

      it("should log success message with email details", async () => {
        const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockResolvedValue({
          messageId: "test-message-id",
          response: "250 OK",
        });

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(
          "✅ Email sent successfully:",
          expect.objectContaining({
            messageId: "test-message-id",
            to: "test@example.com",
            subject: "Test Subject",
          }),
        );

        consoleLogSpy.mockRestore();
      });
    });

    describe("Error Handling", () => {
      it("should handle transporter verification failure", async () => {
        const error = new Error("Connection failed");
        mockTransporter.verify.mockRejectedValue(error);

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Failed to send email");
      });

      it("should handle timeout errors with specific message", async () => {
        const error = new Error("ETIMEDOUT");
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockRejectedValue(error);

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Connection timeout");
      });

      it("should handle authentication errors with specific message", async () => {
        const error = new Error("EAUTH: Invalid login");
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockRejectedValue(error);

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Authentication failed");
      });

      it("should handle connection refused errors with specific message", async () => {
        const error = new Error("ECONNREFUSED");
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockRejectedValue(error);

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Connection refused");
      });

      it("should handle generic errors", async () => {
        const error = new Error("Unknown error");
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockRejectedValue(error);

        const result = await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("Failed to send email");
      });

      it("should log error details", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const error = new Error("Test error");
        mockTransporter.verify.mockResolvedValue(undefined);
        mockTransporter.sendMail.mockRejectedValue(error);

        await sendVerifEmail({
          to: "test@example.com",
          subject: "Test Subject",
          text: "Test content",
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "❌ Error sending email:",
          expect.objectContaining({
            to: "test@example.com",
            subject: "Test Subject",
            error: "Test error",
          }),
        );

        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email with correct format", async () => {
      mockTransporter.verify.mockResolvedValue(undefined);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: "test-message-id",
      });

      const result = await sendVerificationEmail("test@example.com", "123456");

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-message-id");

      const mailOptions = mockTransporter.sendMail.mock.calls[0][0];
      expect(mailOptions.subject).toBe("Verify your email address");
      expect(mailOptions.text).toContain("123456");
      expect(mailOptions.text).toContain("15 minutes");
      expect(mailOptions.html).toContain("123456");
      expect(mailOptions.html).toContain("Verify Your Email Address");
    });

    it("should include verification code in email text", async () => {
      mockTransporter.verify.mockResolvedValue(undefined);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: "test-message-id",
      });

      await sendVerificationEmail("test@example.com", "ABC123");

      const mailOptions = mockTransporter.sendMail.mock.calls[0][0];
      expect(mailOptions.text).toContain("ABC123");
    });

    it("should include verification code in email HTML", async () => {
      mockTransporter.verify.mockResolvedValue(undefined);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: "test-message-id",
      });

      await sendVerificationEmail("test@example.com", "XYZ789");

      const mailOptions = mockTransporter.sendMail.mock.calls[0][0];
      expect(mailOptions.html).toContain("XYZ789");
      expect(mailOptions.html).toContain("font-size: 24px");
      expect(mailOptions.html).toContain("font-weight: bold");
    });

    it("should return error when sendVerifEmail fails", async () => {
      mockTransporter.verify.mockResolvedValue(undefined);
      mockTransporter.sendMail.mockRejectedValue(new Error("Send failed"));

      const result = await sendVerificationEmail("test@example.com", "123456");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to send email");
    });

    it("should handle invalid email address", async () => {
      const result = await sendVerificationEmail("invalid-email", "123456");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");
    });
  });
});
