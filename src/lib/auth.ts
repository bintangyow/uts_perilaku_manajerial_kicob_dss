const appUrl = process.env.BETTER_AUTH_URL;

if (!appUrl) {
  throw new Error("BETTER_AUTH_URL is not set");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
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