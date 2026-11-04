# Flora and Creations — Next.js

Private rebuild repository for the Flora and Creations storefront.

## Current status

The Phase 1 audit is complete and available in [`docs/phase-1-audit.md`](docs/phase-1-audit.md). This branch is a PR-ready audit/bootstrap branch; the Next.js application source has not been added yet. The live cPanel site remains unchanged.

## Project constraints

- Rebuild the storefront with Next.js App Router and preserve the existing brand and routes, adding routes found to be missing.
- Match the supplied/live site's fonts: Plus Jakarta Sans and Manrope.
- Keep the PHP API, its configuration, database, migrations, uploads, and PHP `.htaccess` on cPanel. Do not copy or edit those files here.
- Never commit secrets, `.env` values, API logs, uploads, or payment-proof files.
- The corrected business address supplied by the owner is: Suite B1, Jahi Plaza, Ben Ndi Obi Street, Jahi.

## Git workflow

Use `main` as the production branch. Work on feature branches and open pull requests into `main`; Vercel preview deployments are intended for feature branches/PRs. The current `audit/phase-1` branch contains the audit and repository safeguards.

## Pending integration detail

The audit found that the current frontend calls `POST /contact`, but the supplied PHP route registry does not declare that endpoint. Resolve the existing endpoint and payload before wiring the new contact form. Do not add or modify a PHP API route as part of this rebuild.
