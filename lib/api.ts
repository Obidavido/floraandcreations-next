import type { Category, Product } from "./types";

export type AuthUser = { id?: string | number; name?: string; email?: string; phone?: string; role?: string };
export type AuthResult = { token?: string; user?: AuthUser; message?: string };
export type AdminSummary = {
  revenue?: { revenue_today?: string | number; revenue_this_week?: string | number; revenue_this_month?: string | number };
  total_orders?: string | number;
  total_customers?: string | number;
  pending_verification?: string | number;
  pending_fulfillment?: string | number;
  today_scheduled?: string | number;
  order_status_counts?: Array<{ order_status?: string; count?: string | number }>;
  payment_status_counts?: Array<{ payment_status?: string; count?: string | number }>;
  fulfillment_counts?: Array<{ fulfillment_type?: string; count?: string | number }>;
  recent_orders?: Array<{ id: string | number; order_number?: string; customer_name?: string; total?: string | number; order_status?: string; payment_status?: string; created_at?: string }>;
  top_products?: Array<{ id: string | number; name: string; total_sold?: string | number; total_revenue?: string | number }>;
};

const baseUrl = typeof window === "undefined"
  ? `${(process.env.API_ORIGIN || "https://floraandcreations.com").replace(/\/$/, "")}/api`
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");

type ApiProduct = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  base_price?: string | number;
  price?: string | number;
  status?: string;
  featured?: boolean | number;
  thumbnail?: string;
  image?: string;
  images?: Array<{ image_url?: string; url?: string }>;
  product_type?: Array<{ name?: string; slug?: string }>;
  category?: string;
};

type ApiCategory = { id: string | number; name: string; slug: string; type?: string };

function normalizeProductImage(image: unknown) {
  if (typeof image !== "string" || !image.trim()) return "";
  const value = image.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/api/")) return value;
  if (value.startsWith("/assets/")) return `/api${value}`;
  if (value.startsWith("assets/")) return `/api/${value}`;
  return value.startsWith("/") ? value : `/${value}`;
}

function mapProduct(product: ApiProduct): Product {
  const category = product.product_type?.[0]?.name || product.category || "Flowers";
  const detailImage = product.images?.find((image) => image.image_url || image.url);
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    description: product.description || product.name,
    price: Number(product.base_price ?? product.price ?? 0),
    category,
    image: normalizeProductImage(product.thumbnail || product.image || detailImage?.image_url || detailImage?.url),
    featured: Boolean(product.featured)
  };
}

function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (typeof window === "undefined" && !/^https?:\/\//i.test(baseUrl)) return null;
  try {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("fc.token.v1") : null;
    const response = await fetch(absoluteUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers
      },
      next: { revalidate: 60 }
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function authenticate(path: string, payload: Record<string, string>): Promise<AuthResult> {
  try {
    const response = await fetch(absoluteUrl(path), { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const validationErrors = body.errors && typeof body.errors === "object"
        ? Object.values(body.errors as Record<string, unknown>).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value): value is string => typeof value === "string").join(" ")
        : "";
      const message = typeof body.message === "string" ? body.message : typeof body.error === "string" ? body.error : validationErrors;
      throw new Error(message || "The details could not be accepted. Please check them and try again.");
    }
    const data = (body.data && typeof body.data === "object" ? body.data : body) as Record<string, unknown>;
    const token = typeof data.token === "string" ? data.token : typeof data.access_token === "string" ? data.access_token : undefined;
    const user = data.user && typeof data.user === "object" ? data.user as AuthUser : undefined;
    return { token, user, message: typeof body.message === "string" ? body.message : undefined };
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") throw error;
    throw new Error("We could not reach the account service. Please try again shortly.");
  }
}

export function signIn(payload: Record<string, string>) { return authenticate("/auth/login", payload); }
export function registerUser(payload: Record<string, string>) { return authenticate("/auth/register", payload); }

export async function getProducts(): Promise<Product[]> {
  const response = await request<{ data?: ApiProduct[] } | ApiProduct[]>("/products");
  const value = Array.isArray(response) ? response : response?.data || [];
  return value.filter((product) => product.status !== "inactive").map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const response = await request<ApiProduct | { data?: ApiProduct }>(`/products/${encodeURIComponent(slug)}`);
  if (!response) return null;
  const remote = "data" in response ? response.data : response;
  return remote && "id" in remote ? mapProduct(remote) : null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await request<{ product_type?: ApiCategory[] } | ApiCategory[]>("/categories");
  const value = Array.isArray(response) ? response : response?.product_type || [];
  const addOnSlugs = new Set(["cakes", "cards", "chocolates", "cookies", "fruit-wine", "picture-frames", "teddy-bears", "vases"]);
  return value
    .filter((category) => !addOnSlugs.has(category.slug.toLowerCase()))
    .map((category) => ({ id: String(category.id), name: category.name, slug: category.slug }));
}

export async function postContact(payload: Record<string, string>) {
  return request<{ message?: string }>("/contact", { method: "POST", body: JSON.stringify(payload) });
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("fc.token.v1") : null;
  if (!token) throw new Error("Your admin session has expired. Please sign in again.");
  const response = await fetch(absoluteUrl("/admin/stats/summary"), {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "The admin summary could not be loaded.");
  }
  return body as AdminSummary;
}
