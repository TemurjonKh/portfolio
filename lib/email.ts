import "server-only";
import { ADMIN_EMAIL } from "@/lib/constants";

type Email = { subject: string; html: string; replyTo?: string };

export function emailConfigured() {
  return Boolean(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM);
}

async function send({ subject, html, replyTo }: Email) {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Email is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [ADMIN_EMAIL], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!response.ok) throw new Error("Email provider rejected the request.");
}

export function sendPasswordResetEmail(resetUrl: string) {
  return send({
    subject: "Reset your portfolio admin password",
    html: `<p>A password reset was requested for your portfolio.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour and can be used once.</p>`,
  });
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export function sendContactEmail({ name, email, message }: { name: string; email: string; message: string }) {
  return send({
    subject: `Portfolio message from ${name}`,
    replyTo: email,
    html: `<p><strong>${escape(name)}</strong> (${escape(email)}) wrote:</p><p style="white-space:pre-wrap">${escape(message)}</p>`,
  });
}
