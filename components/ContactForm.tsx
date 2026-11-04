"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", { method: "POST", body: JSON.stringify(Object.fromEntries(form)), headers: { "Content-Type": "application/json" } });
      setState(response.ok ? "sent" : "error");
      if (response.ok) event.currentTarget.reset();
    } catch { setState("error"); }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <label>Name<input name="name" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Phone<input name="phone" type="tel" /></label>
      <label>Message<textarea name="message" rows={5} required /></label>
      <button className="button button-primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send enquiry"}</button>
      {state === "sent" && <p className="form-success">Thank you — your enquiry has been sent.</p>}
      {state === "error" && <p className="form-error">We could not send that just now. Please call or WhatsApp us.</p>}
    </form>
  );
}
