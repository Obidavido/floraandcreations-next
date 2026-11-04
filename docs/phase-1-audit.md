# Flora and Creations — Phase 1 Audit

**Audit date:** 4 November 2026  
**Status:** Audit complete; implementation has not started.

## Audit scope and handling

I inspected the live storefront and the uploaded Vite/React build as reference material. The root build files and the same files inside `dist.zip` are identical. I extracted only the reference HTML/CSS/JS assets and the requested API route registry for read-only inspection. No PHP backend file was modified, no customer or payment-upload files were used, and no live form, login, cart, order, or upload action was submitted.

The site is client-rendered. The initial homepage capture was blank, then its content appeared on a later view. Several other pages behaved similarly. Therefore, observations below distinguish visible content from routes that remained in a loading state. The browser inspection did not consistently expose HTTP status codes.

## Route map and classification

### Public storefront and customer-entry routes

- `/` — Homepage. Header/footer links include `/shop`, `/about`, `/contact`, `/faq`, `/account/wishlist`, `/cart`, and `/login`. The homepage displayed 9 of 13 products and links to the nine product routes listed below. [1]
- `/shop` — Public shop/catalog route. The shell and category/sort controls appeared, but the catalog remained at 0 products with a spinner during inspection. [2]
- `/products/:slug` — Public product-detail template. Nine homepage-linked product URLs were inspected:
  - `/products/50-stems-premium-red-roses`
  - `/products/50-stems-premium-red-roses-and-baby-s-breath`
  - `/products/50-stems-premium-red-and-white-roses`
  - `/products/mixed-coloured-rose-bouquet`
  - `/products/all-red-roses-bouquet`
  - `/products/bridal-bouquet`
  - `/products/red-red-rose-bouquet`
  - `/products/premium-mixed-flowers`
  - `/products/coloured-roses-and-statice`

  Six product pages rendered content during inspection. The bridal bouquet, red red rose bouquet, and premium mixed flowers routes remained blank/loading or only partially rendered. Related-product cards exposed additional product slugs not included in this nine-route sample. [3]
- `/about`, `/contact`, `/faq` — Public informational pages. The Contact page displays a message form; FAQ questions are accordion controls. [4] [5] [6]
- `/cart`, `/checkout` — Both routes were publicly viewable without authentication and showed empty-cart states. Checkout showed “Nothing to checkout yet.” No checkout form could be audited because there were no cart items. [7] [8]
- `/login`, `/register` — Public sign-in and registration forms. Login has email/password fields; registration has name/email/phone/password. No credentials were entered and no form was submitted. [9] [10]
- `/order-confirmation`, `/order/:reference` — Public order-status pages. An order-not-found state appeared for the confirmation page and for a deliberately fake test reference. No real order information was accessed. [11] [12]
- `/admin/login` — Publicly reachable admin sign-in screen; no credentials were attempted. [13]

### Guarded/private routes

- `/account`, `/account/wishlist`, `/account/orders`, `/account/addresses`, and `/account/settings` redirected to `/login?redirect=...` while unauthenticated. No account data was accessed. [14]
- `/admin` redirected to `/admin/login`. The dashboard and other admin pages were not accessed.
- The client bundle also defines admin route families for orders, products, add-ons, categories, delivery zones, customers, reports, settings, staff, and scheduling. These are private operational pages and require authenticated access for a full UI audit.

### Route coverage note

The homepage’s visible product links and the primary header/footer routes were covered. The site reports 13 products but only 9 appeared on the homepage’s first visible listing; pagination and related-product cards expose further product routes. Several inspected product pages also remained in a loading state. Those findings should be treated as implementation/QA risks, not as confirmation that the missing product data does not exist.

## Component inventory

The observed public site uses a shared storefront shell: logo/header, Shop/About/Contact/FAQ navigation, wishlist/cart/account icons, reusable footer, brand/contact blocks, and a WhatsApp ordering callout. Homepage components include delivery-hours/status badges, a floral hero, category filters, sort selector, product cards, wishlist toggles, add-to-cart controls, add-on gift tiles, pagination, and delivery/pickup assurances.

Product-detail pages use a gallery and product summary with add-on checkboxes, quantity stepper, special-instructions field, Add to Cart and wishlist controls, related-product cards, and the shared footer. Other templates include an empty-cart state, checkout shell, sign-in and registration cards, contact form and map/directions area, FAQ accordions, order-not-found state, customer account pages behind sign-in, and a standalone admin login.

## API surface found in the supplied route registry

The route registry groups endpoints as follows:

- **Public catalog/settings:** `GET /products`, `GET /products/:slug`, `GET /categories`, `GET /delivery-zones`, `GET /settings`.
- **Cart and orders:** `POST /cart/quote`, `POST /orders`, `GET /orders/:id`, `POST /orders/:id/payment-proof`.
- **Authentication:** `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`; `GET /auth/me`.
- **Customer account:** order list/detail; address list/create/update/delete; wishlist list/add/remove; profile update under `/account/*`.
- **Admin API:** product and variant CRUD/image uploads; add-on, category, delivery-zone, order, customer, staff, dashboard-statistics, settings, activity-log, and admin password endpoints under `/admin/*`.

