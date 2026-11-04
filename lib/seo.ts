import type { Metadata } from "next";
import { SITE_NAME, SITE_ORIGIN } from "./types";

const image = `${SITE_ORIGIN}/hero-bouquet.webp`;

export function pageMetadata(title: string, description: string, path = "/", options?: { noIndex?: boolean }): Metadata {
  const canonical = `${SITE_ORIGIN}${path}`;
  return {
    title,
    description,
    keywords: ["flowers Abuja", "bouquets Abuja", "gift boxes Abuja", "flower delivery Abuja", "same day flower delivery", "birthday gifts Abuja"],
    alternates: { canonical },
    robots: options?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", url: canonical, title, description, images: [{ url: image, alt: `${SITE_NAME} floral arrangement` }] },
    twitter: { card: "summary_large_image", title, description, images: [image] }
  };
}
