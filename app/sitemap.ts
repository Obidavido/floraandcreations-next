import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/types";
import { referenceProducts } from "@/lib/api";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = ["/", "/shop", "/about", "/contact", "/faq"];
  return [...publicPaths.map((path) => ({ url: `${SITE_ORIGIN}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })), ...referenceProducts.map((product) => ({ url: `${SITE_ORIGIN}/products/${product.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 }))];
}
