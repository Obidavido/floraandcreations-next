"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readStoredUser } from "@/components/AuthForm";
import type { AuthUser } from "@/lib/api";

export function AccountView() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setReady(true);
  }, []);

  function signOut() {
    window.localStorage.removeItem("fc.token.v1");
    window.localStorage.removeItem("fc.user.v1");
    router.replace("/login");
  }

  if (!ready) return <div className="empty-state" aria-busy="true"><p>Checking your account…</p></div>;
  if (!user) return <div className="empty-state"><p className="eyebrow">Your account</p><h1>Sign in to continue.</h1><p>Manage orders, wishlist, saved addresses and settings from your customer account.</p><Link className="button button-primary" href="/login?redirect=%2Faccount">Sign in</Link></div>;

  return <div className="account-panel"><div><p className="eyebrow">Your account</p><h1>Hello{user.name ? `, ${user.name.split(" ")[0]}` : " there"}.</h1><p className="detail-copy">{user.email || "Your account is ready for the next beautiful delivery."}</p></div><div className="account-links"><Link className="soft-panel" href="/account/orders"><strong>Orders</strong><span>Review your recent deliveries.</span></Link><Link className="soft-panel" href="/account/addresses"><strong>Saved addresses</strong><span>Keep delivery details ready.</span></Link><Link className="soft-panel" href="/account/wishlist"><strong>Wishlist</strong><span>Return to arrangements you love.</span></Link></div><button className="button button-secondary" type="button" onClick={signOut}>Sign out</button></div>;
}
