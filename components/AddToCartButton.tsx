"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button className="button button-primary" type="button" onClick={() => { addItem(product); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}>
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
