"use client";

import Link from "next/link";
import { ReactNode } from "react";

const links = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/addresses", "Addresses"],
  ["/account/wishlist", "Wishlist"],
  ["/account/profile", "Profile"]
] as const;

export function AccountShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="account-management">
    <div className="account-management-topbar">
      <div><p className="eyebrow">Flora &amp; Creations · Account</p><h1>{title}</h1><p>{description}</p></div>
    </div>
    <div className="account-management-layout">
      <nav className="account-sidebar" aria-label="Account sections">
        {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <main className="account-management-content">{children}</main>
    </div>
  </div>;
}
