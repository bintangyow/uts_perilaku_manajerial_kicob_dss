// ============================================================
// KiCob — Better Auth Server Configuration
// ============================================================

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Tambahkan trustedOrigins untuk mendukung domain Vercel & preview deployments
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "",
    "https://*.vercel.app", // Mengizinkan semua preview deployments dari Vercel
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "reviewer",
        input: true,
      },
    },
  },
});
