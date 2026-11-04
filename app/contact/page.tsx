import { ContactForm } from "@/components/ContactForm";
import { BUSINESS_ADDRESS } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Contact Flora and Creations", "Speak with the Flora and Creations team about bouquets, gifts, weddings and delivery across Abuja.", "/contact");

export default function ContactPage() { return <><section className="page-hero"><div className="container"><p className="eyebrow">We would love to hear from you</p><h1>Let us make it beautiful.</h1><p>Ask us about an arrangement, a celebration or a delivery. Our team is happy to help.</p></div></section><section className="section container"><div className="contact-grid"><div><p className="eyebrow">Find us</p><h2>Come by or send a note.</h2><p className="detail-copy">{BUSINESS_ADDRESS}<br />Abuja, Nigeria</p><p><a className="text-link" href="tel:+2347031677165">+234 703 167 7165</a></p><p><a className="text-link" href="tel:+2348037033240">+234 803 703 3240</a></p><p><a className="text-link" href="mailto:orders@floraandcreations.com">orders@floraandcreations.com</a></p><a className="button button-secondary" href="https://www.google.com/maps/search/?api=1&query=Suite%20B1%2C%20Jahi%20Plaza%2C%20Ben%20Ndi%20Obi%20Street%2C%20Jahi" target="_blank" rel="noopener noreferrer">Get directions</a></div><ContactForm /></div></section></>; }
