"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiGrid, FiHeart, FiMapPin, FiMoreHorizontal, FiPackage } from "react-icons/fi";
import type { IconType } from "react-icons";
import { ReactNode } from "react";

const links = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/addresses", "Addresses"],
  ["/account/wishlist", "Wishlist"],
  ["/account/profile", "Profile"]
] as const;
const mobileIcons: Record<string, IconType> = { "/account": FiGrid, "/account/orders": FiPackage, "/account/addresses": FiMapPin, "/account/wishlist": FiHeart };

export function AccountShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const router = useRouter();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  function signOut() {
    window.localStorage.removeItem("fc.token.v1");
    window.localStorage.removeItem("fc.user.v1");
    router.replace("/login");
  }
  return <div className="account-management">
    <div className="account-management-topbar">
      <div><p className="eyebrow">Flora &amp; Creations · Account</p><h1>{title}</h1><p>{description}</p></div><button className="button button-secondary account-signout" type="button" onClick={signOut}>Sign out</button>
    </div>
    <div className="account-management-layout">
      <nav className="account-sidebar" aria-label="Account sections">
        {links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <nav className="dashboard-mobile-tabs" aria-label="Mobile account sections">
        {links.slice(0, 4).map(([href, label]) => { const Icon = mobileIcons[href]; return <Link key={href} href={href}><Icon aria-hidden="true" /><span>{label}</span></Link>; })}
        <button type="button" className={mobileMoreOpen ? "active" : ""} aria-expanded={mobileMoreOpen} onClick={() => setMobileMoreOpen((open) => !open)}><FiMoreHorizontal aria-hidden="true" /><span>More</span></button>
      </nav>
      {mobileMoreOpen && <div className="dashboard-mobile-more"><p className="eyebrow">More account sections</p>{links.slice(4).map(([href, label]) => <Link key={href} href={href} onClick={() => setMobileMoreOpen(false)}>{label}</Link>)}</div>}
      <div className="account-management-content">{children}</div>
    </div>
  </div>;
}
