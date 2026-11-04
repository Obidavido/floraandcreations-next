"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function SiteHeader() {
  const { itemCount } = useCart();
  return (
    <header className="site-header">
      <div className="site-status">Open Now · Abuja Delivery · Mon–Sat · 9:00 – 18:00</div>
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Flora and Creations home"><img src="/images/flora-logo.png" alt="Flora and Creations" width={155} height={82} /></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div className="header-actions">
          <Link href="/account/wishlist" aria-label="Wishlist">♡</Link>
          <Link href="/cart" aria-label={`Shopping cart, ${itemCount} items`}>Cart{itemCount ? ` (${itemCount})` : ""}</Link>
          <Link href="/login" className="account-link">Account</Link>
        </div>
      </div>
    </header>
  );
}
