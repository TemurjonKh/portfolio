"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function Field({ label, name, type = "text", autoComplete, minLength }: { label: string; name: string; type?: string; autoComplete?: string; minLength?: number }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}<input name={name} type={type} autoComplete={autoComplete} minLength={minLength} required className="focus-ring h-12 border hairline bg-white px-4 font-normal" /></label>;
}

export function LoginForm({ returnTo = "/admin" }: { returnTo?: string }) {
  const router = useRouter(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
    const result = await response.json(); setBusy(false); if (!response.ok) return setMessage(result.error); router.push(/^\/(?!\/)/.test(returnTo) ? returnTo : "/admin"); router.refresh();
  }
  return <form onSubmit={submit} className="grid gap-5"><Field label="Email" name="email" type="email" autoComplete="username" /><Field label="Password" name="password" type="password" autoComplete="current-password" /><Status text={message} /><button disabled={busy} className="focus-ring h-12 bg-[var(--ink)] px-5 font-bold text-white disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button><a href="/forgot-password" className="focus-ring text-center text-sm text-[var(--accent)]">Forgot password?</a></form>;
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const data = new FormData(event.currentTarget); const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email") }) }); const result = await response.json(); setMessage(result.message || "If that account exists, we’ve sent a password-reset link."); setBusy(false); }
  return <form onSubmit={submit} className="grid gap-5"><Field label="Account email" name="email" type="email" autoComplete="email" /><Status text={message} /><button disabled={busy} className="focus-ring h-12 bg-[var(--ink)] px-5 font-bold text-white disabled:opacity-60">{busy ? "Sending…" : "Send reset link"}</button><a href="/login" className="focus-ring text-center text-sm text-[var(--accent)]">Back to sign in</a></form>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(""); const data = new FormData(event.currentTarget); if (data.get("password") !== data.get("confirm")) { setBusy(false); return setMessage("The passwords do not match."); } const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: data.get("password") }) }); const result = await response.json(); setBusy(false); if (!response.ok) return setMessage(result.error); setMessage("Password updated. Redirecting to sign in…"); setTimeout(() => router.push("/login"), 900); }
  return <form onSubmit={submit} className="grid gap-5"><Field label="New password" name="password" type="password" autoComplete="new-password" minLength={12} /><Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" minLength={12} /><p className="text-xs leading-5 text-[var(--muted)]">Use at least 12 characters. All existing sessions will be signed out.</p><Status text={message} /><button disabled={busy || !token} className="focus-ring h-12 bg-[var(--ink)] px-5 font-bold text-white disabled:opacity-60">{busy ? "Updating…" : "Set new password"}</button></form>;
}

function Status({ text }: { text: string }) { return text ? <p role="status" className="border border-[var(--accent)] bg-[var(--accent-soft)]/30 p-3 text-sm leading-6">{text}</p> : null; }
