"use client";

import { useState } from "react";

const questions = [
  ["Do you offer same-day delivery?", "Yes. Same-day delivery is available across Abuja for orders placed early enough in the day. Our team will confirm the delivery window with you."],
  ["Can I add a personal message?", "Yes. Add your message in the order notes at checkout and we will include it with your arrangement."],
  ["How do I pay?", "We accept the available checkout options, including bank transfer. Payment instructions are shown after your order is placed."],
  ["Can I order for an event or wedding?", "Absolutely. Contact us with your date, palette and guest count and we will help shape a considered floral plan."]
];

export function FaqList() {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">{questions.map(([question, answer], index) => <div className="faq-item" key={question}>
    <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}><span>{question}</span><span>{open === index ? "−" : "+"}</span></button>
    {open === index && <p>{answer}</p>}
  </div>)}</div>;
}
