"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { readStoredUser } from "@/components/AuthForm";
import { accountRequest, type AccountAddress, type AccountOrder, type DeliveryZone, type Paginated, type WishlistProduct } from "@/lib/account-api";
import { formatNaira, type AuthUser } from "@/lib/api";

type AddressInput = Omit<AccountAddress, "id">;
const emptyAddress: AddressInput = { label: "", recipient_name: "", recipient_phone: "", area: "", street_address: "", landmark: "" };
const sectionTitles: Record<string, string> = { orders: "Your orders", addresses: "Saved addresses", wishlist: "Your wishlist", profile: "Profile details" };

function numeric(value: string | number | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function readableStatus(value?: string) {
  return value ? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Pending";
}

export function AccountSectionView({ section }: { section: string[] }) {
  const routePath = section.join("/");
  const sectionName = section[0] || "";
  const orderId = sectionName === "orders" ? section[1] : undefined;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [order, setOrder] = useState<AccountOrder | null>(null);
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddress);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("fc.token.v1");
    const storedUser = readStoredUser();
    setUser(token ? storedUser : null);
    setReady(true);
    setError("");

    if (!token || !storedUser) return () => { active = false; };

    if (sectionName === "profile") {
      setProfile({ name: storedUser.name || "", email: storedUser.email || "", phone: storedUser.phone || "" });
      return () => { active = false; };
    }

    setLoading(true);
    const load = async () => {
      try {
        if (sectionName === "orders" && orderId) {
          const data = await accountRequest<AccountOrder>(`/account/orders/${encodeURIComponent(orderId)}`);
          if (active) setOrder(data);
        } else if (sectionName === "orders") {
          const data = await accountRequest<Paginated<AccountOrder> | AccountOrder[]>("/account/orders?page=1&per_page=50");
          if (active) setOrders(Array.isArray(data) ? data : data.data || []);
        } else if (sectionName === "addresses") {
          const [addressData, zoneData] = await Promise.all([
            accountRequest<AccountAddress[]>("/account/addresses"),
            accountRequest<DeliveryZone[]>("/delivery-zones")
          ]);
          if (active) { setAddresses(Array.isArray(addressData) ? addressData : []); setZones(Array.isArray(zoneData) ? zoneData : []); }
        } else if (sectionName === "wishlist") {
          const data = await accountRequest<WishlistProduct[]>("/account/wishlist");
          if (active) setWishlist(Array.isArray(data) ? data : []);
        }
      } catch (requestError: unknown) {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : "We could not load this account section.";
        setError(message);
        if (/invalid or expired authentication token|missing authentication token/i.test(message)) {
          window.localStorage.removeItem("fc.token.v1");
          window.localStorage.removeItem("fc.user.v1");
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [routePath, refreshKey, sectionName, orderId]);

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      if (editingAddress) await accountRequest<AccountAddress>(`/account/addresses/${encodeURIComponent(editingAddress)}`, { method: "PUT", body: addressForm });
      else await accountRequest<AccountAddress>("/account/addresses", { method: "POST", body: addressForm });
      setNotice(editingAddress ? "Address updated." : "Address saved.");
      setAddressForm(emptyAddress); setEditingAddress(null); setRefreshKey((value) => value + 1);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "The address could not be saved.");
    } finally { setSaving(false); }
  }

  async function deleteAddress(id: string | number) {
    if (!window.confirm("Delete this saved address?")) return;
    setError(""); setNotice("");
    try { await accountRequest<void>(`/account/addresses/${encodeURIComponent(String(id))}`, { method: "DELETE" }); setNotice("Address deleted."); setRefreshKey((value) => value + 1); }
    catch (deleteError: unknown) { setError(deleteError instanceof Error ? deleteError.message : "The address could not be deleted."); }
  }

  function startAddressEdit(address: AccountAddress) {
    setEditingAddress(String(address.id));
    setAddressForm({ label: address.label, recipient_name: address.recipient_name, recipient_phone: address.recipient_phone, area: address.area, street_address: address.street_address, landmark: address.landmark || "" });
    setError(""); setNotice("");
  }

  async function removeWishlistItem(id: string | number) {
    setError(""); setNotice("");
    try { await accountRequest<void>(`/account/wishlist/${encodeURIComponent(String(id))}`, { method: "DELETE" }); setNotice("Removed from your wishlist."); setRefreshKey((value) => value + 1); }
    catch (removeError: unknown) { setError(removeError instanceof Error ? removeError.message : "The item could not be removed."); }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const result = await accountRequest<{ user?: AuthUser; message?: string }>("/account/profile", { method: "PUT", body: profile });
      const updatedUser = result.user || { ...user, ...profile };
      window.localStorage.setItem("fc.user.v1", JSON.stringify(updatedUser));
      setUser(updatedUser); setNotice(result.message || "Profile updated successfully.");
    } catch (saveError: unknown) { setError(saveError instanceof Error ? saveError.message : "Your profile could not be updated."); }
    finally { setSaving(false); }
  }

  if (!ready) return <div className="account-loading" aria-busy="true">Checking your account…</div>;
  if (!user) return <div className="account-guest-card"><p className="eyebrow">Your account</p><h1>Sign in to continue.</h1><p className="detail-copy">Sign in to view your private account information.</p><Link className="button button-primary" href={`/login?redirect=${encodeURIComponent(`/account/${routePath}`)}`}>Sign in to continue</Link></div>;

  const title = orderId ? `Order ${order?.order_number || `#${orderId}`}` : sectionTitles[sectionName];
  const validSection = Boolean(title);

  return <div className="account-section-view">
    <nav className="account-subnav" aria-label="Account navigation">
      <Link href="/account">Account overview</Link><Link href="/account/orders">Orders</Link><Link href="/account/addresses">Addresses</Link><Link href="/account/wishlist">Wishlist</Link><Link href="/account/profile">Profile</Link>
    </nav>
    <header className="account-section-heading"><p className="eyebrow">Your account</p><h1>{title || "Account section"}</h1><p className="detail-copy">{orderId ? "Review the details for your order." : sectionName === "orders" ? "Track your purchases and review order details." : sectionName === "addresses" ? "Save and update delivery addresses for faster checkout." : sectionName === "wishlist" ? "Keep your favourite arrangements close at hand." : sectionName === "profile" ? "Keep your contact details up to date." : "Manage your Flora and Creations account."}</p></header>
    {error && <p className="form-error account-message" role="alert">{error}</p>}
    {notice && <p className="form-success account-message" role="status">{notice}</p>}
    {loading && <p className="account-loading" role="status">Loading your account information…</p>}
    {!validSection && <div className="account-panel-card"><h2>Section not found</h2><p className="detail-copy">This account page isn’t available.</p><Link className="button button-primary" href="/account">Back to account</Link></div>}

    {validSection && sectionName === "orders" && !orderId && !loading && <section className="account-panel-card">
      {orders.length ? <div className="account-order-list">{orders.map((item) => <Link className="account-order-row" href={`/account/orders/${item.id}`} key={item.id}>
        <span><strong>{item.order_number || `Order #${item.id}`}</strong><small>{item.created_at?.slice(0, 10) || "Order"} · {Number(item.item_count || 0)} item(s)</small></span><span className="account-order-status">{readableStatus(item.order_status)}</span><strong>{formatNaira(numeric(item.total))}</strong>
      </Link>)}</div> : <div className="account-empty"><h2>No orders yet</h2><p className="detail-copy">Your orders will appear here once you place your first one.</p><Link className="button button-primary" href="/shop">Browse the shop</Link></div>}
    </section>}

    {validSection && sectionName === "orders" && orderId && !loading && order && <section className="account-panel-card">
      <div className="account-order-summary"><div><span>Order status</span><strong>{readableStatus(order.order_status)}</strong></div><div><span>Payment</span><strong>{readableStatus(order.payment_status)}</strong></div><div><span>Order total</span><strong>{formatNaira(numeric(order.total))}</strong></div></div>
      <dl className="account-order-meta"><div><dt>Fulfilment</dt><dd>{readableStatus(order.fulfillment_type)}</dd></div>{order.scheduled_date && <div><dt>Scheduled for</dt><dd>{order.scheduled_date}{order.scheduled_time_slot ? ` · ${order.scheduled_time_slot}` : ""}</dd></div>}{order.created_at && <div><dt>Placed</dt><dd>{order.created_at.slice(0, 10)}</dd></div>}{order.gift_note && <div><dt>Gift note</dt><dd>{order.gift_note}</dd></div>}</dl>
      <h2 className="account-subheading">Items</h2>
      <div className="account-line-items">{(order.items || []).map((item, index) => <div className="account-line-item" key={item.id || index}><div><strong>{item.product_slug ? <Link href={`/products/${item.product_slug}`}>{item.product_name || "Product"}</Link> : item.product_name || "Product"}</strong><small>Qty {numeric(item.quantity)}{item.variant?.size ? ` · ${item.variant.size}` : ""}{item.variant?.color ? ` · ${item.variant.color}` : ""}</small></div><strong>{formatNaira(numeric(item.line_total))}</strong></div>)}</div>
      <Link className="text-link account-back-link" href="/account/orders">Back to all orders</Link>
    </section>}

    {validSection && sectionName === "addresses" && <div className="account-address-layout">
      <section className="account-panel-card"><div className="account-panel-title"><h2>{editingAddress ? "Edit address" : "Add an address"}</h2>{editingAddress && <button className="text-button" type="button" onClick={() => { setEditingAddress(null); setAddressForm(emptyAddress); }}>Cancel edit</button>}</div>
        <form className="form-card account-form-card" onSubmit={submitAddress}>
          <label>Address label<input required value={addressForm.label} onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })} placeholder="Home, work, etc." /></label>
          <label>Recipient name<input required autoComplete="name" value={addressForm.recipient_name} onChange={(event) => setAddressForm({ ...addressForm, recipient_name: event.target.value })} /></label>
          <label>Recipient phone<input required type="tel" autoComplete="tel" value={addressForm.recipient_phone} onChange={(event) => setAddressForm({ ...addressForm, recipient_phone: event.target.value })} /></label>
          <label>Delivery area<select required value={addressForm.area} onChange={(event) => setAddressForm({ ...addressForm, area: event.target.value })}><option value="">Choose a delivery area</option>{zones.map((zone) => <option key={zone.id} value={zone.area_name}>{zone.area_name} · {formatNaira(numeric(zone.fee))}</option>)}</select></label>
          {!zones.length && !loading && <p className="detail-copy">Delivery areas are temporarily unavailable. Please try again later.</p>}
          <label>Street address<textarea required rows={3} value={addressForm.street_address} onChange={(event) => setAddressForm({ ...addressForm, street_address: event.target.value })} /></label>
          <label>Landmark (optional)<input value={addressForm.landmark || ""} onChange={(event) => setAddressForm({ ...addressForm, landmark: event.target.value })} /></label>
          <button className="button button-primary" type="submit" disabled={saving || !zones.length}>{saving ? "Saving…" : editingAddress ? "Save address" : "Add address"}</button>
        </form>
      </section>
      <section className="account-address-list"><h2>Saved addresses</h2>{!addresses.length && !loading ? <p className="detail-copy">No saved addresses yet.</p> : addresses.map((address) => <article className="account-address-card" key={address.id}><div><p className="eyebrow">{address.label}</p><h3>{address.recipient_name}</h3><p>{address.street_address}<br />{address.area}{address.landmark ? ` · ${address.landmark}` : ""}</p><small>{address.recipient_phone}</small></div><div className="account-address-actions"><button className="text-button" type="button" onClick={() => startAddressEdit(address)}>Edit</button><button className="text-button account-delete-button" type="button" onClick={() => deleteAddress(address.id)}>Delete</button></div></article>)}</section>
    </div>}

    {validSection && sectionName === "wishlist" && !loading && <section className="account-panel-card">
      {wishlist.length ? <div className="account-wishlist-grid">{wishlist.map((product) => <article className="account-wishlist-card" key={product.id}><p className="eyebrow">{product.featured ? "Featured" : "Saved for later"}</p><h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2><p className="price">{formatNaira(numeric(product.base_price))}</p><div className="account-wishlist-actions"><Link className="button button-primary" href={`/products/${product.slug}`}>View product</Link><button className="text-button account-delete-button" type="button" onClick={() => removeWishlistItem(product.id)}>Remove</button></div></article>)}</div> : <div className="account-empty"><h2>Your wishlist is empty</h2><p className="detail-copy">Save products you love and they’ll be waiting here.</p><Link className="button button-primary" href="/shop">Explore flowers &amp; gifts</Link></div>}
    </section>}

    {validSection && sectionName === "profile" && <section className="account-panel-card account-profile-panel"><form className="form-card account-form-card" onSubmit={saveProfile}>
      <label>Full name<input required autoComplete="name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
      <label>Email address<input required type="email" autoComplete="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
      <label>Phone number<input type="tel" autoComplete="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
      <p className="detail-copy">Password changes aren’t available here yet. Contact support if you need help securing your account.</p>
      <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
    </form></section>}
  </div>;
}
