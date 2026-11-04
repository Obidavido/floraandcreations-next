"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { registerUser, signIn, type AuthUser } from "@/lib/api";

const TOKEN_KEY = "fc.token.v1";
const USER_KEY = "fc.user.v1";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(searchParams.get("registered") ? "Account created. Sign in to continue." : "");
  const isRegister = mode === "register";
  const redirect = searchParams.get("redirect") || "/account";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    try {
      const result = isRegister ? await registerUser(payload) : await signIn(payload);
      if (result.token) window.localStorage.setItem(TOKEN_KEY, result.token);
      if (result.user) window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      if (!isRegister || result.token) router.replace(redirect);
      else router.replace("/login?registered=1");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "We could not complete that request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <form className="form-card" onSubmit={handleSubmit}>
    {isRegister && <label>Name<input name="name" autoComplete="name" required /></label>}
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    {isRegister && <label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label>}
    <label>Password<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} required /></label>
    {notice && <p className="form-success" role="status">{notice}</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
    {isRegister ? <Link className="text-link" href="/login">Already have an account? Sign in</Link> : <Link className="text-link" href="/register">New here? Create an account</Link>}
  </form>;
}

export function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
}
