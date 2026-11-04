import Link from "next/link";
import { BUSINESS_ADDRESS } from "@/lib/types";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="eyebrow">Flora &amp; Creations</p>
          <h2>Handcrafted bouquets and gifts, made with heart in Abuja.</h2>
          <p className="muted">Delivered with care to your loved ones.</p>
        </div>
        <div>
          <p className="footer-heading">Quick Links</p>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ / Delivery</Link>
        </div>
        <div>
          <p className="footer-heading">Contact Us</p>
          <p className="muted">{BUSINESS_ADDRESS}</p>
          <p className="muted">Abuja, Nigeria</p>
          <a href="mailto:hello@floraandcreations.com">hello@floraandcreations.com</a>
          <a href="tel:+2347031677165">07031677165 / 08037033240</a>
          <a href="https://instagram.com/floracreations" target="_blank" rel="noreferrer">@floraandcreations</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Flora and Creations</span>
        <span>Made with care in Abuja</span>
      </div>
    </footer>
  );
}
