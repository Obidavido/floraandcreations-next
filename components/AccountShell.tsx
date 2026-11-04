"use client";

import Link from "next/link";
import { useState } from "react";
import { ReactNode } from "react";

const links = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/addresses", "Addresses"],
  ["/account/wishlist", "Wishlist"],
  ["/account/profile", "Profile"]
] as const;

export function AccountShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  return <div className="account-management">
    <div className="account-management-topbar">
      <div><p className="eyebrow">Flora &amp; Creations · Account</p><h1>{title}</h1><p>{description}</p></div>
    </div>
    <div className="account-management-layout">
      <nav className="account-sidebar" aria-label="Account sections">
        {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <nav className="dashboard-mobile-tabs" aria-label="Mobile account sections">
        {links.slice(0, 4).map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        <button type="button" className={mobileMoreOpen ? "active" : ""} aria-expanded={mobileMoreOpen} onClick={() => setMobileMoreOpen((open) => !open)}>More</button>
      </nav>
      {mobileMoreOpen && <div className="dashboard-mobile-more"><p className="eyebrow">More account sections</p>{links.slice(4).map(([href, label]) => <Link key={href} href={href} onClick={() => setMobileMoreOpen(false)}>{label}</Link>)}</div>}
      <div className="account-management-content">{children}</div>
    </div>
  </div>;
}
