"use client";

import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/AdminPagination";
import { adminList, adminMediaUrl, adminRequest, type AdminPage } from "@/lib/admin-api";
import { formatNaira } from "@/lib/api";

type OrderRow = {
  id: string | number; order_number?: string; customer_name?: string; customer_email?: string; customer_account_name?: string; account_email?: string;
  total?: string | number; order_status?: string; payment_status?: string; fulfillment_type?: string; scheduled_date?: string;
  created_at?: string; item_count?: number | string; items?: Array<{ id?: string | number; product_name?: string; quantity?: string | number; line_total?: string | number; variant?: { size?: string; color?: string; sku?: string }; add_ons?: Array<{ add_on_name?: string; price?: string | number; custom_message?: string }> }>;
  delivery_address?: Record<string, string> | string; payment_proofs?: Array<{ id: string | number; image_url: string; submitted_at?: string; verified_at?: string; verified_by_name?: string }>;
};

const statusLabels: Record<string, string> = { pending_payment: "Pending payment", processing: "Processing", ready_for_pickup: "Ready for pickup", out_for_delivery: "Out for delivery", completed: "Completed", cancelled: "Cancelled" };
const transitions: Record<string, string[]> = {
  pending_payment: ["processing", "cancelled"],
  processing: ["ready_for_pickup", "out_for_delivery", "cancelled"],
  ready_for_pickup: ["out_for_delivery", "completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [], cancelled: []
};
function number(value: string | number | undefined) { const result = Number(value ?? 0); return Number.isFinite(result) ? result : 0; }
function display(value?: string) { return value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—"; }
function errText(error: unknown) { return error instanceof Error ? error.message : "The request could not be completed."; }

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminPage<OrderRow>["pagination"] | null>(null);
  const [filters, setFilters] = useState({ search: "", order_status: "", payment_status: "", fulfillment_type: "" });

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), per_page: "50" });
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    setLoading(true); setError("");
    adminRequest<AdminPage<OrderRow> | OrderRow[]>(`/admin/orders?${params}`)
      .then((result) => { if (active) { setOrders(adminList<OrderRow>(result)); setPagination(Array.isArray(result) ? null : result.pagination || null); } })
      .catch((loadError) => { if (active) setError(errText(loadError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, refreshKey, page]);

  async function viewOrder(row: OrderRow) {
    setError(""); setNotice(""); setSaving(true);
    try { const detail = await adminRequest<OrderRow>(`/admin/orders/${encodeURIComponent(String(row.id))}`); setSelected(detail); }
    catch (detailError) { setError(errText(detailError)); }
    finally { setSaving(false); }
  }

  async function updateStatus(nextStatus: string) {
    if (!selected) return;
    if (nextStatus === "cancelled" && !window.confirm(`Cancel order ${selected.order_number || selected.id}? This notifies the customer.`)) return;
    if (nextStatus === "completed" && !window.confirm(`Mark ${selected.order_number || selected.id} as completed?`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await adminRequest(`/admin/orders/${encodeURIComponent(String(selected.id))}/status`, { method: "PUT", body: { order_status: nextStatus } });
      setNotice(`Order status updated to ${statusLabels[nextStatus] || display(nextStatus)}.`); setRefreshKey((key) => key + 1);
      const detail = await adminRequest<OrderRow>(`/admin/orders/${encodeURIComponent(String(selected.id))}`); setSelected(detail);
    } catch (updateError) { setError(errText(updateError)); }
    finally { setSaving(false); }
  }

  async function updatePayment(nextStatus: string) {
    if (!selected) return;
    const confirmed = nextStatus === "confirmed";
    if (!window.confirm(`${confirmed ? "Confirm payment" : "Mark payment as failed"} for ${selected.order_number || selected.id}?${confirmed ? " The API may move a pending order into processing and notify the customer." : ""}`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await adminRequest(`/admin/orders/${encodeURIComponent(String(selected.id))}/payment`, { method: "PUT", body: { payment_status: nextStatus } });
      setNotice(`Payment status updated to ${display(nextStatus)}.`); setRefreshKey((key) => key + 1);
      const detail = await adminRequest<OrderRow>(`/admin/orders/${encodeURIComponent(String(selected.id))}`); setSelected(detail);
    } catch (updateError) { setError(errText(updateError)); }
    finally { setSaving(false); }
  }

  return <div className="admin-orders-view">
    <div className="admin-order-filters">
      <input aria-label="Search orders" className="admin-search-input" placeholder="Search order, customer or email" value={filters.search} onChange={(event) => { setFilters({ ...filters, search: event.target.value }); setPage(1); }} />
      <select aria-label="Filter by order status" value={filters.order_status} onChange={(event) => { setFilters({ ...filters, order_status: event.target.value }); setPage(1); }}><option value="">All order statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Filter by payment status" value={filters.payment_status} onChange={(event) => { setFilters({ ...filters, payment_status: event.target.value }); setPage(1); }}><option value="">All payments</option>{["pending", "proof_submitted", "confirmed", "failed"].map((value) => <option key={value} value={value}>{display(value)}</option>)}</select>
      <select aria-label="Filter fulfillment type" value={filters.fulfillment_type} onChange={(event) => { setFilters({ ...filters, fulfillment_type: event.target.value }); setPage(1); }}><option value="">Delivery or pickup</option><option value="delivery">Delivery</option><option value="pickup">Pickup</option></select>
    </div>
    <AdminPagination pagination={pagination || null} onPageChange={setPage} />
    {error && <p className="form-error admin-message" role="alert">{error}</p>}{notice && <p className="form-success admin-message" role="status">{notice}</p>}
    {loading && <p className="detail-copy" role="status">Loading orders…</p>}
    <div className="admin-orders-layout">
      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">Order management</p><h3>Orders</h3></div><span>{orders.length} shown</span></div>
        {!loading && !orders.length ? <p className="admin-empty-note">No orders match these filters.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className={String(selected?.id) === String(order.id) ? "admin-selected-row" : ""}><td><strong>{order.order_number || `#${order.id}`}</strong><small>{order.created_at?.slice(0, 10) || ""}</small></td><td>{order.customer_name || order.customer_account_name || order.customer_email || "Guest"}</td><td><span className="admin-status-pill">{display(order.order_status)}</span></td><td>{display(order.payment_status)}</td><td>{formatNaira(number(order.total))}</td><td><button className="text-button" type="button" onClick={() => void viewOrder(order)}>{saving && String(selected?.id) === String(order.id) ? "Loading…" : "Details"}</button></td></tr>)}</tbody></table></div>}
      </section>

      <section className="admin-panel admin-order-detail">
        {!selected ? <div className="admin-empty-state"><p className="eyebrow">Order details</p><h3>Select an order</h3><p className="detail-copy">Choose an order from the list to review its items, fulfilment and payment.</p></div> : <>
          <div className="admin-panel-heading"><div><p className="eyebrow">{selected.order_number || `Order #${selected.id}`}</p><h3>Order details</h3></div><button className="text-button" type="button" onClick={() => setSelected(null)}>Close</button></div>
          <div className="admin-order-meta"><div><span>Customer</span><strong>{selected.customer_name || selected.customer_account_name || "Guest"}</strong><small>{selected.customer_email || selected.account_email || ""}</small></div><div><span>Order status</span><strong>{display(selected.order_status)}</strong></div><div><span>Payment status</span><strong>{display(selected.payment_status)}</strong></div><div><span>Fulfilment</span><strong>{display(selected.fulfillment_type)}</strong></div><div><span>Scheduled date</span><strong>{selected.scheduled_date || "Not scheduled"}</strong></div><div><span>Total</span><strong>{formatNaira(number(selected.total))}</strong></div></div>
          <div className="admin-order-actions">
            {(transitions[selected.order_status || ""] || []).length > 0 && <label>Move order to<select defaultValue="" disabled={saving} onChange={(event) => { if (event.target.value) void updateStatus(event.target.value); event.target.value = ""; }}><option value="">Choose valid next status…</option>{(transitions[selected.order_status || ""] || []).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>}
            {["pending", "proof_submitted"].includes(selected.payment_status || "") && <div className="admin-payment-actions"><button className="button button-primary" type="button" disabled={saving} onClick={() => void updatePayment("confirmed")}>Confirm payment</button><button className="button button-secondary" type="button" disabled={saving} onClick={() => void updatePayment("failed")}>Mark failed</button></div>}
          </div>
          <h4 className="admin-subheading">Items ({selected.items?.length ?? number(selected.item_count)})</h4>
          <div className="admin-detail-list">{(selected.items || []).map((item, index) => <div key={item.id || index}><span><strong>{item.product_name || "Product"}</strong><small>Quantity {number(item.quantity)}{item.variant ? ` · ${[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}` : ""}{item.add_ons?.map((extra) => ` · ${extra.add_on_name}${extra.price ? ` (+${formatNaira(number(extra.price))})` : ""}${extra.custom_message ? `: ${extra.custom_message}` : ""}`).join("")}</small></span><strong>{formatNaira(number(item.line_total))}</strong></div>)}</div>
          {selected.delivery_address && <div className="admin-order-block"><h4>Delivery address</h4><p>{typeof selected.delivery_address === "string" ? selected.delivery_address : Object.entries(selected.delivery_address).filter(([key, value]) => value && !["id", "user_id", "created_at", "updated_at"].includes(key)).map(([, value]) => value).join(", ")}</p></div>}
          {selected.payment_proofs?.length ? <div className="admin-order-block"><h4>Payment proof</h4>{selected.payment_proofs.map((proof) => <a className="admin-proof-link" href={adminMediaUrl(proof.image_url)} target="_blank" rel="noopener noreferrer" key={proof.id}>Open payment proof · {proof.submitted_at?.slice(0, 10) || "view image"}{proof.verified_at ? " · verified" : ""}</a>)}</div> : null}
        </>}
      </section>
    </div>
  </div>;
}
