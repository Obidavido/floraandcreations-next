"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/api";

type OrderItem = { id?: string | number; product_name?: string; quantity?: number | string; line_total?: number | string };
type Order = {
  id: string | number;
  order_number?: string;
  order_status?: string;
  payment_status?: string;
  fulfillment_type?: string;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  subtotal?: string | number;
  delivery_fee?: string | number;
  total?: string | number;
  items?: OrderItem[];
};
type GuestContact = { email?: string; phone?: string };
type Settings = { bank_details?: { bank_name?: string; bank_account_name?: string; bank_account_number?: string }; contact?: { whatsapp_number?: string } };

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");
const BANK_FALLBACK = { bank_name: "Access Bank", bank_account_name: "Flora and Creations", bank_account_number: "0030258382" };

async function getJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem("fc.token.v1");
  const response = await fetch(`${API_ROOT}${path}`, { ...init, headers: { Accept: "application/json", ...(init.body instanceof FormData ? {} : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers }, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : typeof body.error === "string" ? body.error : "We could not load this order.");
  return body as T;
}

export function OrderTrackingView({ reference }: { reference: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [guest, setGuest] = useState<GuestContact>({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const bank = { ...BANK_FALLBACK, ...settings.bank_details };
  const whatsapp = settings.contact?.whatsapp_number || "2347031677165";

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(`fc.guest-contact.${reference}`);
      if (raw) setGuest(JSON.parse(raw) as GuestContact);
    } catch { setGuest({}); }
    void getJson<Settings | { data?: Settings }>("/settings").then((result) => {
      setSettings("data" in result && result.data ? result.data : result as Settings);
    }).catch(() => undefined);
  }, [reference]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    const contactEmail = guest.email || email;
    const contactPhone = guest.phone || phone;
    if (contactEmail) params.set("email", contactEmail);
    if (contactPhone) params.set("phone", contactPhone);
    const suffix = params.size ? `?${params}` : "";
    setLoading(true);
    void getJson<Order | { order?: Order; data?: Order }>(`/orders/${encodeURIComponent(reference)}${suffix}`)
      .then((result) => { if (active) { setOrder((result as { order?: Order; data?: Order }).order || (result as { data?: Order }).data || result as Order); setError(""); } })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "We could not verify this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reference, guest.email, guest.phone, email, phone]);

  async function retryLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuest({ email, phone });
    try { window.sessionStorage.setItem(`fc.guest-contact.${reference}`, JSON.stringify({ email, phone })); } catch { /* session storage is optional */ }
  }

  async function uploadProof() {
    if (!proof || !order) return;
    setUploading(true); setError("");
    try {
      const form = new FormData(); form.append("proof", proof);
      await getJson(`/orders/${encodeURIComponent(String(order.id))}/payment-proof`, { method: "POST", body: form });
      setProof(null);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Payment proof could not be uploaded."); }
    finally { setUploading(false); }
  }

  if (loading) return <section className="section container"><p role="status">Loading your order…</p></section>;
  if (!order) return <section className="section container"><div className="empty-state"><h1>Couldn’t load your order</h1><p>{error || "Verify your contact details to view this guest order."}</p><form className="order-lookup-form" onSubmit={retryLookup}><label className="checkout-field">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="checkout-field">Phone<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label><button className="button button-primary" type="submit">Check order</button></form><Link className="text-link" href="/shop">Back to shop</Link></div></section>;

  const subtotal = Number(order.subtotal || 0);
  const deliveryFee = Number(order.delivery_fee || 0);
  const total = Number(order.total || subtotal + deliveryFee);
  const status = (order.order_status || "pending_payment").replaceAll("_", " ");
  return <section className="section container order-tracking-section">
    <div className="order-thank-you"><p className="eyebrow">Order received</p><h1>Thank you!</h1><p>Your order <strong>{order.order_number || order.id}</strong> has been received.</p></div>
    <div className="order-tracking-card">
      <h2>Order summary</h2>
      {(order.items || []).map((item, index) => <div className="checkout-summary-row" key={item.id ?? index}><span>{item.product_name || "Item"} × {item.quantity || 1}</span><strong>{formatNaira(Number(item.line_total || 0))}</strong></div>)}
      <div className="checkout-summary-row"><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div>
      <div className="checkout-summary-row"><span>Delivery</span><strong>{order.fulfillment_type === "pickup" ? "Free (pickup)" : formatNaira(deliveryFee)}</strong></div>
      <div className="checkout-summary-total"><span>Total</span><strong>{formatNaira(total)}</strong></div>
      <div className="order-tracking-meta"><p><strong>Fulfillment:</strong> {order.fulfillment_type || "delivery"}</p><p><strong>Schedule:</strong> {order.scheduled_date || "—"} · {order.scheduled_time_slot || "—"}</p><p><strong>Status:</strong> {status}</p><p><strong>Payment:</strong> {(order.payment_status || "pending").replaceAll("_", " ")}</p></div>
    </div>
    {order.payment_status !== "confirmed" && <div className="order-payment-card"><h2>Complete your payment</h2><p>Transfer the total to the account below, then upload your proof or send it to us.</p><div className="checkout-bank-details"><div><span>Bank</span><strong>{bank.bank_name}</strong></div><div><span>Account name</span><strong>{bank.bank_account_name}</strong></div><div><span>Account number</span><strong className="checkout-account-number">{bank.bank_account_number}</strong><button type="button" className="text-button" onClick={() => { void navigator.clipboard.writeText(bank.bank_account_number || "").then(() => setCopied(true)); }}>{copied ? "Copied" : "Copy"}</button></div><div><span>Amount</span><strong>{formatNaira(total)}</strong></div></div><label className="checkout-field checkout-proof-field">Upload proof of payment<input type="file" accept="image/*,application/pdf" onChange={(event) => setProof(event.target.files?.[0] || null)} /></label><button className="button button-primary" type="button" disabled={!proof || uploading} onClick={() => void uploadProof()}>{uploading ? "Uploading…" : "Upload proof"}</button><p className="checkout-proof-note">Or <a target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I've completed payment for order ${order.order_number || order.id} (${formatNaira(total)}). Please confirm.`)}`}>send proof on WhatsApp</a>.</p></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <Link className="button button-secondary" href="/shop">Continue shopping</Link>
  </section>;
}
