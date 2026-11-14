# Maktabi · مكتبي

**A live-search Arabic digital library powered by the Open Library catalog.**

Maktabi (Arabic for *"my desk"*) is an Arabic-first, RTL-native web app that lets readers
search **millions of real books** from [Open Library](https://openlibrary.org) — the
Internet Archive's open catalog — and download public-domain titles directly. It ships with
zero backend, zero API keys, and zero rate limits to worry about.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)

---

## Overview

Maktabi was built around one idea: **knowledge should not stop at a language border.**
Instead of a hand-maintained list of titles, the app queries the live Open Library search
index (20M+ works, 22K+ of them tagged with Arabic-language subjects) and renders the
results in an elegant RTL-first reading experience.

Every work is mapped to a clean domain model with availability-aware actions:
public-domain books expose a direct **PDF download** from the Internet Archive, borrowable
titles link to the Archive's lending page, and everything else still shows real metadata
and covers.

## Features

- **Live search-as-you-type** — debounced free-text queries across titles, authors, and
  subjects, with request cancellation so stale responses never overwrite fresh ones.
- **Subject browsing** — eight curated entry points (fiction, philosophy, history, science,
  poetry, Arabic-language, children's, business) powered by Open Library subject queries.
- **"Downloadable only" filter** — one toggle (`has_fulltext=true`) narrows results to
  works that actually have a digital edition.
- **Availability-aware cards** — each card badges its access level
  (`مجاني للتحميل` / `متاح للاستعارة` / `نسخة مطبوعة`) and exposes the matching action:
  direct PDF download, Archive reader, or metadata only.
- **Real covers with graceful fallback** — covers come from the Open Library covers API;
  works without one render an elegant typographic placeholder, and broken image URLs
  degrade cleanly.
- **Sort & paginate** — trending / relevance / newest / oldest, with result counts
  localized to Arabic numerals and smooth paging.
- **Arabic-first, RTL-native design** — warm editorial palette, serif treatment
  (Cormorant Garamond + Amiri), skeleton loaders, and full RTL layout.
- **Zero backend, zero keys** — pure static SPA; deploy to any static host as-is.

## How It Works

```
Browser ──► openlibrary.org/search.json          (search index, no key, unlimited)
        ──► covers.openlibrary.org/b/id/{id}-M.jpg   (cover art)
        ──► archive.org/download/{ia}/{ia}.pdf       (public-domain PDFs)
```

The single integration point is [`src/lib/openlibrary.ts`](src/lib/openlibrary.ts): it
builds the query, maps raw API documents onto the typed `Book` model, and derives the
availability actions from `ebook_access` + the Internet Archive identifier (`ia`):

| `ebook_access` | Badge | Actions |
| --- | --- | --- |
| `public` | مجاني للتحميل | Direct PDF download + Archive reader |
| `borrowable` | متاح للاستعارة | Archive lending page |
| `printdisabled` / `no_ebook` | نسخة مطبوعة | Metadata & cover only |

## Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| UI | React 19 | Function components, hooks (`useState`, `useEffect`, `useMemo`) |
| Language | TypeScript 5.8 | Strictly typed domain model and API mapping |
| Build | Vite 6 | Dev server, production bundling, `@/` → `src` alias |
| Styling | Tailwind CSS 4 | Design tokens via `@theme` |
| Icons | lucide-react | Tree-shakable icon set |
| Fonts | Fontsource | Inter + Cormorant Garamond + Amiri bundled locally |
| Data | Open Library API | Free, keyless, unlimited; no tracking, no backend |

## Project Structure

```
├── index.html                  # Document shell (lang="ar", dir="rtl", SEO meta)
├── package.json
├── tsconfig.json
├── vite.config.ts              # React + Tailwind plugins, "@" → ./src alias
└── src/
    ├── main.tsx                # Entry point — mounts React, registers self-hosted fonts
    ├── App.tsx                 # Search state, subjects, sorting, pagination, layout
    ├── index.css               # Tailwind theme tokens & global styles
    ├── types.ts                # Book model + curated subject list
    ├── lib/
    │   ├── openlibrary.ts      # API client: query building, DTO mapping, availability
    │   └── useDebounced.ts     # Debounce hook for live search
    └── components/
        └── BookCard.tsx        # Book card: cover, availability badge, read/download
```

## Getting Started

### Prerequisites

- **Node.js 20+** (LTS recommended)

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
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the TypeScript compiler in check-only mode (`tsc --noEmit`) |

## Roadmap

- [ ] Per-book detail view (editions, subjects, first sentences)
- [ ] UI localization (AR/EN toggle) driven by a language registry
- [ ] Gutendex integration for EPUB downloads alongside PDFs
- [ ] Saved shelves (localStorage) — favorites & reading history
- [ ] Virtualized grid for faster long-list scrolling
- [ ] CI pipeline (typecheck + build) via GitHub Actions
