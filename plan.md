# Flora and Creations — Implementation Plan

The storefront will be rebuilt as a Next.js App Router site using TypeScript, Tailwind/PostCSS, Plus Jakarta Sans + Manrope, the existing green theme #3F5D45, the supplied logo/hero assets converted to WebP, and the existing PHP API on cPanel. Public catalog pages are server-rendered with route-specific metadata and JSON-LD. Client components are limited to interactive forms, FAQ controls, cart actions, auth surfaces, account areas, and admin areas.

The PHP API is never modified or deployed by this repository. `/api/:path*` is rewritten to `api.floraandcreations.com`; the contact form expects the owner-managed contact patch. The corrected static business address is Suite B1, Jahi Plaza, Ben Ndi Obi Street, Jahi. Customer delivery and saved addresses remain API-driven. The global WhatsApp control supports the two approved business numbers.

The project preserves storefront, auth, customer-account, order, and admin route families; publishes `sitemap.xml`, `robots.txt`, and `manus-routes.json`; and uses a GitHub feature branch plus Vercel Preview workflow. No DNS, cPanel, live API write, or `main` merge is performed before owner approval.
