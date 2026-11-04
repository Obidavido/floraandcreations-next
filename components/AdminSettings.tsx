"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminRequest } from "@/lib/admin-api";

type Setting = { key: string; value: string | number | boolean | null; group: string };
type SettingsMap = Record<string, Setting>;
function errorText(error: unknown) { return error instanceof Error ? error.message : "The request could not be completed."; }
function label(key: string) { return key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [newSetting, setNewSetting] = useState({ setting_key: "", setting_value: "", group_name: "general" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    adminRequest<Record<string, Record<string, { key?: string; value?: string | number | boolean | null; group?: string }>>>("/admin/settings")
      .then((grouped) => {
        if (!active) return;
        const flat: SettingsMap = {};
        Object.entries(grouped || {}).forEach(([groupName, members]) => {
          Object.entries(members || {}).forEach(([key, item]) => {
            const settingKey = item?.key || key;
            flat[settingKey] = { key: settingKey, value: item?.value ?? "", group: item?.group || groupName };
          });
        });
        setSettings(flat);
        setValues(Object.fromEntries(Object.values(flat).map((item) => [item.key, String(item.value ?? "")] )));
      })
      .catch((loadError) => { if (active) setError(errorText(loadError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const result = await adminRequest<{ message?: string; updated?: string[]; not_found?: string[] }>("/admin/settings", { method: "POST", body: values });
      const missing = result.not_found?.length ? ` Not found: ${result.not_found.join(", ")}.` : "";
      setNotice(`${result.message || "Settings saved."}${missing}`); setRefreshKey((key) => key + 1);
    } catch (saveError) { setError(errorText(saveError)); }
    finally { setSaving(false); }
  }

  async function createSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const result = await adminRequest<{ message?: string }>("/admin/settings/create", { method: "POST", body: newSetting });
      setNotice(result.message || "Setting created."); setNewSetting({ setting_key: "", setting_value: "", group_name: "general" }); setRefreshKey((key) => key + 1);
    } catch (createError) { setError(errorText(createError)); }
    finally { setSaving(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (passwordForm.new_password !== passwordForm.confirm_password) { setError("The new passwords do not match."); return; }
    setSaving(true);
    try {
      const result = await adminRequest<{ message?: string }>("/admin/change-password", { method: "POST", body: { current_password: passwordForm.current_password, new_password: passwordForm.new_password } });
      setNotice(result.message || "Password updated successfully."); setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (changeError) { setError(errorText(changeError)); }
    finally { setSaving(false); }
  }

  const grouped = Object.values(settings).reduce<Record<string, Setting[]>>((result, setting) => {
    (result[setting.group] ||= []).push(setting); return result;
  }, {});

  return <div className="admin-settings-view">
    <div className="admin-resource-toolbar"><p className="detail-copy">Update store configuration and secure your administrator account.</p></div>
    {error && <p className="form-error admin-message" role="alert">{error}</p>}{notice && <p className="form-success admin-message" role="status">{notice}</p>}{loading && <p className="detail-copy" role="status">Loading settings…</p>}
    <section className="admin-panel admin-settings-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Store configuration</p><h3>Business settings</h3></div></div>
      {!Object.keys(settings).length && !loading ? <p className="admin-empty-note">No settings have been created yet.</p> : <form onSubmit={saveSettings}>
        {Object.entries(grouped).map(([groupName, entries]) => <fieldset className="admin-settings-group" key={groupName}><legend>{label(groupName)}</legend><div className="admin-form-grid">{entries.map((setting) => <label key={setting.key}>{label(setting.key)}<input type={/(password|secret|token|key)/i.test(setting.key) ? "password" : "text"} value={values[setting.key] ?? ""} onChange={(event) => setValues({ ...values, [setting.key]: event.target.value })} autoComplete="off" /></label>)}</div></fieldset>)}
        <button className="button button-primary" type="submit" disabled={saving || !Object.keys(settings).length}>{saving ? "Saving…" : "Save business settings"}</button>
      </form>}
    </section>
    <div className="admin-settings-lower">
      <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Add a configuration key</p><h3>New setting</h3></div></div><form className="admin-form-grid" onSubmit={createSetting}><label>Setting key<input required value={newSetting.setting_key} onChange={(event) => setNewSetting({ ...newSetting, setting_key: event.target.value })} placeholder="example_setting" /></label><label>Group<input value={newSetting.group_name} onChange={(event) => setNewSetting({ ...newSetting, group_name: event.target.value })} /></label><label className="admin-form-wide">Value<textarea required rows={3} value={newSetting.setting_value} onChange={(event) => setNewSetting({ ...newSetting, setting_value: event.target.value })} /></label><div className="admin-form-actions admin-form-wide"><button className="button button-secondary" type="submit" disabled={saving}>{saving ? "Saving…" : "Create setting"}</button></div></form><p className="admin-form-note">The API does not validate setting values against an application schema. Only add keys you have confirmed the storefront uses.</p></section>
      <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Administrator account</p><h3>Change password</h3></div></div><form className="admin-form-grid" onSubmit={changePassword}><label className="admin-form-wide">Current password<input required type="password" autoComplete="current-password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} /></label><label>New password<input required minLength={8} type="password" autoComplete="new-password" value={passwordForm.new_password} onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })} /></label><label>Confirm new password<input required minLength={8} type="password" autoComplete="new-password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })} /></label><div className="admin-form-actions admin-form-wide"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Updating…" : "Change password"}</button></div></form></section>
    </div>
  </div>;
}
