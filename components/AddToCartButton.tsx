"use client";

import { useState } from "react";

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button className="button button-primary" type="button" onClick={() => { setAdded(true); window.setTimeout(() => setAdded(false), 1800); }}>
      {added ? "Added to cart" : `Add ${productId ? "to cart" : ""}`}
    </button>
  );
}
