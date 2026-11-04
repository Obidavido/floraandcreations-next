"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/api";
import type { AuthUser } from "@/lib/api";

type DeliveryZone = { id: string | number; area?: string; area_name?: string; fee: number | string };
type StoreSettings = {
  bank_details?: { bank_name?: string; bank_account_name?: string; bank_account_number?: string };
  contact?: { whatsapp_number?: string; business_address?: string };
};
type OrderResult = { order?: { id?: string | number }; data?: { order?: { id?: string | number } } };

type Fulfillment = "delivery" | "pickup";

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");
const TIME_SLOTS = ["Morning (9am – 12pm)", "Afternoon (12pm – 3pm)", "Evening (3pm – 6pm)"];
const FALLBACK_BANK = { bank_name: "Access Bank", bank_account_name: "Flora and Creations", bank_account_number: "0030258382" };
const FALLBACK_WHATSAPP = "2347031677165";

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem("fc.token.v1");
  const isForm = init.body instanceof FormData;
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(isForm ? {} : init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const errors = body.errors && typeof body.errors === "object"
      ? Object.values(body.errors as Record<string, unknown>).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value): value is string => typeof value === "string").join(" ")
      : "";
    throw new Error(typeof body.message === "string" ? body.message : typeof body.error === "string" ? body.error : errors || `Request failed (${response.status}).`);
  }
  return body as T;
}

function localDateToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function CheckoutView() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [recipient, setRecipient] = useState({ name: "", phone: "", area: "", street: "", landmark: "" });
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [giftNote, setGiftNote] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const bank = { ...FALLBACK_BANK, ...settings.bank_details };
  const deliveryZone = zones.find((zone) => (zone.area ?? zone.area_name) === recipient.area);
  const deliveryFee = fulfillment === "delivery" ? Number(deliveryZone?.fee || 0) : 0;
  const total = subtotal + deliveryFee;
  const zoneGroups = useMemo(() => {
    const groups = new Map<number, string[]>();
    for (const zone of zones) {
      const fee = Number(zone.fee);
      groups.set(fee, [...(groups.get(fee) || []), zone.area ?? zone.area_name ?? ""]);
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [zones]);

  useEffect(() => {
    try {
      const token = window.localStorage.getItem("fc.token.v1");
      const stored = window.localStorage.getItem("fc.user.v1");
      setHasAccount(Boolean(token));
      if (token && stored) {
        const user = JSON.parse(stored) as AuthUser;
        setCustomer({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
      }
    } catch {
      // Continue with guest checkout if the saved profile cannot be read.
    }
    let active = true;
    Promise.allSettled([
      apiRequest<DeliveryZone[] | { data?: DeliveryZone[] }>("/delivery-zones"),
      apiRequest<StoreSettings | { data?: StoreSettings }>("/settings"),
    ]).then(([zoneResult, settingsResult]) => {
      if (!active) return;
      if (zoneResult.status === "fulfilled") {
        const value = zoneResult.value;
        setZones(Array.isArray(value) ? value : value.data || []);
      } else {
        setError(zoneResult.reason instanceof Error ? zoneResult.reason.message : "We could not load delivery areas.");
      }
      if (settingsResult.status === "fulfilled") {
        const value = settingsResult.value;
        setSettings("data" in value && value.data ? value.data : value as StoreSettings);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(bank.bank_account_number || "");
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 1600);
    } catch {
      setError("Could not copy the account number. Please copy it manually.");
    }
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!items.length) return;
    if (fulfillment === "delivery" && !deliveryZone) {
      setError("Please select a valid delivery area.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        fulfillment_type: fulfillment,
        delivery_zone_id: fulfillment === "delivery" ? deliveryZone?.id : undefined,
        address: fulfillment === "delivery" ? {
          label: "Delivery",
          recipient_name: recipient.name,
          recipient_phone: recipient.phone,
          area: recipient.area,
          street_address: recipient.street,
          landmark: recipient.landmark || undefined,
        } : undefined,
        scheduled_date: scheduledDate,
        scheduled_time_slot: timeSlot,
        gift_note: giftNote || undefined,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      };
      const result = await apiRequest<OrderResult>("/orders", { method: "POST", body: JSON.stringify(payload) });
      const orderId = result.order?.id ?? result.data?.order?.id;
      if (orderId === undefined || orderId === null) throw new Error("The order was created, but we could not read its reference. Please contact the store before trying again.");

      if (proof) {
        try {
          const form = new FormData();
          form.append("proof", proof);
          await apiRequest(`/orders/${encodeURIComponent(String(orderId))}/payment-proof`, { method: "POST", body: form });
        } catch {
          setNotice("Your order was placed, but the payment proof upload failed. You can retry from your order page or send proof on WhatsApp.");
        }
      }
      if (!hasAccount) {
        window.sessionStorage.setItem(`fc.guest-contact.${orderId}`, JSON.stringify({ email: customer.email, phone: customer.phone }));
      }
      clearCart();
      router.push(`/order/${encodeURIComponent(String(orderId))}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <section className="section container"><div className="empty-state" aria-live="polite"><p className="eyebrow">Checkout</p><h1>Loading your cart…</h1><p>Your saved items are being restored.</p></div></section>;

  if (!items.length) return <section className="section container"><div className="empty-state"><p className="eyebrow">Checkout</p><h1>Nothing to checkout yet.</h1><p>Add an arrangement to your cart to continue to delivery and payment.</p><Link className="button button-primary" href="/shop">Choose an arrangement</Link></div></section>;

  return <section className="section container checkout-section">
    <h1 className="checkout-title">Checkout</h1>
    {!hasAccount && <div className="checkout-guest-note"><span><strong>Have an account?</strong> Sign in to track this order automatically from your account, or continue as a guest.</span><Link className="button button-secondary" href="/login">Sign in</Link></div>}
    {error && <p className="form-error checkout-message" role="alert">{error}</p>}
    {notice && <p className="form-success checkout-message" role="status">{notice}</p>}
    {loading && <p className="detail-copy" role="status">Loading delivery and payment options…</p>}
    <form className="checkout-layout" onSubmit={placeOrder}>
      <div className="checkout-fields">
        <section className="checkout-panel">
          <h2>Fulfillment</h2>
          <div className="checkout-fulfillment-options">{(["delivery", "pickup"] as const).map((choice) => <button key={choice} type="button" aria-pressed={fulfillment === choice} className={`checkout-choice${fulfillment === choice ? " checkout-choice-active" : ""}`} onClick={() => setFulfillment(choice)}><strong>{choice === "delivery" ? "Delivery" : "Store pickup"}</strong><span>{choice === "delivery" ? "We bring your order to your recipient." : `Collect at ${settings.contact?.business_address || "our Jahi store"}.`}</span></button>)}</div>
          {fulfillment === "delivery" && <div className="checkout-form-grid">
            <label className="checkout-field checkout-field-wide">Delivery area<select required value={recipient.area} onChange={(event) => setRecipient({ ...recipient, area: event.target.value })}><option value="">Select an area…</option>{zoneGroups.map(([fee, areas]) => <optgroup key={fee} label={`${formatNaira(fee)} delivery zone`}>{areas.map((area) => <option key={area} value={area}>{area}</option>)}</optgroup>)}</select>{recipient.area && deliveryZone && <small>Delivery fee: {formatNaira(Number(deliveryZone.fee))}</small>}<small>Area not listed? <a href={`https://wa.me/${settings.contact?.whatsapp_number || FALLBACK_WHATSAPP}`} target="_blank" rel="noreferrer">Contact us on WhatsApp for a quote.</a></small></label>
            <label className="checkout-field">Recipient name<input required value={recipient.name} onChange={(event) => setRecipient({ ...recipient, name: event.target.value })} /></label>
            <label className="checkout-field">Recipient phone<input required type="tel" value={recipient.phone} onChange={(event) => setRecipient({ ...recipient, phone: event.target.value })} /></label>
            <label className="checkout-field checkout-field-wide">Street address<input required value={recipient.street} onChange={(event) => setRecipient({ ...recipient, street: event.target.value })} /></label>
            <label className="checkout-field checkout-field-wide">Landmark (optional)<input value={recipient.landmark} onChange={(event) => setRecipient({ ...recipient, landmark: event.target.value })} /></label>
          </div>}
          {fulfillment === "pickup" && <p className="checkout-pickup-location"><strong>Pickup location</strong><br />{settings.contact?.business_address || "Suite B1, Jahi Plaza, Ben Ndi Obi Street, Jahi"}</p>}
          <div className="checkout-form-grid checkout-schedule">
            <label className="checkout-field">{fulfillment === "delivery" ? "Delivery date" : "Pickup date"}<input required type="date" min={localDateToday()} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></label>
            <label className="checkout-field">Time slot<select value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)}>{TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
            <label className="checkout-field checkout-field-wide">Gift note (optional)<textarea rows={3} value={giftNote} onChange={(event) => setGiftNote(event.target.value)} placeholder="A note for the recipient…" /></label>
          </div>
        </section>

        <section className="checkout-panel">
          <h2>Your details</h2>
          <div className="checkout-form-grid">
            <label className="checkout-field">Full name<input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} /></label>
            <label className="checkout-field">Phone<input required type="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} /></label>
            <label className="checkout-field checkout-field-wide">Email<input required type="email" autoComplete="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} /></label>
          </div>
        </section>

        <section className="checkout-panel">
          <h2>Payment</h2>
          <p className="detail-copy">Bank transfer only at launch.</p>
          <div className="checkout-bank-details">
            <div><span>Bank</span><strong>{bank.bank_name}</strong></div>
            <div><span>Account name</span><strong>{bank.bank_account_name}</strong></div>
            <div><span>Account number</span><strong className="checkout-account-number">{bank.bank_account_number}</strong><button type="button" className="text-button" onClick={() => void copyAccountNumber()}>{copyDone ? "Copied" : "Copy"}</button></div>
            <div><span>Amount</span><strong>{formatNaira(total)}</strong></div>
          </div>
          <label className="checkout-field checkout-proof-field">Upload proof of payment (optional)<input type="file" accept="image/*,application/pdf" onChange={(event) => setProof(event.target.files?.[0] || null)} />{proof && <small>Selected: {proof.name}</small>}</label>
          <p className="checkout-proof-note">You can also send proof after placing the order via <a href={`https://wa.me/${settings.contact?.whatsapp_number || FALLBACK_WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>.</p>
        </section>
      </div>

      <aside className="checkout-summary">
        <h2>Order summary</h2>
        <div className="checkout-summary-items">{items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><strong>{formatNaira(item.price * item.quantity)}</strong></div>)}</div>
        <div className="checkout-summary-row"><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div>
        <div className="checkout-summary-row"><span>Delivery</span><strong>{fulfillment === "pickup" ? "Free (pickup)" : deliveryFee ? formatNaira(deliveryFee) : "Select area"}</strong></div>
        <div className="checkout-summary-total"><span>Total</span><strong>{formatNaira(total)}</strong></div>
        <button className="button button-primary checkout-submit" type="submit" disabled={submitting || loading}>{submitting ? "Placing order…" : "Place order"}</button>
        <p className="checkout-pending-note">Your order is created as pending payment confirmation until our team verifies your transfer.</p>
      </aside>
    </form>
  </section>;
}
