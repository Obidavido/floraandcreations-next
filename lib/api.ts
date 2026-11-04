import type { Category, Product } from "./types";

const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");
const fallbackImage = "/hero-bouquet.webp";

export const referenceProducts: Product[] = [
  { id: "1", slug: "50-stems-premium-red-roses", name: "50 Stems Premium Red Roses", description: "A generous statement bouquet of premium red roses, arranged with care.", price: 125000, category: "Roses", image: fallbackImage, featured: true },
  { id: "2", slug: "50-stems-premium-red-roses-and-baby-s-breath", name: "50 Stems Red Roses & Baby's Breath", description: "Classic red roses softened with delicate baby's breath.", price: 135000, category: "Roses", image: fallbackImage, featured: true },
  { id: "3", slug: "50-stems-premium-red-and-white-roses", name: "50 Stems Red & White Roses", description: "A timeless contrast of red and white roses for meaningful occasions.", price: 145000, category: "Roses", image: fallbackImage, featured: true },
  { id: "4", slug: "mixed-coloured-rose-bouquet", name: "Mixed Coloured Rose Bouquet", description: "A joyful hand-tied bouquet with a garden-inspired mix of tones.", price: 95000, category: "Bouquets", image: fallbackImage, featured: true },
  { id: "5", slug: "all-red-roses-bouquet", name: "All Red Roses Bouquet", description: "A romantic bouquet designed for anniversaries, birthdays and declarations.", price: 85000, category: "Bouquets", image: fallbackImage, featured: true },
  { id: "6", slug: "bridal-bouquet", name: "Bridal Bouquet", description: "A softly gathered bridal design for the walk down the aisle.", price: 110000, category: "Weddings", image: fallbackImage },
  { id: "7", slug: "red-red-rose-bouquet", name: "Red Red Rose Bouquet", description: "A compact, elegant red rose arrangement with a refined finish.", price: 65000, category: "Bouquets", image: fallbackImage },
  { id: "8", slug: "premium-mixed-flowers", name: "Premium Mixed Flowers", description: "Seasonal colour and texture arranged as a thoughtful floral gift.", price: 100000, category: "Bouquets", image: fallbackImage },
  { id: "9", slug: "coloured-roses-and-statice", name: "Coloured Roses & Statice", description: "Fresh coloured roses with airy statice for a cheerful presentation.", price: 78000, category: "Bouquets", image: fallbackImage }
];

export const referenceCategories: Category[] = [
  { id: "1", slug: "bouquets", name: "Bouquets" },
  { id: "2", slug: "roses", name: "Roses" },
  { id: "3", slug: "gifts", name: "Gifts" },
  { id: "4", slug: "weddings", name: "Weddings" }
];

function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!/^https?:\/\//i.test(baseUrl)) return null;
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

function unwrap<T>(value: T | { data?: T; products?: T; categories?: T }): T {
  if (value && typeof value === "object") {
    const candidate = value as { data?: T; products?: T; categories?: T };
    return (candidate.data ?? candidate.products ?? candidate.categories ?? value) as T;
  }
  return value;
}

export async function getProducts(): Promise<Product[]> {
  const response = await request<Product[] | { data?: Product[]; products?: Product[] }>("/products");
  const value = unwrap(response || []);
  return Array.isArray(value) && value.length ? value : referenceProducts;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const local = referenceProducts.find((product) => product.slug === slug);
  const response = await request<Product | { data?: Product }>(`/products/${encodeURIComponent(slug)}`);
  const remote = response ? unwrap(response) : null;
  return (remote && !Array.isArray(remote) ? remote : local) || null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await request<Category[] | { data?: Category[]; categories?: Category[] }>("/categories");
  const value = unwrap(response || []);
  return Array.isArray(value) && value.length ? value : referenceCategories;
}

export async function postContact(payload: Record<string, string>) {
  return request<{ message?: string }>("/contact", { method: "POST", body: JSON.stringify(payload) });
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}
