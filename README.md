# Maktabi · مكتبي

**A multilingual digital library for browsing and downloading free books.**

Maktabi (Arabic for *"my desk"*) is an Arabic-first, RTL-native web application that curates a
personal collection of books and makes each title available in multiple languages. Readers can
discover titles through instant search, filter by category, and download the edition of their
choice — all in a fast, fully static front end with zero external service dependencies.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Extending the Catalog](#extending-the-catalog)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

Maktabi was built around one idea: **knowledge should not stop at a language border.**
Every book in the catalog is modeled as a set of language-specific *versions*, so the same
title can be offered in Arabic, English, French, Spanish, German, or any other language
without duplicating entries or special-casing the UI.

The application is a pure client-side SPA. There is no backend, no API keys, and no runtime
dependency on third-party services — even the fonts are self-hosted and bundled at build
time. This makes the build output deployable to any static host (GitHub Pages, Netlify,
Vercel, Cloudflare Pages, S3…) as-is.

## Features

- **Instant search** — filters by title or author as you type, with memoized query
  evaluation to keep the UI responsive on large catalogs.
- **Category filtering** — categories are derived from the data itself, so adding a book
  with a new category automatically extends the filter bar.
- **Multilingual editions per title** — each book exposes a list of language versions with
  direct download links, rendered in an animated popover on the book card.
- **Arabic-first, RTL-native design** — the layout is designed RTL-first with an elegant
  serif treatment (Cormorant Garamond + Amiri) and warm editorial palette.
- **Motion with intent** — entrance and layout transitions powered by Motion, including
  animated grid re-flow when filters change and an empty-state fallback.
- **Zero external runtime dependencies** — self-hosted fonts, static data, no trackers,
  no CDN calls, works fully offline once loaded.
- **Type-safe end to end** — a strict TypeScript domain model (`Book`, `BookVersion`)
  shared by the data layer and the UI components.

## Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| UI | React 19 | Function components, hooks (`useState`, `useMemo`) |
| Language | TypeScript 5.8 | Strict typing of the domain model and props |
| Build | Vite 6 | Dev server, production bundling, path aliasing (`@/`) |
| Styling | Tailwind CSS 4 | Design tokens via `@theme`, no config file needed |
| Animation | Motion | `AnimatePresence` + `layout` for filter re-flow |
| Icons | lucide-react | Tree-shakable icon set |
| Fonts | Fontsource | Variable fonts bundled locally — fully self-hosted |

## Project Structure

```
├── index.html                  # Document shell (lang="ar", dir="rtl", SEO meta)
├── package.json
├── tsconfig.json
├── vite.config.ts              # React + Tailwind plugins, "@" → ./src alias
└── src/
    ├── main.tsx                # Entry point — mounts React, registers self-hosted fonts
    ├── App.tsx                 # Root component — layout, search & category state
    ├── index.css               # Tailwind theme tokens & global styles
    ├── types.ts                # Domain model (Book, BookVersion) + language registry
    ├── components/
    │   └── BookCard.tsx        # Book card with per-language download popover
    └── data/
        └── books.ts            # Static catalog (swap for an API/CMS when needed)
```

## Data Model

The catalog is described by two interfaces defined in [`src/types.ts`](src/types.ts):

```ts
interface BookVersion {
  language: string;   // Display name, e.g. "العربية", "English"
  langCode: string;   // BCP-47 code, e.g. "ar", "en"
  downloadUrl: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  coverImage: string;
  versions: BookVersion[];
}
```

A registry of supported languages (`LANGUAGES`, including `dir` per locale) lives in the same
module and is the single source of truth when extending the platform with real
localization.

## Getting Started

### Prerequisites

- **Node.js 20+** (LTS recommended)
- npm 10+ (bundled with Node)

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/aslamalkarywk7/websit-3.git maktabi
cd maktabi

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build     # Emits optimized assets to dist/
npm run preview   # Serves the production build locally
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-safe production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the TypeScript compiler in check-only mode (`tsc --noEmit`) |

## Extending the Catalog

Adding a book requires no code changes — append an entry to `src/data/books.ts`:

```ts
{
  id: '5',
  title: 'عنوان الكتاب',
  author: 'اسم المؤلف',
  description: 'وصف قصير يظهر على بطاقة الكتاب.',
  category: 'علوم',                       // New categories appear in the filter bar
  coverImage: '/covers/my-book.jpg',      // Local asset or any image URL
  versions: [
    { language: 'العربية', langCode: 'ar', downloadUrl: '/books/my-book-ar.pdf' },
    { language: 'English',  langCode: 'en', downloadUrl: '/books/my-book-en.pdf' },
  ],
}
```

Search, category filters, and result counts update automatically because they are all
derived from the data at render time.

## Roadmap

- [ ] Wire download URLs to a real asset store (object storage / CDN)
- [ ] UI localization (i18n) driven by the `LANGUAGES` registry, including LTR rendering
- [ ] Replace the static catalog with a headless CMS or JSON API
- [ ] Pagination / virtualized grid for large catalogs
- [ ] Unit tests for filtering logic and component tests for `BookCard`
- [ ] CI pipeline (typecheck + build) via GitHub Actions

## Contributing

Issues and pull requests are welcome. Please keep changes typed, small, and scoped —
`npm run lint` must pass before a PR is reviewed.
