import "server-only";

/** Server configuration. See .env.example for what each value does. */
export const env = {
  passcode: process.env.STAGE_PASSCODE ?? "",
  authSecret: process.env.AUTH_SECRET ?? "",
  contentDir: process.env.CONTENT_DIR ?? "",
  contentRepo: process.env.CONTENT_REPO ?? "Pranjulrathour/juvenile-ai-workshop",
  contentBranch: process.env.CONTENT_BRANCH ?? "main",
  contentToken: process.env.CONTENT_TOKEN ?? "",
} as const;

export const isTeamAuthConfigured = () => env.passcode.length >= 8 && env.authSecret.length >= 32;
