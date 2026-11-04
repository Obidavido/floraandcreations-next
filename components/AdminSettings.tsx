"use client";

import { FormEvent, useState } from "react";
import { adminRequest } from "@/lib/admin-api";

function errorText(error: unknown) { return error instanceof Error ? error.message : "The request could not be completed."; }

export function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (passwordForm.new_password !== passwordForm.confirm_password) { setError("The new passwords do not match."); return; }
    setSaving(true);
    try {
      const result = await adminRequest<{ message?: string }>("/admin/change-password", { method: "POST", body: { current_password: passwordForm.current_password, new_password: passwordForm.new_password } });
      setNotice(result.message || "Password updated successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (changeError) { setError(errorText(changeError)); }
    finally { setSaving(false); }
  }

  return <div className="admin-settings-view admin-password-settings">
    <div className="admin-resource-toolbar"><p className="detail-copy">Keep your administrator account secure by updating your password.</p></div>
    {error && <p className="form-error admin-message" role="alert">{error}</p>}
    {notice && <p className="form-success admin-message" role="status">{notice}</p>}
    <section className="admin-panel admin-settings-panel admin-password-panel">
      <div className="admin-panel-heading"><div><p className="eyebrow">Administrator account</p><h3>Change password</h3></div></div>
      <form className="admin-form-grid" onSubmit={changePassword}>
        <label className="admin-form-wide">Current password<input required type="password" autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} /></label>
        <label>New password<input required minLength={8} type="password" autoComplete="new-password" value={passwordForm.new_password} onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })} /></label>
        <label>Confirm new password<input required minLength={8} type="password" autoComplete="new-password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })} /></label>
        <p className="admin-form-note admin-form-wide">Use at least 8 characters and avoid reusing a password from another service.</p>
        <div className="admin-form-actions admin-form-wide"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Updating…" : "Change password"}</button></div>
      </form>
    </section>
  </div>;
}
