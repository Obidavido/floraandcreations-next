import type { Metadata, Viewport } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const viewport: Viewport = { themeColor: "#3F5D45" };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://floraandcreations.com"),
  title: { default: "Flora and Creations — Bouquets & Gifts, Abuja", template: "%s | Flora and Creations" },
  description: "Handcrafted bouquets, gift boxes, chocolates, wines and more — delivered across Abuja.",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${manrope.variable}`}>
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
