"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FiBarChart2, FiBox, FiGrid, FiMoreHorizontal, FiShoppingBag } from "react-icons/fi";
import type { IconType } from "react-icons";
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
const staffLinks = new Set(["/admin", "/admin/orders", "/admin/products", "/admin/customers"]);
const mobileIcons: Record<string, IconType> = { "/admin": FiBarChart2, "/admin/orders": FiShoppingBag, "/admin/products": FiBox, "/admin/categories": FiGrid };

export function AdminShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

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

  const isStaff = user.role?.toLowerCase() === "staff";
  const visibleLinks = isStaff ? links.filter(([href]) => staffLinks.has(href)) : links;
  const staffHasAccess = !isStaff || [...staffLinks].some((href) => pathname === href || pathname.startsWith(`${href}/`));
  if (!staffHasAccess) return <div className="admin-panel admin-gate"><p className="eyebrow">Staff access level</p><h2>This section is for administrators.</h2><p className="detail-copy">Your staff account is limited to the overview, orders, products and customers sections.</p><Link className="button button-primary" href="/admin">Back to staff overview</Link></div>;

  return <div className="admin-management">
    <div className="admin-management-topbar">
      <div><p className="eyebrow">Flora &amp; Creations · Admin</p><h2>{title}</h2><p>{description}</p></div>
      <div className="admin-topbar-user"><span>{user.name || user.email}</span><span className="admin-role-pill">{user.role}</span><button className="text-button" type="button" onClick={signOut}>Sign out</button></div>
    </div>
    <div className="admin-management-layout">
      <nav className="admin-sidebar" aria-label="Administration sections">
        {visibleLinks.map(([href, label]) => <Link key={href} href={href} className={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "active" : ""}>{label}</Link>)}
      </nav>
      <nav className={`dashboard-mobile-tabs${isStaff ? " staff-tabs" : ""}`} aria-label="Mobile administration sections">
        {visibleLinks.slice(0, 4).map(([href, label]) => { const Icon = mobileIcons[href] || FiGrid; return <Link key={href} href={href} className={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "active" : ""}><Icon aria-hidden="true" /><span>{label}</span></Link>; })}
        {!isStaff && <button type="button" className={mobileMoreOpen ? "active" : ""} aria-expanded={mobileMoreOpen} onClick={() => setMobileMoreOpen((open) => !open)}><FiMoreHorizontal aria-hidden="true" /><span>More</span></button>}
      </nav>
      {mobileMoreOpen && !isStaff && <div className="dashboard-mobile-more"><p className="eyebrow">More admin sections</p>{visibleLinks.slice(4).map(([href, label]) => <Link key={href} href={href} onClick={() => setMobileMoreOpen(false)} className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""}>{label}</Link>)}</div>}
      <main className="admin-management-content">{children}</main>
    </div>
  </div>;
}
