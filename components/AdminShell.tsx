"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api";

const links = [
  ["/admin", "Overview"],
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/add-ons", "Gift add-ons"],
  ["/admin/delivery-zones", "Delivery zones"],
  ["/admin/customers", "Customers"],
  ["/admin/staff", "Staff"],
  ["/admin/activity-logs", "Activity logs"],
  ["/admin/settings", "Settings"]
] as const;

export function AdminShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = window.localStorage.getItem("fc.token.v1");
      const raw = window.localStorage.getItem("fc.user.v1");
      const parsed = raw ? JSON.parse(raw) as AuthUser : null;
      const role = parsed?.role?.toLowerCase();
      if (token && parsed && (role === "admin" || role === "staff")) setUser(parsed);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      router.replace("/admin/login");
    };
    window.addEventListener("flora-admin-session-expired", expireSession);
    return () => window.removeEventListener("flora-admin-session-expired", expireSession);
  }, [router]);

  function signOut() {
    window.localStorage.removeItem("fc.token.v1");
    window.localStorage.removeItem("fc.user.v1");
    router.replace("/admin/login");
  }

  if (!ready) return <div className="admin-panel admin-gate" aria-busy="true"><p className="detail-copy">Checking administration access…</p></div>;
  if (!user) return <div className="admin-panel admin-gate"><p className="eyebrow">Private workspace</p><h2>Administrator sign-in required.</h2><p className="detail-copy">This management screen is available only to approved staff and administrator accounts.</p><Link className="button button-primary" href="/admin/login">Sign in to admin</Link></div>;

  return <div className="admin-management">
    <div className="admin-management-topbar">
      <div><p className="eyebrow">Flora &amp; Creations · Admin</p><h2>{title}</h2><p>{description}</p></div>
      <div className="admin-topbar-user"><span>{user.name || user.email}</span><span className="admin-role-pill">{user.role}</span><button className="text-button" type="button" onClick={signOut}>Sign out</button></div>
    </div>
    <div className="admin-management-layout">
      <nav className="admin-sidebar" aria-label="Administration sections">
        {links.map(([href, label]) => <Link key={href} href={href} className={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "active" : ""}>{label}</Link>)}
      </nav>
      <main className="admin-management-content">{children}</main>
    </div>
  </div>;
}
