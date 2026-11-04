"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function SiteChrome() {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/account" || pathname.startsWith("/account/");
  if (isDashboard) return null;
  return <>
    <SiteHeader />
    <SiteFooter />
    <WhatsAppButton />
  </>;
}
