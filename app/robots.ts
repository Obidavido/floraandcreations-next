import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/types";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account/", "/admin/", "/login", "/register", "/cart", "/checkout", "/order-confirmation", "/order/"] }, sitemap: `${SITE_ORIGIN}/sitemap.xml` }; }
