"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminPagination } from "@/components/AdminPagination";
import { adminList, adminMediaUrl, adminRequest, type AdminPage } from "@/lib/admin-api";
import { formatNaira } from "@/lib/api";

type ProductRow = { id: string | number; name: string; slug?: string; description?: string; base_price?: string | number; status?: string; featured?: boolean | number; thumbnail?: string; category_count?: number; variant_count?: number; category_ids?: Array<string | number>; images?: Array<{ id?: string | number; image_url?: string }>; variants?: VariantRow[] };
type CategoryRow = { id: string | number; name: string; slug?: string; type: string; product_count?: number };
type AddOnRow = { id: string | number; name: string; price: string | number; type?: string; active?: boolean | number };
type ZoneRow = { id: string | number; area_name: string; fee: string | number };
type VariantRow = { id: string | number; size?: string; color?: string; price: string | number; stock_status: string; sku?: string };

type ProductFormState = { name: string; description: string; base_price: string; status: string; featured: boolean; category_ids: string[] };
const emptyProduct: ProductFormState = { name: "", description: "", base_price: "", status: "active", featured: false, category_ids: [] };
const stockOptions = ["in_stock", "made_to_order", "out_of_stock"];

function showError(error: unknown) { return error instanceof Error ? error.message : "The request could not be completed."; }
function asNumber(value: string | number | undefined) { const n = Number(value ?? 0); return Number.isFinite(n) ? n : 0; }

