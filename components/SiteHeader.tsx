"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";

export function SiteHeader() {
  const { itemCount } = useCart();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Flora and Creations home">
          <Image src="/flora-logo.webp" alt="Flora and Creations" width={116} height={78} priority />
        </Link>
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
