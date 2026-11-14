/**
 * Open Library importer — pulls live book metadata (title, authors, cover,
 * year, free-read identifier) and turns it into a sellable product payload.
 * Used by the seeder and by the admin "import from Open Library" endpoint.
 */

const SEARCH_API = 'https://openlibrary.org/search.json';
const FIELDS = ['key', 'title', 'author_name', 'cover_i', 'first_publish_year', 'ebook_access', 'ia', 'edition_count', 'language', 'isbn', 'number_of_pages_median', 'publisher'].join(',');

export interface OlDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  ebook_access?: 'public' | 'borrowable' | 'printdisabled' | 'no_ebook';
  ia?: string[];
  edition_count?: number;
  language?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  publisher?: string[];
}

export interface ImportedBook {
  ol_key: string;
  title: string;
  authors: string[];
  coverId: number | null;
  coverUrl: string | null;
  ia: string | null;
  year: number | null;
  publisher: string | null;
  isbn: string | null;
  pages: number | null;
  language: string;
}

export function olCover(coverId: number | null | undefined, size: 'S' | 'M' | 'L' = 'L'): string | null {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}

export function mapDoc(doc: OlDoc): ImportedBook {
  return {
    ol_key: doc.key.replace('/works/', ''),
    title: doc.title,
    authors: doc.author_name ?? [],
    coverId: doc.cover_i ?? null,
    coverUrl: olCover(doc.cover_i),
    ia: doc.ia?.[0] ?? null,
    year: doc.first_publish_year ?? null,
    publisher: doc.publisher?.[0] ?? null,
    isbn: doc.isbn?.find(x => x.length === 13) ?? doc.isbn?.[0] ?? null,
    pages: doc.number_of_pages_median ?? null,
    language: doc.language?.[0] ?? 'en',
  };
}

/** Search Open Library and return importable book records. */
export async function searchOpenLibrary(q: string, limit = 12): Promise<ImportedBook[]> {
  const params = new URLSearchParams({q, limit: String(limit), fields: FIELDS});
  const res = await fetch(`${SEARCH_API}?${params.toString()}`);
  if (!res.ok) throw new Error(`Open Library responded ${res.status}`);
  const data = (await res.json()) as {docs?: OlDoc[]};
  return (data.docs ?? []).map(mapDoc);
}

/** Deterministic price in minor units derived from the OL key (stable across seeds). */
export function derivePrice(olKey: string): {price: number; compareAt: number | null} {
  let hash = 0;
  for (const ch of olKey) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const base = 7900 + (hash % 18100); // 79 – 260 SAR
  const hasDiscount = hash % 3 === 0;
  return {
    price: base,
    compareAt: hasDiscount ? Math.round(base * 1.25 / 100) * 100 : null,
  };
}

/** Slugify a title into a URL-safe, unique-ish slug. */
export function slugify(title: string, suffix: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'book';
  return `${base}-${suffix.toLowerCase()}`;
}
