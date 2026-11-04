"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

type SortOrder = "featured" | "price-low" | "price-high" | "name";

type ProductListingProps = {
  products: Product[];
  pageSize?: number;
};

export function ProductListing({ products, pageSize }: ProductListingProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [requestedPage, setRequestedPage] = useState(1);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortOrder) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "featured":
      default:
        return sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    }
  }, [products, sortOrder]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(sortedProducts.length / pageSize)) : 1;
  const currentPage = Math.min(requestedPage, pageCount);
  const visibleProducts = pageSize
    ? sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedProducts;
  const firstVisible = visibleProducts.length ? (currentPage - 1) * (pageSize || sortedProducts.length) + 1 : 0;
  const lastVisible = pageSize ? Math.min(currentPage * pageSize, sortedProducts.length) : sortedProducts.length;

  return (
    <>
      <div className="shop-meta">
        <span>{pageSize ? `Showing ${firstVisible}–${lastVisible} of ${sortedProducts.length} products` : `${sortedProducts.length} live products`}</span>
        <label>
          Sort
          <select aria-label="Sort products" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as SortOrder); setRequestedPage(1); }}>
            <option value="featured">Featured first</option>
            <option value="price-low">Price — low to high</option>
            <option value="price-high">Price — high to low</option>
            <option value="name">Name — A to Z</option>
          </select>
        </label>
      </div>

      <div className="product-grid">
        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {pageSize && pageCount > 1 ? (
        <nav className="pager" aria-label="Product pages">
          <button className="text-link pager-button" type="button" disabled={currentPage === 1} onClick={() => setRequestedPage((page) => Math.max(1, page - 1))}>
            Previous
          </button>
          <span aria-live="polite">Page {currentPage} of {pageCount}</span>
          <button className="text-link pager-button" type="button" disabled={currentPage === pageCount} onClick={() => setRequestedPage((page) => Math.min(pageCount, page + 1))}>
            Next
          </button>
        </nav>
      ) : null}
    </>
  );
}
