# Maktabi Store · مكتبي

**A full-stack, bilingual (Arabic RTL / English LTR) book-commerce platform** — real catalog
imported live from Open Library, JWT auth, cart & coupons, transactional checkout with
**PayPal Sandbox**, order lifecycle management, reviews, wishlist, and a role-protected admin
dashboard with one-click Open Library import.

---

## Table of Contents

- [Overview](#overview)
- [Feature Matrix](#feature-matrix)
- [Catalog Strategy](#catalog-strategy)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [PayPal Integration](#paypal-integration)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Overview

Maktabi began as a free digital library backed by [Open Library](https://openlibrary.org)
(20M+ works, unlimited and keyless). It is now a **commercial bookstore** on top of that same
catalog: every book sold in the store is a real product with a price, stock, SKU and edition —
while the free public-domain digital reading link stays available next to the print offer.

Built as a single repository with a React SPA (`src/`) and an Express API (`server/`), it covers
the complete commerce lifecycle: discover → search → cart → coupon → checkout → PayPal →
order tracking → admin fulfillment — with a **true bilingual UI** where switching language flips
the whole document direction (RTL ↔ LTR) and every book carries separate Arabic/English content.

All prices are stored and transmitted as **integer minor units** (halalas) and formatted for
display only at the edges via `Intl.NumberFormat`.

## Feature Matrix

| Area | Capabilities |
| --- | --- |
| **Catalog** | 24 real books seeded from Open Library, paginated listing, search (AR/EN/author), genre & price filters, 5 sort orders, featured collections, related books |
| **Book page** | Real cover, authors, first-published year, edition format, ISBN, pages, publisher, **free digital reading link**, reviews |
| **Cart** | Guest cart (localStorage) merged into the server cart on login, stock-aware limits |
| **Checkout** | Address form, coupon validation, **COD / card / PayPal**, transactional order creation |
| **Orders** | History, details, cancellation with automatic stock restoration & coupon refund |
| **Reviews** | 1–5 stars, one per user/book (DB-enforced), denormalized rating aggregates |
| **Wishlist** | Per-user favorites |
| **Auth** | JWT (7-day), bcrypt hashing, role guards (`customer`/`admin`) on API and routes |
| **Admin** | KPI dashboard, **Open Library import (search → price → genre → one click)**, book CRUD (soft delete), order workflow, coupon management |
| **i18n** | Arabic-first RTL with instant EN/LTR switch, persisted preference, localized currency & dates |

## Catalog Strategy

The store does **not** sell directly out of Open Library. The split is deliberate:

```
Open Library (live API)          SQLite (local)
─────────────────────────        ──────────────────────────────
browse • discover • free read    price • stock • SKU • edition
20M+ works, keyless, unlimited   orders • carts • reviews • coupons
```

- **Import flow:** admin searches Open Library → picks a work → sets price/stock/genre →
  the server fetches metadata (title, authors, cover, year, ISBN, pages, free-read id) and
  inserts a sellable product row.
- **Seeding:** `npm run db:reset` imports 24 real books across 6 genres, with deterministic
  prices derived from each Open Library key.
- **Free reading:** every imported book keeps its `archive.org` link (public-domain titles),
  shown as *"اقرأ مجانًا / Read free"* next to the print offer.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript (strict), React Router 7, Tailwind CSS 4, i18next, lucide-react |
| Backend | Node.js, Express 4, better-sqlite3 (WAL), Zod validation, jsonwebtoken, bcryptjs |
| Payments | PayPal Orders API v2 (Sandbox), with a simulated fallback when unconfigured |
| Catalog | Open Library Search API (free, keyless) |
| Build | Vite 6, tsx (server), concurrently (one-command dev) |

## Database Schema

11 tables (`server/src/db/schema.sql`), FK-constrained with indexes:

| Table | Purpose |
| --- | --- |
| `users` | Accounts, `role` check (`customer`/`admin`), bcrypt hashes |
| `addresses` | Saved shipping addresses |
| `categories` | Genres with bilingual names |
| `products` | The sellable book: SKU/slug, bilingual title & description, integer price, stock, category, JSON images/specs, **plus OL metadata** (`ol_key`, `ol_cover_id`, `ol_ia`, `authors`, `pub_year`, `format`, `isbn`, `pages`, `book_language`) |
| `carts` / `cart_items` | Server cart, unique per (cart, product) |
| `coupons` | percent/fixed, min subtotal, max uses, expiry |
| `orders` | Order number, 7-status workflow, payment method/status, PayPal order id, totals & shipping snapshot |
| `order_items` | **Price & title snapshot at purchase time** |
| `reviews` | 1–5 rating, unique per (product, user) |
| `wishlist_items` | Unique per (user, product) |
| `store_import_log` | Audit trail of Open Library imports |

## PayPal Integration

The checkout supports **PayPal Sandbox** through the official Orders API v2:

1. `POST /api/orders` with `payment_method: "paypal"` creates a PayPal order
   (`amount = SAR total ÷ 3.75` — the SAR peg) and returns an `approval_url`.
2. The client redirects the buyer to PayPal.
3. PayPal returns to `GET /api/orders/paypal/return?token=…`, the server **captures** the
   payment, marks the order `paid`, and redirects to the order confirmation page.

Configure it in `.env`:

```bash
PAYPAL_CLIENT_ID=YOUR_SANDBOX_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_SANDBOX_SECRET
# optional: PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```

Without credentials the platform **runs out of the box**: PayPal checkouts fall back to an
instant simulated approval (and COD/card remain available), so the whole flow is testable
locally before you connect a sandbox app.

## API Reference

All routes under `/api` — JSON in/out.

| Method & Path | Auth | Description |
| --- | --- | --- |
| `POST /auth/register` · `POST /auth/login` | — | Returns `{token, user}` |
| `GET/PATCH /auth/me` | JWT | Session / profile |
| `GET /products` | — | `q`, `category`, `featured`, `price_min/max`, `sort`, `page`, `per_page` |
| `GET /products/:slug` | — | Book + 4 related |
| `GET/POST /products/:id/reviews` | JWT* | Reviews (*write requires auth) |
| `GET/POST/PATCH/DELETE /cart…` | JWT | Cart + `POST /cart/merge` for guest carts |
| `POST /coupons/validate` | — | Non-destructive coupon check |
| `POST /orders` | JWT | Transactional checkout (`cod`, `card`, `paypal`) |
| `GET /orders` · `GET /orders/:orderNumber` | JWT | History / details |
| `POST /orders/:orderNumber/cancel` | JWT | Cancel + restock + refund coupon |
| `GET /orders/paypal/return` | — | PayPal capture callback |
| `GET /orders/paypal/status` | — | `{configured}` |
| `GET/POST/DELETE /wishlist…` | JWT | Favorites |
| `GET /admin/stats` | Admin | Revenue, best sellers, low stock, recent orders |
| `GET /admin/openlibrary/search?q=` | Admin | **Search Open Library for import** |
| `POST /admin/import-book` | Admin | **Import a work into the store** |
| `GET/POST/PATCH/DELETE /admin/products…` | Admin | Book CRUD (soft delete) |
| `GET/POST/PATCH /admin/orders…` | Admin | Order workflow |
| `GET/POST/DELETE /admin/coupons…` | Admin | Coupon management |
| `GET/POST/DELETE /admin/categories…` | Admin | Genre management |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Run

```bash
git clone https://github.com/aslamalkarywk7/websit-3.git maktabi
cd maktabi
npm install
npm run dev        # API :3001 + Vite :5173 (proxied) in one command
```

Open **http://localhost:5173**. The database is created and seeded automatically on first run
(seeding imports real books from Open Library — an internet connection is required once).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | API + client concurrently with hot reload |
| `npm run build` | Production client build to `dist/` |
| `npm start` | Production server (serves `dist/` + API on :3001) |
| `npm run lint` | Strict typecheck of both client and server |
| `npm run db:reset` | Drop, migrate, and reseed (live Open Library import) |

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@maktabi.com` | `Admin@123` |
| Customer | `sara@example.com` | `User@123` |
| Customer | `omar@example.com` | `User@123` |

Active coupons: `WELCOME10` (10%, min SAR 100) · `SAVE50` (SAR 50 off, min SAR 300).

## Testing

A 23-assertion end-to-end smoke suite passes against a freshly seeded database:

- catalog listing/search/filter/sort, book metadata (authors, OL key)
- customer & admin login, cart add
- coupon validation (percent)
- **PayPal checkout (simulated)** and COD checkout
- order listing, cancellation
- review creation, wishlist
- admin stats, **Open Library search + import + soft delete**
- public PayPal callback/status endpoints

## Project Structure

```
├── index.html
├── vite.config.ts              # React + Tailwind + /api proxy
├── src/                        # ── Client ──
│   ├── main.tsx                # Providers, router, self-hosted fonts
│   ├── App.tsx                 # Route tree with auth/admin guards
│   ├── i18n/                   # ar.json / en.json dictionaries + direction manager
│   ├── context/                # AuthContext (JWT), CartContext (guest↔server merge)
│   ├── lib/                    # api client, money formatting, debounce
│   ├── components/             # BookCard, RatingStars, Pagination, Toast, layout…
│   └── pages/                  # home, catalog, book detail, cart, checkout, auth
│       ├── account/            #   profile, orders, order details, wishlist
│       └── admin/              #   dashboard, books (+ ImportPanel), orders, coupons
└── server/                     # ── API ──
    └── src/
        ├── index.ts            # Express app, route mounting, SPA serving
        ├── db/                 # schema.sql, connection, migrate, seed
        ├── lib/                # errors, pricing/coupons, DTO serializers
        ├── middleware/         # JWT auth, admin guard, zod parsing, error handler
        ├── services/           # Open Library importer, PayPal client, mock gateway
        └── routes/             # auth, products, cart, coupons, orders, reviews, wishlist, admin
```

## Roadmap

- [ ] Wishlist-to-cart quick action and saved addresses at checkout
- [ ] Arabic title enrichment for imported works (`title_ar` editing UI)
- [ ] Print-on-demand or publisher API integration for real fulfillment
- [ ] Email notifications on order status change
- [ ] Full test suite (Vitest unit + Playwright E2E) in CI
- [ ] PostgreSQL migration path (SQL isolated in route/lib layers)
