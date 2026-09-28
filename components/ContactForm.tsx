"use client";

import { FormEvent, useState } from "react";

type State = { status: "idle" | "sending" | "sent" | "error"; message?: string };

export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return setState({ status: "error", message: result.error || "The message didn’t send. Use the email link instead." });
      form.reset();
      setState({ status: "sent" });
    } catch {
      setState({ status: "error", message: "The server couldn’t be reached. Use the email link instead." });
    }
  }

  if (state.status === "sent") {
    return <div className="tk-form tk-form--sent" role="status"><p>Message sent. I’ll reply to the address you gave.</p><button type="button" onClick={() => setState({ status: "idle" })}>Write another</button></div>;
  }

  return (
    <form className="tk-form" onSubmit={submit}>
      <div className="tk-form__row">
        <label>Name<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      </div>
      <label>Message<textarea name="message" required minLength={10} maxLength={4000} rows={5} /></label>
      <label className="tk-form__trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {state.status === "error" && <p role="alert" className="tk-form__error">{state.message}</p>}
      <button type="submit" className="tk-button tk-button--solid" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
