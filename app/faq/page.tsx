import { FaqList } from "@/components/FaqList";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Frequently asked questions", "Answers about Flora and Creations delivery, payment, personal messages and events.", "/faq");

export default function FaqPage() { return <><section className="page-hero"><div className="container"><p className="eyebrow">A little clarity</p><h1>Frequently asked questions.</h1><p>Everything you need to know before sending something lovely.</p></div></section><section className="section container"><div className="rich-copy"><FaqList /></div></section></>; }
