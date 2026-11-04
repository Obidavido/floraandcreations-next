"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatNaira, getAdminSummary, type AdminSummary, type AuthUser } from "@/lib/api";
import { adminRequest } from "@/lib/admin-api";

const TOKEN_KEY = "fc.token.v1";
const USER_KEY = "fc.user.v1";

function asNumber(value: string | number | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatStatus(value?: string) {
  return value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";
}

export function AdminAccess() {
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    let user: AuthUser | null = null;
    const token = window.localStorage.getItem(TOKEN_KEY);
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      user = raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      user = null;
    }
    const role = user?.role?.toLowerCase();

    if (!token || !user || (role !== "admin" && role !== "staff")) {
      setAdmin(null);
      setReady(true);
      return () => { active = false; };
    }

    setAdmin(user);
    setReady(true);
    setLoading(true);
    setError("");
    getAdminSummary()
      .then((data) => { if (active) setSummary(data); })
      .catch((summaryError: unknown) => {
        if (!active) return;
        const message = summaryError instanceof Error ? summaryError.message : "The admin summary could not be loaded.";
        setError(message);
        if (/token|session/i.test(message)) {
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem(USER_KEY);
          setAdmin(null);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    adminRequest<{ pagination?: { total?: number }; data?: unknown[] } | unknown[]>("/admin/products?page=1&per_page=1")
      .then((data) => { if (!active) return; const total = Array.isArray(data) ? data.length : data.pagination?.total ?? data.data?.length; if (typeof total === "number") setTotalProducts(total); })
      .catch(() => undefined);

    return () => { active = false; };
  }, [refreshKey]);

  if (!ready) return <div className="admin-workspace-card" aria-busy="true"><p className="detail-copy">Checking admin access…</p></div>;

  if (!admin) return <div className="admin-workspace-card">
    <div className="admin-workspace-copy">
      <p className="eyebrow">Private workspace</p>
      <h2>Admin access</h2>
      <p className="detail-copy">Sign in with an approved administrator or staff account. Access is verified by the API before dashboard data is returned.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <div className="admin-workspace-actions"><Link className="button button-primary" href="/admin/login">Admin sign in</Link></div>
  </div>;

  const recentOrders = summary?.recent_orders || [];
  const topProducts = summary?.top_products || [];
  const orderStatuses = summary?.order_status_counts || [];
  const paymentStatuses = summary?.payment_status_counts || [];

  return <div className="admin-dashboard">
    <div className="admin-dashboard-heading">
      <div>
        <p className="eyebrow">Overview</p>
        <h2>Welcome{admin.name ? `, ${admin.name.split(" ")[0]}` : " back"}.</h2>
        <p className="detail-copy">{admin.email || "Signed in"} <span className="admin-role-pill">{admin.role}</span></p>
      </div>
    </div>

    {error && <div className="admin-alert" role="alert"><span>{error}</span><button className="text-button" type="button" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button></div>}
    {loading && <p className="admin-loading" role="status">Loading your dashboard summary…</p>}

    {summary && <>
      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span>Revenue today</span><strong>{formatNaira(asNumber(summary.revenue?.revenue_today))}</strong></article>
        <article className="admin-stat-card"><span>Orders</span><strong>{asNumber(summary.total_orders).toLocaleString("en-NG")}</strong><small>All time</small></article>
        <article className="admin-stat-card"><span>Customers</span><strong>{asNumber(summary.total_customers).toLocaleString("en-NG")}</strong><small>Registered</small></article>
        <article className="admin-stat-card"><span>Total products</span><strong>{totalProducts === null ? "—" : totalProducts.toLocaleString("en-NG")}</strong><small>Catalog items</small></article>
        <article className="admin-stat-card"><span>Payment checks</span><strong>{asNumber(summary.pending_verification).toLocaleString("en-NG")}</strong><small>Awaiting review</small></article>
        <article className="admin-stat-card"><span>To fulfill</span><strong>{asNumber(summary.pending_fulfillment).toLocaleString("en-NG")}</strong><small>Active orders</small></article>
        <article className="admin-stat-card"><span>Scheduled today</span><strong>{asNumber(summary.today_scheduled).toLocaleString("en-NG")}</strong><small>Not cancelled</small></article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">Latest activity</p><h3>Recent orders</h3></div><span>{recentOrders.length} shown</span></div>
          {recentOrders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>
            {recentOrders.map((order) => <tr key={order.id}><td><strong>{order.order_number || `#${order.id}`}</strong><small>{order.created_at ? order.created_at.slice(0, 10) : ""}</small></td><td>{order.customer_name || "—"}</td><td><span className="admin-status-pill">{formatStatus(order.order_status)}</span></td><td>{formatNaira(asNumber(order.total))}</td></tr>)}
          </tbody></table></div> : <p className="admin-empty-note">No recent orders to show.</p>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">Best sellers</p><h3>Top products</h3></div><span>By quantity sold</span></div>
          {topProducts.length ? <div className="admin-product-list">{topProducts.slice(0, 6).map((product, index) => <div className="admin-product-row" key={product.id}><span className="admin-product-rank">{index + 1}</span><div><strong>{product.name}</strong><small>{asNumber(product.total_sold).toLocaleString("en-NG")} sold</small></div><b>{formatNaira(asNumber(product.total_revenue))}</b></div>)}</div> : <p className="admin-empty-note">Sales rankings will appear when products have orders.</p>}
        </section>
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">Operations</p><h3>Order status</h3></div><Link className="text-link" href="/admin/orders">Manage orders</Link></div>
          {orderStatuses.length ? <div className="admin-product-list">{orderStatuses.map((item) => <div className="admin-product-row" key={item.order_status}><strong>{formatStatus(item.order_status)}</strong><b>{asNumber(item.count).toLocaleString("en-NG")}</b></div>)}</div> : <p className="admin-empty-note">No order status data yet.</p>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">Payments</p><h3>Payment status</h3></div><Link className="text-link" href="/admin/orders">Review payments</Link></div>
          {paymentStatuses.length ? <div className="admin-product-list">{paymentStatuses.map((item) => <div className="admin-product-row" key={item.payment_status}><strong>{formatStatus(item.payment_status)}</strong><b>{asNumber(item.count).toLocaleString("en-NG")}</b></div>)}</div> : <p className="admin-empty-note">No payment status data yet.</p>}
        </section>
      </div>
      <section className="admin-panel admin-module-links">
        <div className="admin-panel-heading"><div><p className="eyebrow">Workspace</p><h3>Manage the store</h3></div></div>
        <div className="admin-module-link-grid">
          {[['/admin/products', 'Products', 'Catalog, images and variants'], ['/admin/categories', 'Categories', 'Product types and occasions'], ['/admin/add-ons', 'Gift add-ons', 'Checkout extras and pricing'], ['/admin/delivery-zones', 'Delivery zones', 'Areas and delivery fees'], ['/admin/customers', 'Customers', 'Accounts and order history'], ['/admin/staff', 'Staff access', 'Administrator and staff accounts'], ['/admin/activity-logs', 'Activity logs', 'Audit trail of admin actions'], ['/admin/settings', 'Store settings', 'Business configuration and password']].map(([href, title, description]) => <Link className="admin-module-link" href={href} key={href}><strong>{title}</strong><span>{description}</span></Link>)}
        </div>
      </section>
      {summary.revenue && <p className="admin-footnote">Revenue snapshot: this week {formatNaira(asNumber(summary.revenue.revenue_this_week))} · this month {formatNaira(asNumber(summary.revenue.revenue_this_month))}. Figures are supplied by the protected admin API.</p>}
    </>}
  </div>;
}
