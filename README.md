# Flora and Creations — Next.js storefront

This project is the Next.js App Router rebuild of Flora and Creations, preserving the Abuja storefront routes and the existing PHP API on cPanel.

## Local development

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and set the API origin, public site origin, and WhatsApp number. The app uses safe reference catalog data when the external API base is not configured, so the public pages remain useful during development.

## Architecture

- Public catalog pages use Server Components and route metadata.
- The PHP API remains the source of truth for products, authentication, cart, checkout, account, admin, and payment-proof flows.
- `/api/:path*` rewrites to `https://api.floraandcreations.com/api/:path*` in Vercel.
- Customer addresses remain API-driven. The business address is the static corrected Jahi address.
- The contact form expects the separately packaged public `POST /contact` API patch.
- Project-owned images are stored as WebP in `public/`; PHP upload files are never modified.

## GitHub and Vercel workflow

`main` is production. Feature branches and pull requests receive Vercel Preview deployments. Merge only after the owner reviews the Preview and the Phase 7 checks. GitHub Actions runs `pnpm typecheck` and `pnpm build` for pull requests and pushes to `main`.

Recommended Vercel variables:

- `NEXT_PUBLIC_API_BASE_URL=/api`
- `NEXT_PUBLIC_SITE_URL=https://floraandcreations.com`
- `NEXT_PUBLIC_WHATSAPP_NUMBER=2347031677165` (or the approved chooser configuration)
- `API_ORIGIN=https://api.floraandcreations.com`

## cPanel, CORS, and DNS

Create `api.floraandcreations.com` on the same cPanel document root as the existing API and point its DNS A record to the current cPanel server IP. Keep MX records unchanged. If the PHP API enforces CORS, add the exact Vercel Preview origin and the production origin to its `CORS_ALLOWED` configuration manually; do not commit or edit that configuration here.

After Preview verification, add the apex and `www` domains in Vercel. Recommended records are apex A `76.76.21.21`, `www` CNAME to the value Vercel provides (usually `cname.vercel-dns.com`), and `api` A to the cPanel server IP. Do not make DNS changes until the Preview is approved. Roll back by restoring the apex/www records to the cPanel destination.

## Safety boundary

Never commit `.env` values, `config/config.php`, API logs, customer uploads, payment proofs, or PHP backend files. Do not inspect, execute, upload, or version `edit-faiz.php`.
