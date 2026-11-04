import Link from "next/link";
import { BUSINESS_ADDRESS } from "@/lib/types";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="eyebrow">Flora and Creations</p>
          <h2>Thoughtful flowers for meaningful moments.</h2>
          <p className="muted">Handcrafted bouquets, gift boxes, chocolates and wines delivered across Abuja.</p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <Link href="/shop">Shop bouquets</Link>
          <Link href="/about">Our story</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div>
          <p className="footer-heading">Visit or enquire</p>
          <p className="muted">{BUSINESS_ADDRESS}</p>
          <p className="muted">Abuja, Nigeria</p>
          <a href="mailto:orders@floraandcreations.com">orders@floraandcreations.com</a>
          <a href="tel:+2347031677165">+234 703 167 7165</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Flora and Creations</span>
        <span>Made with care in Abuja</span>
      </div>
    </footer>
  );
}
