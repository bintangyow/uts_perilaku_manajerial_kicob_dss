import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

const appUrl = process.env.BETTER_AUTH_URL;

if (!appUrl) {
  throw new Error("BETTER_AUTH_URL is not set");
}

// Normalisasi URL: hapus trailing slash jika ada
const cleanAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: cleanAppUrl,
  emailAndPassword: {
    enabled: true,
    // Set to 'false' to allow public registration (Portfolio mode)
    // Set to 'true' to restrict access only to seeded accounts (UTS mode)
    disableSignUp: true,
  },
  advanced: {
    cookiePrefix: "kicob",
    useSecureCookies: true,
  },
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
  trustedOrigins: [
    "http://localhost:3000",
    "https://utsdss.vercel.app",
    "https://*.vercel.app",
    cleanAppUrl,
  ],
});