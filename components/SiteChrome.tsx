"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChromeFree = pathname === "/login" || pathname === "/register" || pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/account" || pathname.startsWith("/account/");
  if (isChromeFree) return children;
  return <>
    <SiteHeader />
    {children}
    <SiteFooter />
    <WhatsAppButton />
  </>;
}
