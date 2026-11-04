"use client";

import Link from "next/link";
import { formatNaira } from "@/lib/api";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";

export function CheckoutView() {
  const { items, subtotal, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="empty-state" aria-live="polite">
        <p className="eyebrow">Checkout</p>
        <h1>Loading your cart…</h1>
        <p>Your saved items are being restored.</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Checkout</p>
        <h1>Your cart is empty.</h1>
        <p>Add an arrangement to your cart before continuing to checkout.</p>
        <Link className="button button-primary" href="/shop">Choose an arrangement</Link>
      </div>
    );
  }

  return (
    <div className="checkout-review">
      <header className="section-header">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Review your order</h1>
          <p className="detail-copy">Your cart is ready. Check the items and subtotal before continuing.</p>
        </div>
        <Link className="text-link" href="/cart">Edit cart</Link>
      </header>

      <div className="cart-layout">
        <div className="cart-items" aria-label="Items in your order">
          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <ProductImage src={item.image} alt={item.name} width={132} height={132} className="cart-item-image" />
              <div className="cart-item-main">
                <p className="product-category">{item.category}</p>
                <h2>{item.name}</h2>
                <p className="price">{formatNaira(item.price)}</p>
                <p className="summary-note">Quantity: {item.quantity}</p>
              </div>
              <strong className="checkout-line-total">{formatNaira(item.price * item.quantity)}</strong>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <p className="eyebrow">Order summary</p>
          <h2>{items.reduce((count, item) => count + item.quantity, 0)} item{items.reduce((count, item) => count + item.quantity, 0) === 1 ? "" : "s"}</h2>
          <div className="summary-row"><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div>
          <p className="summary-note">Delivery and any personalisation are confirmed with the store before payment.</p>
          <Link className="button button-primary" href="/cart">Make changes to cart</Link>
          <Link className="text-link" href="/contact">Contact us to complete your order</Link>
        </aside>
      </div>
    </div>
  );
}
