import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

const appUrl = process.env.BETTER_AUTH_URL;

if (!appUrl) {
  throw new Error("BETTER_AUTH_URL is not set");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // Gunakan baseURL dari env agar sinkron dengan client
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
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
    appUrl,
  ],
});