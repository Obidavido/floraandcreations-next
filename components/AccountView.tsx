"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readStoredUser } from "@/components/AuthForm";
import { accountRequest, type AccountOrder, type Paginated } from "@/lib/account-api";
import { formatNaira, type AuthUser } from "@/lib/api";

export function AccountView() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("fc.token.v1");
    const storedUser = readStoredUser();
    setUser(token ? storedUser : null);
    setReady(true);
    if (token && storedUser) {
      setLoading(true);
      accountRequest<Paginated<AccountOrder> | AccountOrder[]>("/account/orders?page=1&per_page=5")
        .then((result) => { if (active) setOrders(Array.isArray(result) ? result : result.data || []); })
        .catch((requestError: unknown) => {
          if (!active) return;
          const message = requestError instanceof Error ? requestError.message : "Your orders could not be loaded.";
          if (/invalid or expired authentication token|missing authentication token/i.test(message)) {
            window.localStorage.removeItem("fc.token.v1");
            window.localStorage.removeItem("fc.user.v1");
            setUser(null);
          } else setError(message);
        })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, []);

  if (!ready) return <div className="account-loading" aria-busy="true"><p>Checking your account…</p></div>;
  if (!user) return <div className="account-guest-card"><p className="eyebrow">Your account</p><h1>Sign in to continue.</h1><p className="detail-copy">View orders, save delivery details, manage your wishlist and update your profile.</p><Link className="button button-primary" href="/login?redirect=%2Faccount">Sign in to your account</Link></div>;

  return <div className="account-dashboard">
    <header className="account-dashboard-heading">
      <div><p className="eyebrow">Your account</p><h1>Hello{user.name ? `, ${user.name.split(" ")[0]}` : " there"}.</h1><p className="detail-copy">{user.email || "Your account is ready for the next beautiful delivery."}</p></div>
    </header>

    <nav className="account-links" aria-label="Account sections">
      <Link className="soft-panel" href="/account/orders"><strong>Orders</strong><span>Track orders and view your receipts.</span></Link>
      <Link className="soft-panel" href="/account/addresses"><strong>Saved addresses</strong><span>Keep delivery details ready for checkout.</span></Link>
      <Link className="soft-panel" href="/account/wishlist"><strong>Wishlist</strong><span>Return to arrangements you love.</span></Link>
      <Link className="soft-panel" href="/account/profile"><strong>Profile</strong><span>Update your name, email and phone.</span></Link>
    </nav>

    <section className="account-orders-panel">
      <div className="section-header"><div><p className="eyebrow">Order history</p><h2>Recent orders</h2></div><Link className="text-link" href="/account/orders">View all orders</Link></div>
      {loading && <p className="detail-copy" role="status">Loading your orders…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && orders.length === 0 && <p className="detail-copy">You don’t have any orders yet. Your next thoughtful gift is just around the corner.</p>}
      {orders.length > 0 && <div className="account-order-list">{orders.map((order) => <Link className="account-order-row" href={`/account/orders/${order.id}`} key={order.id}>
        <span><strong>{order.order_number || `Order #${order.id}`}</strong><small>{order.created_at?.slice(0, 10) || "Order details"}</small></span>
        <span className="account-order-status">{(order.order_status || "pending").replaceAll("_", " ")}</span>
        <strong>{formatNaira(Number(order.total || 0))}</strong>
      </Link>)}</div>}
    </section>
  </div>;
}
