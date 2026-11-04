"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminPagination } from "@/components/AdminPagination";
import { adminList, adminRequest, type AdminPage } from "@/lib/admin-api";
import { formatNaira } from "@/lib/api";

type Customer = { id: string | number; name?: string; email?: string; phone?: string; role?: string; created_at?: string; total_orders?: number | string; total_spent?: string | number };
type CustomerDetail = Customer & { addresses?: Array<Record<string, string>>; orders?: Array<Record<string, string | number>>; stats?: { total_orders?: number | string; total_spent?: number | string }; wishlist_count?: number | string };
type Staff = { id: string | number; name: string; email: string; phone?: string; role: "admin" | "staff"; created_at?: string; last_login?: string };
type ActivityLog = { id: string | number; staff_name?: string; action?: string; description?: string; ip_address?: string; created_at?: string; details?: string };
function number(value: string | number | undefined) { const n = Number(value ?? 0); return Number.isFinite(n) ? n : 0; }
function errorText(error: unknown) { return error instanceof Error ? error.message : "The request could not be completed."; }

export function AdminPeople({ section }: { section: "customers" | "staff" | "activity-logs" }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminPage<Customer>["pagination"] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "staff", password: "" });

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    if (section === "customers") params.set("per_page", "50");
    if (section === "staff") { params.set("limit", "100"); if (roleFilter) params.set("role", roleFilter); }
    if (section === "activity-logs") params.set("limit", "50");
    setLoading(true); setError("");
    const path = section === "customers" ? `/admin/customers?${params}` : section === "staff" ? `/admin/staff?${params}` : `/admin/activity-logs?${params}`;
    adminRequest<AdminPage<Customer | Staff | ActivityLog> | Customer[] | Staff[] | ActivityLog[]>(path)
      .then((result) => {
        if (!active) return;
        const items = adminList<Customer | Staff | ActivityLog>(result);
        setPagination(Array.isArray(result) ? null : result.pagination || null);
        if (section === "customers") setCustomers(items as Customer[]);
        else if (section === "staff") setStaff(items as Staff[]);
        else setLogs(items as ActivityLog[]);
      })
      .catch((loadError) => { if (active) setError(errorText(loadError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [section, search, roleFilter, refreshKey, page]);

  async function viewCustomer(row: Customer) {
    setCustomer(null); setError(""); setSaving(true);
    try { const result = await adminRequest<CustomerDetail>(`/admin/customers/${encodeURIComponent(String(row.id))}`); setCustomer(result); }
    catch (detailError) { setError(errorText(detailError)); }
    finally { setSaving(false); }
  }

  function startCreate() { setEditing(""); setForm({ name: "", email: "", phone: "", role: "staff", password: "" }); setError(""); setNotice(""); }
  function startEdit(member: Staff) { setEditing(String(member.id)); setForm({ name: member.name || "", email: member.email || "", phone: member.phone || "", role: member.role || "staff", password: "" }); setError(""); setNotice(""); }

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const original = staff.find((member) => String(member.id) === editing);
      if (editing && original?.role === "admin" && form.role !== "admin") {
        let current: { id?: string | number; email?: string } | null = null;
        try { current = JSON.parse(window.localStorage.getItem("fc.user.v1") || "null") as { id?: string | number; email?: string } | null; } catch { current = null; }
        if (current && (String(current.id) === String(original.id) || current.email?.toLowerCase() === original.email.toLowerCase())) {
          setError("You cannot remove administrator access from your currently signed-in account."); return;
        }
        const admins = await adminRequest<AdminPage<Staff> | Staff[]>("/admin/staff?page=1&limit=100&role=admin");
        const adminCount = Array.isArray(admins) ? admins.length : admins.pagination?.total;
        if (adminCount === undefined || adminCount <= 1) { setError("This is the last administrator account. Promote another administrator before changing this role."); return; }
      }
      const body = { name: form.name, email: form.email, phone: form.phone, role: form.role, ...(form.password ? { password: form.password } : {}) };
      const result = await adminRequest<{ id?: number; temp_password?: string | null; password_source?: string }>(editing ? `/admin/staff/${encodeURIComponent(editing)}` : "/admin/staff", { method: editing ? "PUT" : "POST", body });
      const generated = !editing && result.temp_password ? ` Temporary password: ${result.temp_password}` : "";
      setNotice(`${editing ? "Staff member updated." : "Staff member created."}${generated}`); setEditing(null); setRefreshKey((value) => value + 1);
    } catch (saveError) { setError(errorText(saveError)); }
    finally { setSaving(false); }
  }

  async function deleteStaff(member: Staff) {
    setError(""); setNotice("");
    try {
      let current: { id?: string | number; email?: string } | null = null;
      try { current = JSON.parse(window.localStorage.getItem("fc.user.v1") || "null") as { id?: string | number; email?: string } | null; } catch { current = null; }
      if (current && (String(current.id) === String(member.id) || current.email?.toLowerCase() === member.email.toLowerCase())) {
        setError("You cannot remove your currently signed-in staff account."); return;
      }
      if (member.role === "admin") {
        const admins = await adminRequest<AdminPage<Staff> | Staff[]>("/admin/staff?page=1&limit=100&role=admin");
        const adminCount = Array.isArray(admins) ? admins.length : admins.pagination?.total;
        if (adminCount === undefined || adminCount <= 1) { setError("This is the last administrator account. Promote another administrator before removing it."); return; }
      }
      if (!window.confirm(`Remove staff account for ${member.name}? This cannot be undone.`)) return;
      await adminRequest(`/admin/staff/${encodeURIComponent(String(member.id))}`, { method: "DELETE" }); setNotice("Staff account removed."); setRefreshKey((value) => value + 1);
    }
    catch (deleteError) { setError(errorText(deleteError)); }
  }

  const titles = { customers: "Customers", staff: "Staff access", "activity-logs": "Activity logs" };

  return <div className="admin-people-view">
    {section !== "activity-logs" && <div className="admin-resource-toolbar"><p className="detail-copy">{section === "customers" ? "Review customer accounts, order history and saved information." : "Manage administrator and staff accounts."}</p><div className="admin-resource-actions"><input className="admin-search-input" aria-label={`Search ${section}`} placeholder={section === "customers" ? "Search name, email or phone" : "Search staff name or email"} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />{section === "staff" && <><select aria-label="Filter staff role" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}><option value="">All roles</option><option value="admin">Administrator</option><option value="staff">Staff</option></select><button className="button button-primary" type="button" onClick={startCreate}>Add staff member</button></>}</div></div>}
    {section === "activity-logs" && <div className="admin-resource-toolbar"><p className="detail-copy">Review administrative actions recorded by the API.</p></div>}
    {error && <p className="form-error admin-message" role="alert">{error}</p>}{notice && <p className="form-success admin-message" role="status">{notice}</p>}
    {loading && <p className="detail-copy" role="status">Loading {titles[section].toLowerCase()}…</p>}
    <AdminPagination pagination={pagination || null} onPageChange={setPage} />

    {section === "customers" && <div className="admin-people-layout"><section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Store accounts</p><h3>Customers</h3></div><span>{customers.length} shown</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Orders</th><th>Total spend</th><th></th></tr></thead><tbody>{customers.map((row) => <tr key={row.id} className={String(customer?.id) === String(row.id) ? "admin-selected-row" : ""}><td><strong>{row.name}</strong><small>{row.email}{row.phone ? ` · ${row.phone}` : ""}</small></td><td>{row.total_orders ?? 0}</td><td>{formatNaira(number(row.total_spent))}</td><td><button className="text-button" type="button" onClick={() => void viewCustomer(row)}>{saving && String(customer?.id) === String(row.id) ? "Loading…" : "View"}</button></td></tr>)}</tbody></table></div>{!loading && !customers.length && <p className="admin-empty-note">No customers found.</p>}</section>
      <section className="admin-panel admin-customer-detail">{!customer ? <div className="admin-empty-state"><p className="eyebrow">Customer profile</p><h3>Select a customer</h3><p className="detail-copy">Choose a customer to view saved addresses and recent orders.</p></div> : <><div className="admin-panel-heading"><div><p className="eyebrow">Customer details</p><h3>{customer.name}</h3></div><button className="text-button" type="button" onClick={() => setCustomer(null)}>Close</button></div><p>{customer.email}<br />{customer.phone || "No phone number"}</p><div className="admin-customer-stats"><span><strong>{customer.stats?.total_orders ?? customer.total_orders ?? 0}</strong> orders</span><span><strong>{formatNaira(number(customer.stats?.total_spent ?? customer.total_spent))}</strong> spent</span><span><strong>{customer.wishlist_count ?? 0}</strong> wishlist items</span></div><h4 className="admin-subheading">Saved addresses</h4>{customer.addresses?.length ? customer.addresses.map((address, index) => <p className="admin-customer-address" key={address.id || index}><strong>{address.label}</strong><br />{address.street_address}, {address.area}<br />{address.recipient_phone}</p>) : <p className="admin-empty-note">No saved addresses.</p>}<h4 className="admin-subheading">Recent orders</h4>{customer.orders?.length ? customer.orders.map((order, index) => <p className="admin-customer-address" key={order.id || index}><strong>{String(order.order_number || `#${order.id}`)}</strong> · {String(order.order_status || "")} · {formatNaira(number(order.total))}</p>) : <p className="admin-empty-note">No recent orders.</p>}</>}</section></div>}

    {section === "staff" && <>
      {editing !== null && <section className="admin-panel admin-staff-form-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Team accounts</p><h3>{editing ? "Edit staff member" : "Add a staff member"}</h3></div><button className="text-button" type="button" onClick={() => setEditing(null)}>Close</button></div><form className="admin-form-grid" onSubmit={saveStaff}><label>Full name<input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Phone (optional)<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="staff">Staff</option><option value="admin">Administrator</option></select></label><label className="admin-form-wide">{editing ? "New password (optional, minimum 6 characters)" : "Initial password (minimum 6 characters)"}<input required={!editing} minLength={6} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><div className="admin-form-actions admin-form-wide"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create staff account"}</button><p className="admin-form-note">The API’s reset-password and toggle-active routes currently only log an action; they are intentionally not shown as functional controls.</p></div></form></section>}
      <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Authorized users</p><h3>Staff accounts</h3></div><span>{staff.length} shown</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last login</th><th>Actions</th></tr></thead><tbody>{staff.map((member) => <tr key={member.id}><td><strong>{member.name}</strong><small>{member.phone || ""}</small></td><td>{member.email}</td><td><span className="admin-status-pill">{member.role}</span></td><td>{member.last_login || "—"}</td><td><button className="text-button" type="button" onClick={() => startEdit(member)}>Edit</button> <button className="text-button account-delete-button" type="button" onClick={() => void deleteStaff(member)}>Remove</button></td></tr>)}</tbody></table></div>{!loading && !staff.length && <p className="admin-empty-note">No staff accounts found.</p>}</section>
    </>}

    {section === "activity-logs" && <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Audit trail</p><h3>Recent admin actions</h3></div><span>{logs.length} shown</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>When</th><th>Staff member</th><th>Action</th><th>Details</th><th>IP address</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.created_at || "—"}</td><td>{log.staff_name || "—"}</td><td><span className="admin-status-pill">{(log.action || "unknown").replaceAll("_", " ")}</span></td><td>{log.description || log.details || "—"}</td><td>{log.ip_address || "—"}</td></tr>)}</tbody></table></div>{!loading && !logs.length && <p className="admin-empty-note">No activity is recorded yet.</p>}</section>}
  </div>;
}
