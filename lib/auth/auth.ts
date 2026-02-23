import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { fixedDb } from "../../db/drizzle";
import { sendVerifEmail } from "@/lib/sendEmail/sendEmail";

const perms = JSON.stringify(["read:articles", "create:articles", "update:articles", "validate:articles"]);

/**
 * Helper function to execute tasks without blocking the response.
 * Similar to waitUntil() in serverless environments.
 * This ensures email sending doesn't block the authentication flow.
 */
function runInBackground<T>(promise: Promise<T>): void {
  // Fire and forget - don't await, don't block
  promise.catch((error) => {
    // Log errors but don't throw to avoid affecting the main flow
    console.error("Background task failed:", error);
  });
}

export const auth = betterAuth({
  database: drizzleAdapter(fixedDb, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    autoSignIn: false,
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url: _url, token }: { user: any; url: string; token: string }, _request: any) => {
      runInBackground(
        sendVerifEmail({
          to: user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${process.env.NODE_ENV === "production" ? "https://lescurateurs.fr/resetPassword?token=" + token : "http://localhost:3000/resetPassword?token=" + token}`,
        }),
      );
    },
    onPasswordReset: async ({ user }: { user: any }, _request: any) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url: _url, token }: { user: any; url: string; token: string }, _request: any) => {
      // Use the refactored sendVerifEmail with object-based API
      // Run in background to avoid blocking the authentication response
      // TODO: when ready, add the lescurateurs.fr logo
      runInBackground(
        sendVerifEmail({
          to: user.email,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${process.env.NODE_ENV === "production" ? "https://lescurateurs.fr/verifiedEmail/" + token + "/?email=" + user.email : "http://localhost:3000/verifiedEmail/" + token + "/?email=" + user.email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Verify Your Email Address</h2>
              <p style="color: #666;">Thank you for signing up! Please click the button below to verify your email address:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NODE_ENV === "production" ? "https://lescurateurs.fr/verifiedEmail/" + token + "/?email=" + user.email : "http://localhost:3000/verifiedEmail/" + token + "/?email=" + user.email}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
              </div>
              <p style="color: #666;">Or copy and paste this link into your browser:</p>
              <p style="color: #999; word-break: break-all;">${process.env.NODE_ENV === "production" ? "https://lescurateurs.fr/verifiedEmail/" + token + "/?email=" + user.email : "http://localhost:3000/verifiedEmail/" + token + "/?email=" + user.email}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
            </div>
          `,
        }),
      );
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "contributor",
        input: true,
      },
      permissions: {
        type: "string",
        required: true,
        defaultValue: perms,
        inup: true,
      },
    },
  },
});