export function AdminCatalog({ section, standalone }: { section: "products" | "categories" | "add-ons" | "delivery-zones"; standalone?: "new" | string }) {
  const router = useRouter();
  const isStandalone = Boolean(standalone);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [addOns, setAddOns] = useState<AddOnRow[]>([]);
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminPage<ProductRow>["pagination"] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editingProduct, setEditingProduct] = useState<string | null>(standalone === "new" ? "" : standalone || null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProduct);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [variantForm, setVariantForm] = useState({ size: "", color: "", price: "", stock_status: "in_stock", sku: "" });
  const [variantImageFiles, setVariantImageFiles] = useState<File[]>([]);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", type: "product_type" });
  const [addOnForm, setAddOnForm] = useState({ name: "", price: "", type: "default", active: true });
  const [zoneForm, setZoneForm] = useState({ area_name: "", fee: "" });

  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setNotice("");
    const load = async () => {
      try {
        if (section === "products") {
          const params = new URLSearchParams({ page: String(page), per_page: "12" });
          if (query.trim()) params.set("search", query.trim());
          const [productData, categoryData] = await Promise.all([
            adminRequest<AdminPage<ProductRow> | ProductRow[]>(`/admin/products?${params}`),
            adminRequest<CategoryRow[]>("/admin/categories")
          ]);
          if (active) { setProducts(adminList<ProductRow>(productData)); setCategories(adminList<CategoryRow>(categoryData)); setPagination(Array.isArray(productData) ? null : productData.pagination || null); }
        } else if (section === "categories") {
          const result = await adminRequest<CategoryRow[]>("/admin/categories");
          if (active) { setCategories(adminList<CategoryRow>(result)); setPagination(null); }
        } else if (section === "add-ons") {
          const result = await adminRequest<AddOnRow[]>("/admin/add-ons");
          if (active) { setAddOns(adminList<AddOnRow>(result)); setPagination(null); }
        } else {
          const result = await adminRequest<ZoneRow[]>("/admin/delivery-zones");
          if (active) { setZones(adminList<ZoneRow>(result)); setPagination(null); }
        }
      } catch (loadError) { if (active) setError(showError(loadError)); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [section, refreshKey, query, page]);

  useEffect(() => {
    if (section !== "products" || !standalone || standalone === "new") return;
    let active = true;
    setSaving(true);
    adminRequest<ProductRow>(`/admin/products/${encodeURIComponent(standalone)}`)
      .then((detail) => {
        if (!active) return;
        setEditingProduct(String(detail.id));
        setProductForm({ name: detail.name || "", description: detail.description || "", base_price: String(detail.base_price ?? ""), status: detail.status || "active", featured: detail.featured === true || Number(detail.featured) === 1, category_ids: (detail.category_ids || []).map(String) });
        setSelectedProduct(detail);
        setVariants(detail.variants || []);
      })
      .catch((detailError) => { if (active) setError(showError(detailError)); })
      .finally(() => { if (active) setSaving(false); });
    return () => { active = false; };
  }, [section, standalone]);

  async function openProduct(product?: ProductRow) {
    setError(""); setNotice(""); setImageFiles([]); setVariants([]); setSelectedProduct(null); setEditingVariant(null);
    if (!product) { setEditingProduct(""); setProductForm(emptyProduct); return; }
    setSaving(true);
    try {
      const detail = await adminRequest<ProductRow>(`/admin/products/${encodeURIComponent(String(product.id))}`);
      setEditingProduct(String(detail.id));
      setProductForm({ name: detail.name || "", description: detail.description || "", base_price: String(detail.base_price ?? ""), status: detail.status || "active", featured: detail.featured === true || Number(detail.featured) === 1, category_ids: (detail.category_ids || []).map(String) });
      setSelectedProduct(detail);
      setVariants(detail.variants || []);
    } catch (detailError) { setError(showError(detailError)); }
    finally { setSaving(false); }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const path = editingProduct ? `/admin/products/${encodeURIComponent(editingProduct)}` : "/admin/products";
      const result = await adminRequest<ProductRow>(path, { method: editingProduct ? "PUT" : "POST", body: { ...productForm, base_price: Number(productForm.base_price), category_ids: productForm.category_ids } });
      const id = editingProduct || String(result.id || "");
      if (id && imageFiles.length) {
        const data = new FormData(); imageFiles.forEach((file) => data.append("images[]", file));
        await adminRequest(`/admin/products/${encodeURIComponent(id)}/images`, { method: "POST", body: data });
      }
      if (isStandalone) { router.push("/admin/products"); return; }
      setNotice(editingProduct ? "Product changes saved." : "Product created."); setEditingProduct(null); setProductForm(emptyProduct); setImageFiles([]); setSelectedProduct(null); setRefreshKey((value) => value + 1);
    } catch (saveError) { setError(showError(saveError)); }
    finally { setSaving(false); }
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`Delete “${product.name}”? If it has order history, the API may require archiving it instead.`)) return;
    setError(""); setNotice("");
    try { await adminRequest(`/admin/products/${encodeURIComponent(String(product.id))}`, { method: "DELETE" }); setNotice("Product deleted."); setRefreshKey((value) => value + 1); }
    catch (deleteError) { setError(showError(deleteError)); }
  }

  async function saveVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedProduct) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const path = editingVariant ? `/admin/variants/${encodeURIComponent(editingVariant)}` : `/admin/products/${encodeURIComponent(String(selectedProduct.id))}/variants`;
      const saved = await adminRequest<VariantRow>(path, { method: editingVariant ? "PUT" : "POST", body: { ...variantForm, price: Number(variantForm.price) } });
      const variantId = editingVariant || String(saved.id || "");
      if (variantId && variantImageFiles.length) {
        const data = new FormData();
        variantImageFiles.forEach((file) => data.append("images[]", file));
        await adminRequest(`/admin/variants/${encodeURIComponent(variantId)}/images`, { method: "POST", body: data });
      }
      const result = await adminRequest<VariantRow[]>(`/admin/products/${encodeURIComponent(String(selectedProduct.id))}/variants`);
      setVariants(adminList<VariantRow>(result)); setVariantForm({ size: "", color: "", price: "", stock_status: "in_stock", sku: "" }); setVariantImageFiles([]); setEditingVariant(null); setNotice("Variant saved.");
    } catch (variantError) { setError(showError(variantError)); }
    finally { setSaving(false); }
  }

  async function deleteVariant(variant: VariantRow) {
    if (!window.confirm("Delete this product variant?")) return;
    setError("");
    try {
      await adminRequest(`/admin/variants/${encodeURIComponent(String(variant.id))}`, { method: "DELETE" });
      setVariants((items) => items.filter((item) => String(item.id) !== String(variant.id)));
      setNotice("Variant deleted.");
    } catch (variantError) { setError(showError(variantError)); }
  }

  async function submitBasicResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      let path = ""; let body: Record<string, unknown> = {}; let method = editingId ? "PUT" : "POST";
      if (section === "categories") { path = editingId ? `/admin/categories/${encodeURIComponent(editingId)}` : "/admin/categories"; body = categoryForm; }
      else if (section === "add-ons") { path = editingId ? `/admin/add-ons/${encodeURIComponent(editingId)}` : "/admin/add-ons"; body = { ...addOnForm, price: Number(addOnForm.price), active: addOnForm.active ? 1 : 0 }; }
      else { path = editingId ? `/admin/delivery-zones/${encodeURIComponent(editingId)}` : "/admin/delivery-zones"; body = { ...zoneForm, fee: Number(zoneForm.fee) }; }
      await adminRequest(path, { method, body });
      setEditingId(null); setCategoryForm({ name: "", type: "product_type" }); setAddOnForm({ name: "", price: "", type: "default", active: true }); setZoneForm({ area_name: "", fee: "" }); setNotice(editingId ? "Changes saved." : "Item created."); setRefreshKey((value) => value + 1);
    } catch (saveError) { setError(showError(saveError)); }
    finally { setSaving(false); }
  }

  function editBasicResource(item: CategoryRow | AddOnRow | ZoneRow) {
    setEditingId(String(item.id)); setError(""); setNotice("");
    if (section === "categories") { const category = item as CategoryRow; setCategoryForm({ name: category.name, type: category.type }); }
    else if (section === "add-ons") { const addOn = item as AddOnRow; setAddOnForm({ name: addOn.name, price: String(addOn.price), type: addOn.type || "default", active: addOn.active === true || Number(addOn.active) === 1 }); }
    else { const zone = item as ZoneRow; setZoneForm({ area_name: zone.area_name, fee: String(zone.fee) }); }
  }

  async function deleteBasicResource(id: string | number, label: string) {
    if (!window.confirm(`Delete “${label}”?`)) return;
    const path = section === "categories" ? `/admin/categories/${id}` : section === "add-ons" ? `/admin/add-ons/${id}` : `/admin/delivery-zones/${id}`;
    setError(""); setNotice("");
    try { await adminRequest(path, { method: "DELETE" }); setNotice("Item deleted."); setRefreshKey((value) => value + 1); }
    catch (deleteError) { setError(showError(deleteError)); }
  }

  const titles = { products: "Product catalog", categories: "Categories", "add-ons": "Gift add-ons", "delivery-zones": "Delivery zones" };

  return <div className="admin-resource-view">
    <div className="admin-resource-toolbar">
      <p className="detail-copy">{section === "products" ? "Manage products, prices, visibility, images and variants." : section === "categories" ? "Organize products by type and occasion." : section === "add-ons" ? "Manage optional gifts and extras offered at checkout." : "Set delivery areas and their fees."}</p>
      {section === "products" && !isStandalone ? <div className="admin-resource-actions"><input aria-label="Search products" className="admin-search-input" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search products…" /><Link className="button button-primary" href="/admin/products/new">Add product</Link></div> : null}
    </div>
    {section === "products" && !isStandalone && <AdminPagination pagination={pagination || null} onPageChange={setPage} />}
    {error && <p className="form-error admin-message" role="alert">{error}</p>}{notice && <p className="form-success admin-message" role="status">{notice}</p>}
    {loading && <p className="detail-copy" role="status">Loading {titles[section].toLowerCase()}…</p>}

    {section === "products" && <>
      {(isStandalone || editingProduct !== null || (selectedProduct === null && productForm.name !== "")) && <section className="admin-panel admin-form-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">Catalog</p><h3>{editingProduct ? "Edit product" : "New product"}</h3></div><button className="text-button" type="button" onClick={() => isStandalone ? router.push("/admin/products") : (setEditingProduct(null), setSelectedProduct(null), setProductForm(emptyProduct), setImageFiles([]))}>{isStandalone ? "Back to products" : "Close"}</button></div>
        <form className="admin-form-grid" onSubmit={saveProduct}>
          <label>Product name<input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} /></label>
          <label>Price (NGN)<input required min="0" step="0.01" type="number" value={productForm.base_price} onChange={(event) => setProductForm({ ...productForm, base_price: event.target.value })} /></label>
          <label className="admin-form-wide">Description<textarea required rows={4} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label>
          <label>Status<select value={productForm.status} onChange={(event) => setProductForm({ ...productForm, status: event.target.value })}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
          <label className="admin-check-label"><input type="checkbox" checked={productForm.featured} onChange={(event) => setProductForm({ ...productForm, featured: event.target.checked })} /> Featured product</label>
          <fieldset className="admin-form-wide admin-checkbox-group"><legend>Product categories and occasions</legend>{categories.map((category) => <label key={category.id}><input type="checkbox" checked={productForm.category_ids.includes(String(category.id))} onChange={(event) => setProductForm({ ...productForm, category_ids: event.target.checked ? [...productForm.category_ids, String(category.id)] : productForm.category_ids.filter((id) => id !== String(category.id)) })} /> {category.name} <small>({category.type.replaceAll("_", " ")})</small></label>)}{categories.length === 0 && <p className="detail-copy">Create a product category first.</p>}</fieldset>
          {selectedProduct?.images?.length ? <div className="admin-form-wide admin-existing-images"><p>Current product images</p><div>{selectedProduct.images.map((image, index) => image.image_url ? <Image key={image.id || image.image_url} src={adminMediaUrl(image.image_url)} alt={`${selectedProduct.name} image ${index + 1}`} width={72} height={72} sizes="72px" /> : null)}</div></div> : null}
          <label className="admin-form-wide">Add product images<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setImageFiles(Array.from(event.target.files || []))} /><small>New images are optimized to WebP by Next during delivery. Existing images remain in place.</small></label>
          <div className="admin-form-actions admin-form-wide"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editingProduct ? "Save product" : "Create product"}</button>{editingProduct && <button className="button button-secondary" type="button" onClick={() => { setEditingProduct(null); setSelectedProduct(null); setProductForm(emptyProduct); }}>Cancel</button>}</div>
        </form>
        {editingProduct && selectedProduct && <div className="admin-variant-manager">
          <div className="admin-panel-heading"><div><p className="eyebrow">Variants</p><h3>Sizes, colours &amp; stock</h3></div></div>
          {variants.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Size / colour</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{variants.map((variant) => <tr key={variant.id}><td>{[variant.size, variant.color].filter(Boolean).join(" · ") || "Standard"}</td><td>{variant.sku || "—"}</td><td>{formatNaira(asNumber(variant.price))}</td><td>{variant.stock_status.replaceAll("_", " ")}</td><td><button className="text-button" type="button" onClick={() => { setEditingVariant(String(variant.id)); setVariantForm({ size: variant.size || "", color: variant.color || "", price: String(variant.price), stock_status: variant.stock_status, sku: variant.sku || "" }); }}>Edit</button> <button className="text-button account-delete-button" type="button" onClick={() => void deleteVariant(variant)}>Delete</button></td></tr>)}</tbody></table></div>}
          <form className="admin-form-grid admin-variant-form" onSubmit={saveVariant}><label>Size<input value={variantForm.size} onChange={(event) => setVariantForm({ ...variantForm, size: event.target.value })} /></label><label>Colour<input value={variantForm.color} onChange={(event) => setVariantForm({ ...variantForm, color: event.target.value })} /></label><label>Price<input required type="number" min="0" step="0.01" value={variantForm.price} onChange={(event) => setVariantForm({ ...variantForm, price: event.target.value })} /></label><label>Stock<select value={variantForm.stock_status} onChange={(event) => setVariantForm({ ...variantForm, stock_status: event.target.value })}>{stockOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label>SKU (optional)<input value={variantForm.sku} onChange={(event) => setVariantForm({ ...variantForm, sku: event.target.value })} /></label><label className="admin-form-wide">Variant images<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setVariantImageFiles(Array.from(event.target.files || []))} /><small>Images upload after the variant is saved.</small></label><div className="admin-form-actions"><button className="button button-secondary" type="submit" disabled={saving}>{saving ? "Saving…" : editingVariant ? "Update variant" : "Add variant"}</button>{editingVariant && <button className="text-button" type="button" onClick={() => { setEditingVariant(null); setVariantImageFiles([]); setVariantForm({ size: "", color: "", price: "", stock_status: "in_stock", sku: "" }); }}>Cancel</button>}</div></form>
        </div>}
      </section>}
      {!isStandalone && !loading && products.length === 0 && <div className="admin-panel admin-empty-state"><h3>No products found</h3><p className="detail-copy">Create a product or adjust the search.</p><Link className="button button-primary" href="/admin/products/new">Add product</Link></div>}
      {!isStandalone && products.length > 0 && <div className="admin-panel admin-table-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Status</th><th>Categories</th><th>Variants</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell">{product.thumbnail ? <Image src={adminMediaUrl(product.thumbnail)} alt="" width={42} height={42} sizes="42px" /> : <span className="admin-product-placeholder">F</span>}<span><strong>{product.name}</strong><small>{product.slug}</small></span></div></td><td>{formatNaira(asNumber(product.base_price))}</td><td><span className="admin-status-pill">{product.status || "active"}{product.featured === true || Number(product.featured) === 1 ? " · featured" : ""}</span></td><td>{product.category_count ?? "—"}</td><td>{product.variant_count ?? "—"}</td><td><Link className="text-button" href={`/admin/products/${product.id}/edit`}>Edit</Link> <button className="text-button account-delete-button" type="button" onClick={() => void deleteProduct(product)}>Delete</button></td></tr>)}</tbody></table></div></div>}
    </>}

    {section !== "products" && <div className="admin-catalog-layout">
      <section className="admin-panel admin-form-panel"><div className="admin-panel-heading"><div><p className="eyebrow">{titles[section]}</p><h3>{editingId ? "Edit item" : "Add item"}</h3></div>{editingId && <button className="text-button" type="button" onClick={() => { setEditingId(null); setCategoryForm({ name: "", type: "product_type" }); setAddOnForm({ name: "", price: "", type: "default", active: true }); setZoneForm({ area_name: "", fee: "" }); }}>Cancel</button>}</div>
        <form className="admin-form-grid" onSubmit={submitBasicResource}>
          {section === "categories" && <><label>Name<input required minLength={2} value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} /></label><label>Category type<select value={categoryForm.type} onChange={(event) => setCategoryForm({ ...categoryForm, type: event.target.value })}><option value="product_type">Product type</option><option value="occasion">Occasion</option></select></label></>}
          {section === "add-ons" && <><label>Name<input required value={addOnForm.name} onChange={(event) => setAddOnForm({ ...addOnForm, name: event.target.value })} /></label><label>Price (NGN)<input required min="0" step="0.01" type="number" value={addOnForm.price} onChange={(event) => setAddOnForm({ ...addOnForm, price: event.target.value })} /></label><label>Type<input value={addOnForm.type} onChange={(event) => setAddOnForm({ ...addOnForm, type: event.target.value })} placeholder="default" /></label><label className="admin-check-label"><input type="checkbox" checked={addOnForm.active} onChange={(event) => setAddOnForm({ ...addOnForm, active: event.target.checked })} /> Available at checkout</label></>}
          {section === "delivery-zones" && <><label>Area name<input required value={zoneForm.area_name} onChange={(event) => setZoneForm({ ...zoneForm, area_name: event.target.value })} /></label><label>Delivery fee (NGN)<input required min="0" step="0.01" type="number" value={zoneForm.fee} onChange={(event) => setZoneForm({ ...zoneForm, fee: event.target.value })} /></label></>}
          <div className="admin-form-actions admin-form-wide"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create"}</button></div>
        </form>
      </section>
      <section className="admin-panel admin-table-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Current entries</p><h3>{titles[section]}</h3></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr>{section === "categories" ? <><th>Name</th><th>Type</th><th>Products</th><th>Actions</th></> : section === "add-ons" ? <><th>Name</th><th>Price</th><th>Type</th><th>State</th><th>Actions</th></> : <><th>Area</th><th>Fee</th><th>Actions</th></>}</tr></thead><tbody>
        {section === "categories" && categories.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.slug}</small></td><td>{item.type.replaceAll("_", " ")}</td><td>{item.product_count ?? 0}</td><td><button className="text-button" type="button" onClick={() => editBasicResource(item)}>Edit</button> <button className="text-button account-delete-button" type="button" onClick={() => void deleteBasicResource(item.id, item.name)}>Delete</button></td></tr>)}
        {section === "add-ons" && addOns.map((item) => <tr key={item.id}><td>{item.name}</td><td>{formatNaira(asNumber(item.price))}</td><td>{item.type || "default"}</td><td><span className="admin-status-pill">{item.active === true || Number(item.active) === 1 ? "Active" : "Inactive"}</span></td><td><button className="text-button" type="button" onClick={() => editBasicResource(item)}>Edit</button> <button className="text-button account-delete-button" type="button" onClick={() => void deleteBasicResource(item.id, item.name)}>Delete</button></td></tr>)}
        {section === "delivery-zones" && zones.map((item) => <tr key={item.id}><td>{item.area_name}</td><td>{formatNaira(asNumber(item.fee))}</td><td><button className="text-button" type="button" onClick={() => editBasicResource(item)}>Edit</button> <button className="text-button account-delete-button" type="button" onClick={() => void deleteBasicResource(item.id, item.area_name)}>Delete</button></td></tr>)}
        </tbody></table>{!loading && ((section === "categories" && !categories.length) || (section === "add-ons" && !addOns.length) || (section === "delivery-zones" && !zones.length)) && <p className="admin-empty-note">No entries to show.</p>}</div></section>
    </div>}
  </div>;
}
