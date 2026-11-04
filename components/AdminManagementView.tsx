import Link from "next/link";
import type { ReactNode } from "react";
import { AdminCatalog } from "@/components/AdminCatalog";
import { AdminOrders } from "@/components/AdminOrders";
import { AdminPeople } from "@/components/AdminPeople";
import { AdminSettings } from "@/components/AdminSettings";
import { AdminShell } from "@/components/AdminShell";
import { AdminAccess } from "@/components/AdminAccess";

const pages: Record<string, { title: string; description: string }> = {
  products: { title: "Product catalog", description: "Manage products, prices, images, variants and visibility." },
  orders: { title: "Orders", description: "Review orders, fulfilment, payment status and proof of payment." },
  categories: { title: "Categories", description: "Organize product types and gifting occasions." },
  "add-ons": { title: "Gift add-ons", description: "Manage gift extras and checkout add-ons." },
  "delivery-zones": { title: "Delivery zones", description: "Maintain delivery areas and their fees." },
  customers: { title: "Customers", description: "Review customer information, saved addresses and recent orders." },
  staff: { title: "Staff access", description: "Create, update and remove administrator and staff accounts." },
  "activity-logs": { title: "Activity logs", description: "Review recorded administrative activity." },
  settings: { title: "Store settings", description: "Maintain business configuration and administrator security." },
  "stats/summary": { title: "Dashboard summary", description: "Store performance and operational overview." }
};

export function AdminManagementView({ section }: { section: string }) {
  const page = pages[section];
  if (!page) return <section className="section container"><div className="admin-section-notice"><p className="eyebrow">Administration</p><h1>Section not found.</h1><p className="detail-copy">This admin address is not a recognized management section.</p><Link className="button button-primary" href="/admin">Back to admin overview</Link></div></section>;

  let content: ReactNode;
  if (section === "products" || section === "categories" || section === "add-ons" || section === "delivery-zones") content = <AdminCatalog section={section} />;
  else if (section === "orders") content = <AdminOrders />;
  else if (section === "customers" || section === "staff" || section === "activity-logs") content = <AdminPeople section={section} />;
  else if (section === "settings") content = <AdminSettings />;
  else content = <AdminAccess />;

  return <section className="section container admin-management-section"><AdminShell title={page.title} description={page.description}>{content}</AdminShell></section>;
}
