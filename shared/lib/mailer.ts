import "server-only";

/**
 * Minimal pluggable mailer. No email provider is configured for this project yet — wire one up
 * (Resend, SES, SMTP, ...) by filling in the `send` branch below with the provider's API call.
 *
 * Security note: reset tokens and invitation tokens must never appear in API responses or
 * server logs (see shared/lib/auth/tokens.ts). This module intentionally does NOT log message
 * bodies unless a developer explicitly opts in via AUTH_DEBUG_EMAIL=true — off by default, and
 * must never be enabled in production — purely so a reset/invite link can be read from the
 * terminal during local development without a real provider configured.
 */
export async function sendMail(message: { to: string; subject: string; text: string }): Promise<void> {
  const hasProvider = Boolean(process.env.RESEND_API_KEY || process.env.SMTP_URL);

  if (!hasProvider) {
    if (process.env.AUTH_DEBUG_EMAIL === "true" && process.env.NODE_ENV !== "production") {
      console.log(`[dev-mailer] to=${message.to} subject="${message.subject}"\n${message.text}`);
    }
    return;
  }

  // No provider is wired up yet — extend here, e.g.:
  // if (process.env.RESEND_API_KEY) { await resend.emails.send({...}); return; }
  throw new Error("No email provider implementation is wired up for the configured credentials.");
}
