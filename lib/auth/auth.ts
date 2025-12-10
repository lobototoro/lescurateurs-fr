import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { fixedDb } from "../../db/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(fixedDb, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
        defaultValue: JSON.stringify(["read:articles", "create:articles", "update:articles", "validate:articles"]),
        inup: true,
      },
    },
  },
});
