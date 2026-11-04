export type AdminPage<T> = { data: T[]; pagination?: { total?: number; current_page?: number; per_page?: number; last_page?: number } };

const DEFAULT_API_ORIGIN = "https://api.floraandcreations.com";
const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const API_ROOT = configuredApiBase && /^https?:\/\//i.test(configuredApiBase)
  ? configuredApiBase.replace(/\/$/, "")
  : `${process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, "") || DEFAULT_API_ORIGIN}/api`;
const API_ORIGIN = API_ROOT.replace(/\/api\/?$/, "");

export function adminMediaUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  if (clean.startsWith("api/")) return `${API_ORIGIN}/${clean}`;
  if (clean.startsWith("assets/")) return `${API_ORIGIN}/api/${clean}`;
  return `${API_ROOT}/${clean}`;
}

export function adminList<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && Array.isArray((result as { data?: unknown }).data)) return (result as { data: T[] }).data;
  return [];
}

export async function adminRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("fc.token.v1") : null;
  if (!token) throw new Error("Your admin session is missing. Please sign in again.");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body === undefined || isFormData ? {} : { "Content-Type": "application/json" })
    },
    ...(options.body === undefined ? {} : { body: isFormData ? options.body as FormData : JSON.stringify(options.body) }),
    cache: "no-store"
  });
  if (response.status === 204) return undefined as T;
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const details = result.errors && typeof result.errors === "object"
      ? Object.values(result.errors as Record<string, unknown>).flatMap((value) => Array.isArray(value) ? value : [value]).filter((value): value is string => typeof value === "string").join(" ")
      : "";
    if (response.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("fc.token.v1");
      window.localStorage.removeItem("fc.user.v1");
      window.dispatchEvent(new Event("flora-admin-session-expired"));
    }
    throw new Error(typeof result.message === "string" ? result.message : details || (typeof result.error === "string" ? result.error : `Request failed (${response.status}).`));
  }
  return result as T;
}
