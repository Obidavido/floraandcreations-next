"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/api";
import { useCart } from "@/components/CartProvider";

export function CartView() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  if (!items.length) {
    return <div className="empty-state"><p className="eyebrow">Your cart</p><h1>Nothing here yet.</h1><p>Find something beautiful and we will keep it ready for checkout.</p><Link className="button button-primary" href="/shop">Browse the shop</Link></div>;
  }

  return <div className="cart-layout">
    <div className="cart-items">
      {items.map((item) => <article className="cart-item" key={item.id}>
        <Image src={item.image} alt={item.name} width={132} height={132} className="cart-item-image" />
        <div className="cart-item-main"><p className="product-category">{item.category}</p><h2>{item.name}</h2><p className="price">{formatNaira(item.price)}</p><div className="cart-item-actions"><label>Quantity <select value={item.quantity} onChange={(event) => setQuantity(item.id, Number(event.target.value))}>{[1, 2, 3, 4, 5].map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}</select></label><button className="text-button" type="button" onClick={() => removeItem(item.id)}>Remove</button></div></div>
      </article>)}
    </div>
    <aside className="cart-summary"><p className="eyebrow">Order summary</p><h2>Ready when you are.</h2><div className="summary-row"><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div><p className="summary-note">Delivery and any personalisation are confirmed at checkout.</p><Link className="button button-primary" href="/checkout">Continue to checkout</Link><Link className="text-link" href="/shop">Keep shopping</Link></aside>
  </div>;
}