The frontend bundle’s shared API client sends JSON for ordinary POST/PUT requests and attaches `Authorization: Bearer <token>` when a token is present in local storage (`fc.token.v1`). Payment-proof upload uses `multipart/form-data` with a field named `proof`. The live product page exposed an image path under `/api/assets/uploads/products/...`; the bundle’s URL helper prefixes relative API asset paths with `/api`. The route registry shows endpoint registration but does not itself document controller payload schemas or per-route authorization middleware. From the bundle, the visible auth request shapes include registration `{name, email, phone, password}`, login `{email, password}`, and forgot-password `{email}`. Checkout was empty, so order and cart-quote payload structures were not verified from a live submission.

**Integration discrepancy:** the frontend bundle calls `POST /contact`, but `/contact` is absent from the supplied `api/Routes/ApiRoutes.php` route registry. The Contact form’s field labels are visible, but its backend endpoint and accepted payload are not confirmed. This must be resolved before wiring the new contact form while keeping the PHP API unchanged.

## SEO, styling, and performance observations

The inspected pages mostly expose the same generic document title, description, homepage canonical URL, homepage Open Graph URL, and `FlowerShop` JSON-LD. On routes such as About, Contact, FAQ, login, cart, and product detail, canonical/OG URLs still point to the homepage. Product-specific metadata and `Product` JSON-LD were not observed. `sitemap.xml` returned a 404 page; `robots.txt` returned storefront-style text rather than crawl directives. These are current-state findings; the brief’s requested route-specific metadata, Product JSON-LD, sitemap, and robots behavior would be improvements rather than features observed in the reference build. [1] [4] [5] [6] [7] [9]

The uploaded stylesheet confirms the green theme color `#3F5D45`. However, the actual built CSS references **Plus Jakarta Sans and Manrope**, while the project brief says to preserve **Cormorant Garamond and Inter**. This is a direct mismatch that needs your decision before implementation. The hero JPG is 1,430,271 bytes and the logo PNG is 2,313,616 bytes in the reference build. Lighthouse and before/after performance measurements were not run in Phase 1.

## Address correction and implementation boundary

You supplied the correct business address as: **Suite B1, Jahi Plaza, Ben Ndi Obi Street, Jahi**. Live page captures showed inconsistent location text, including “Wuse Zone 5, Abuja, Nigeria” in some footers and a shorter Jahi Plaza address elsewhere. I will use your corrected text as the authoritative business location once the scope of “remove all API loading of address” is clarified.

To preserve checkout/account behavior and the rule against modifying the PHP backend, the safe default is to stop rendering the API-sourced **business/store address** and use your supplied address consistently in business-location displays (for example, Contact/About/footer/maps/structured data), while leaving **customer delivery and saved addresses** API-driven. Please confirm whether that is what you intend, or whether you mean removing API-sourced customer addresses too.

## Questions to resolve before Phase 2

1. **Fonts:** Should the rebuild use the brief’s Cormorant Garamond + Inter, or match the uploaded/live CSS’s Plus Jakarta Sans + Manrope?
2. **Address scope:** Should only the business/store address be static and replaced with your supplied Jahi address, while customer delivery/account addresses remain connected to the existing API? Removing customer-address API flows would change checkout/account functionality.
3. **Contact form endpoint:** Is there a separate `/contact` handler or API route not present in the supplied route registry? If so, please provide its exact URL/method and expected payload. I will not add or modify a PHP route.

No repository, deployment, DNS, backend, or production changes have been made. I’m pausing before Phase 2 until these audit conflicts are resolved.

## References

[1]: https://floraandcreations.com/ "Flora and Creations homepage"
[2]: https://floraandcreations.com/shop "Flora and Creations shop"
[3]: https://floraandcreations.com/products/50-stems-premium-red-roses "Flora and Creations product detail example"
[4]: https://floraandcreations.com/about "Flora and Creations About page"
[5]: https://floraandcreations.com/contact "Flora and Creations Contact page"
[6]: https://floraandcreations.com/faq "Flora and Creations FAQ page"
[7]: https://floraandcreations.com/cart "Flora and Creations cart"
[8]: https://floraandcreations.com/checkout "Flora and Creations checkout"
[9]: https://floraandcreations.com/login "Flora and Creations sign-in"
[10]: https://floraandcreations.com/register "Flora and Creations registration"
[11]: https://floraandcreations.com/order-confirmation "Flora and Creations order confirmation"
[12]: https://floraandcreations.com/order/TEST-AUDIT-REFERENCE "Flora and Creations test order reference route"
[13]: https://floraandcreations.com/admin/login "Flora and Creations admin sign-in"
[14]: https://floraandcreations.com/account "Flora and Creations customer account route"


## User clarification after the audit

The user clarified that the rebuild should match the initial site’s actual fonts. The chosen pair is **Plus Jakarta Sans + Manrope**, superseding the earlier Cormorant Garamond + Inter wording in the supplied brief. The user also authorized adding any missing routes identified during implementation, rather than omitting them just because they were not present in the baseline route map.

Still awaiting clarification: whether the corrected static address applies only to the business/store location (recommended, preserving customer delivery/saved-address flows), and the existing Contact form endpoint because the bundle calls `POST /contact` but the supplied PHP route registry does not define it.
