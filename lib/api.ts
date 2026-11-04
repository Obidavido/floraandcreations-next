import type { Category, Product } from "./types";

export type AuthUser = { id?: string | number; name?: string; email?: string; phone?: string };
export type AuthResult = { token?: string; user?: AuthUser; message?: string };

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

function normalizeProducts(products: Product[]) {
  return products.map((product) => ({ ...product, image: normalizeProductImage(product.image) }));
}

function mapProduct(product: ApiProduct): Product {
  const category = product.product_type?.[0]?.name || product.category || "Flowers";
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    description: product.description || product.name,
    price: Number(product.base_price ?? product.price ?? 0),
    category,
    image: normalizeProductImage(product.thumbnail || product.image),
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
    if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "The details could not be accepted. Please check them and try again.");
    const data = (body.data && typeof body.data === "object" ? body.data : body) as Record<string, unknown>;
    const token = typeof data.token === "string" ? data.token : typeof data.access_token === "string" ? data.access_token : undefined;
    const user = data.user && typeof data.user === "object" ? data.user as AuthUser : undefined;
    return { token, user, message: typeof body.message === "string" ? body.message : undefined };
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") throw error;
    throw new Error("We could not reach the account service. Please try again shortly.");
  }
}

export function signIn(payload: Record<string, string>) { return authenticate("/login", payload); }
export function registerUser(payload: Record<string, string>) { return authenticate("/register", payload); }

function unwrap<T>(value: T | { data?: T; products?: T; categories?: T }): T {
  if (value && typeof value === "object") {
    const candidate = value as { data?: T; products?: T; categories?: T };
    return (candidate.data ?? candidate.products ?? candidate.categories ?? value) as T;
  }
  return value;
}

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
  return value.map((category) => ({ id: String(category.id), name: category.name, slug: category.slug }));
}

export async function postContact(payload: Record<string, string>) {
  return request<{ message?: string }>("/contact", { method: "POST", body: JSON.stringify(payload) });
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}
