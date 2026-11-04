export type AccountOrderItem = {
  id?: string | number;
  product_name?: string;
  product_slug?: string;
  quantity?: string | number;
  unit_price?: string | number;
  line_total?: string | number;
  variant?: { size?: string; color?: string } | null;
  add_ons?: Array<{ add_on_name?: string; price?: string | number; custom_message?: string }>;
};

export type AccountOrder = {
  id: string | number;
  order_number?: string;
  order_status?: string;
  payment_status?: string;
  fulfillment_type?: string;
  scheduled_date?: string | null;
  scheduled_time_slot?: string | null;
  subtotal?: string | number;
  delivery_fee?: string | number;
  total?: string | number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address?: string;
  gift_note?: string | null;
  created_at?: string;
  item_count?: string | number;
  items?: AccountOrderItem[];
};

export type AccountAddress = {
  id: string | number;
  label: string;
  recipient_name: string;
  recipient_phone: string;
  area: string;
  street_address: string;
  landmark?: string | null;
};

export type DeliveryZone = { id: string | number; area_name: string; fee: string | number };
export type WishlistProduct = { id: string | number; name: string; slug: string; base_price: string | number; featured?: boolean | number; status?: string };
export type Paginated<T> = { data: T[]; pagination?: { total?: number; current_page?: number; per_page?: number; last_page?: number } };

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");

export async function accountRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("fc.token.v1") : null;
  if (!token) throw new Error("Please sign in to access your account.");
  const response = await fetch(`${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" })
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    cache: "no-store"
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const validationErrors = body.errors && typeof body.errors === "object"
      ? Object.values(body.errors as Record<string, unknown>).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value): value is string => typeof value === "string").join(" ")
      : "";
    throw new Error(typeof body.error === "string" ? body.error : typeof body.message === "string" ? body.message : validationErrors || "We could not complete that request.");
  }
  return body as T;
}
