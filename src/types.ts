export type EbookAccess = 'public' | 'borrowable' | 'printdisabled' | 'no_ebook';

export interface Book {
  /** Open Library work key without the "/works/" prefix, e.g. OL22015940W */
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  coverUrl: string | null;
  languages: string[];
  editionCount: number;
  ebookAccess: EbookAccess;
  /** Internet Archive page with full reader & download options */
  readUrl: string | null;
  /** Direct PDF download (only for public-domain / freely licensed books) */
  downloadUrl: string | null;
}

export interface SearchResult {
  books: Book[];
  total: number;
  page: number;
  pages: number;
}

export interface Subject {
  /** i18n key suffix, e.g. "fiction" -> t('subjects.fiction') */
  id: string;
  /** Open Library subject query */
  query: string;
}

export type SortOption = 'trending' | 'relevance' | 'newest' | 'oldest';

export const SUBJECTS: Subject[] = [
  {id: 'fiction', query: 'subject:fiction'},
  {id: 'philosophy', query: 'subject:philosophy'},
  {id: 'history', query: 'subject:history'},
  {id: 'science', query: 'subject:science'},
  {id: 'poetry', query: 'subject:poetry'},
  {id: 'arabic', query: 'subject:"arabic language"'},
  {id: 'children', query: 'subject:children'},
  {id: 'business', query: 'subject:business'},
];
