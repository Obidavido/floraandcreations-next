"use client";

import type { AdminPage } from "@/lib/admin-api";

type PaginationMeta = NonNullable<AdminPage<unknown>["pagination"]>;

export function AdminPagination({ pagination, onPageChange }: { pagination: PaginationMeta | null; onPageChange: (page: number) => void }) {
  if (!pagination || (pagination.last_page || 1) <= 1) return null;
  const current = pagination.current_page || 1;
  const last = pagination.last_page || 1;
  const perPage = pagination.per_page || 0;
  const total = pagination.total || 0;
  const firstRecord = total === 0 ? 0 : (current - 1) * perPage + 1;
  const lastRecord = Math.min(current * perPage, total);

  return <nav className="admin-pagination" aria-label="List pages">
    <span>Showing {firstRecord}–{lastRecord} of {total}</span>
    <div><button className="button button-secondary" type="button" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>Previous</button><span>Page {current} of {last}</span><button className="button button-secondary" type="button" disabled={current >= last} onClick={() => onPageChange(current + 1)}>Next</button></div>
  </nav>;
}
