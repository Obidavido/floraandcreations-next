import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppButton() {
  const numbers = ["2347031677165", "2348037033240"];
  const greeting = encodeURIComponent("Hi Flora and Creations, I'd like to make an enquiry.");
  const href = `https://wa.me/${numbers[0]}?text=${greeting}`;
  return (
    <div className="whatsapp-wrap" aria-label="WhatsApp contact options">
      <a className="whatsapp-button" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <FaWhatsapp aria-hidden="true" />
      </a>
      <div className="whatsapp-menu" aria-label="Choose a WhatsApp number">
        {numbers.map((number) => (
          <a key={number} href={`https://wa.me/${number}?text=${greeting}`} target="_blank" rel="noopener noreferrer">Chat {number.slice(-10, -7)} {number.slice(-7, -4)} {number.slice(-4)}</a>
        ))}
      </div>
    </div>
  );
}
