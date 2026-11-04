import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/types";
import { getProducts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPaths = ["/", "/shop", "/about", "/contact", "/faq"];
  const products = await getProducts();
  return [...publicPaths.map((path) => ({ url: `${SITE_ORIGIN}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })), ...products.map((product) => ({ url: `${SITE_ORIGIN}/products/${product.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 }))];
}
