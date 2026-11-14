import type {Book, EbookAccess, SearchResult, SortOption} from '@/types';

/**
 * Open Library client — a free, keyless, unlimited-use API by the
 * Internet Archive. All data is fetched live at runtime; nothing is stored.
 *
 * Search:  https://openlibrary.org/search.json
 * Covers:  https://covers.openlibrary.org
 * Ebooks:  https://archive.org (via the `ia` identifier on each work)
 */

const API = 'https://openlibrary.org/search.json';
const FIELDS = ['key', 'title', 'author_name', 'cover_i', 'first_publish_year', 'language', 'ebook_access', 'ia', 'edition_count'].join(',');

const SORT_PARAMS: Record<SortOption, string | undefined> = {
  trending: 'trending',
  relevance: undefined,
  newest: 'new',
  oldest: 'old',
};

interface OlDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  language?: string[];
  ebook_access?: EbookAccess;
  ia?: string[];
  edition_count?: number;
}

export function coverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}

function mapDoc(doc: OlDoc): Book {
  const ia = doc.ia?.[0];
  const access: EbookAccess = doc.ebook_access ?? 'no_ebook';
  return {
    id: doc.key.replace('/works/', ''),
    title: doc.title,
    authors: doc.author_name ?? [],
    year: doc.first_publish_year ?? null,
    coverUrl: coverUrl(doc.cover_i),
    languages: doc.language ?? [],
    editionCount: doc.edition_count ?? 0,
    ebookAccess: access,
    readUrl: ia ? `https://archive.org/details/${ia}` : null,
    downloadUrl: ia && access === 'public' ? `https://archive.org/download/${ia}/${ia}.pdf` : null,
  };
}

interface SearchOptions {
  page?: number;
  perPage?: number;
  sort?: SortOption;
  /** Explicit free-text query; when omitted the subject query is used. */
  q?: string;
  /** Subject query used when there is no free-text search (default: fiction). */
  subject?: string;
  /** Only return works with a digital edition (downloadable or borrowable). */
  hasFulltext?: boolean;
}

export async function searchBooks(options: SearchOptions = {}): Promise<SearchResult> {
  const {page = 1, perPage = 24, sort = 'trending', q, subject = 'subject:fiction', hasFulltext = false} = options;

  const params = new URLSearchParams({
    fields: FIELDS,
    limit: String(perPage),
    page: String(page),
  });
  params.set('q', q?.trim() ? q.trim() : subject);
  const sortParam = SORT_PARAMS[sort];
  if (sortParam) params.set('sort', sortParam);
  if (hasFulltext) params.set('has_fulltext', 'true');

  const res = await fetch(`${API}?${params.toString()}`);
  if (!res.ok) throw new Error(`Open Library responded ${res.status}`);
  const data = (await res.json()) as {numFound?: number; num_found?: number; docs?: OlDoc[]};

  const total = data.numFound ?? data.num_found ?? 0;
  return {
    books: (data.docs ?? []).map(mapDoc),
    total,
    page,
    pages: Math.min(200, Math.ceil(total / perPage)), // Open Library caps deep paging
  };
}
