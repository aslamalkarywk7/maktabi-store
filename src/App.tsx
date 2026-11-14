import {useEffect, useMemo, useState} from 'react';
import {BookOpen, ChevronLeft, ChevronRight, LibraryBig, Search, Sparkles, TriangleAlert} from 'lucide-react';
import BookCard from './components/BookCard';
import {searchBooks} from './lib/openlibrary';
import {useDebounced} from './lib/useDebounced';
import {SUBJECTS, type Book, type SortOption} from './types';

const PER_PAGE = 24;

const SORTS: {id: SortOption; label: string}[] = [
  {id: 'trending', label: 'الأكثر رواجًا'},
  {id: 'relevance', label: 'الأكثر صلة'},
  {id: 'newest', label: 'الأحدث نشرًا'},
  {id: 'oldest', label: 'الأقدم'},
];

const SUBJECT_LABELS: Record<string, string> = {
  fiction: 'روايات',
  philosophy: 'فلسفة',
  history: 'تاريخ',
  science: 'علوم',
  poetry: 'شعر',
  arabic: 'كتب عربية',
  children: 'أدب أطفال',
  business: 'أعمال وإدارة',
};

export default function App() {
  const [query, setQuery] = useState('');
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  const [sort, setSort] = useState<SortOption>('trending');
  const [digitalOnly, setDigitalOnly] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounced(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subject = useMemo(() => SUBJECTS.find(s => s.id === subjectId) ?? SUBJECTS[0], [subjectId]);

  // Reset paging whenever the search context changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, subjectId, sort, digitalOnly]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchBooks({
      q: debouncedQuery || undefined,
      subject: subject.query,
      sort: debouncedQuery ? 'relevance' : sort,
      hasFulltext: digitalOnly,
      page,
      perPage: PER_PAGE,
    })
      .then(r => {
        if (cancelled) return;
        setBooks(r.books);
        setTotal(r.total);
        setPages(Math.max(1, r.pages));
      })
      .catch(() => {
        if (cancelled) return;
        setError('تعذر الاتصال بمكتبة Open Library، حاول مرة أخرى.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, subject.query, sort, digitalOnly, page]);

  const isSearching = debouncedQuery.trim().length > 0;
  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-library-accent selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-warm-beige/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-library-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-library-accent/20">
              <LibraryBig size={22} />
            </div>
            <h1 className="serif-title text-2xl font-bold tracking-tight">مكتبي</h1>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-stone-500">
            <Sparkles size={15} className="text-library-accent" />
            <span>مدعوم بمكتبة Open Library — ملايين الكتب المجانية</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero + Search */}
        <section className="relative pt-16 pb-24 overflow-hidden px-6">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="serif-title text-4xl md:text-6xl mb-5 leading-[1.15]">
              اكتشف المعرفة <br />
              <span className="italic text-library-accent">من ملايين الكتب الحقيقية</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto mb-9 leading-relaxed">
              ابحث وحمّل مجانًا من كتالوج Open Library العالمي — كتب من كل القارات واللغات، مباشرة دون تسجيل.
            </p>

            {/* Live search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="ابحث عن عنوان أو مؤلف… النتائج تظهر أثناء الكتابة"
                className="w-full h-14 bg-white border border-black/5 rounded-2xl pr-12 pl-4 shadow-xl shadow-black/5 focus:outline-none focus:ring-2 focus:ring-library-accent/20 transition-all text-lg"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {loading && (
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <span className="w-5 h-5 border-2 border-library-accent/30 border-t-library-accent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 select-none pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-library-accent/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Subjects + sort */}
        <section className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              {/* Subject chips */}
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSubjectId(s.id);
                      setQuery('');
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      !isSearching && subjectId === s.id
                        ? 'bg-library-accent text-white shadow-lg'
                        : 'bg-white hover:bg-stone-50 border border-black/5'
                    }`}
                  >
                    {SUBJECT_LABELS[s.id]}
                  </button>
                ))}
              </div>

              {/* Digital-only toggle + sort */}
              <div className="flex items-center gap-2 text-sm shrink-0">
                <button
                  onClick={() => setDigitalOnly(v => !v)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    digitalOnly
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-stone-500 hover:text-emerald-600 border border-black/5 bg-white'
                  }`}
                >
                  📖 متاح للتحميل فقط
                </button>
                <span className="text-stone-300 mx-1">|</span>
                {SORTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSort(s.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      sort === s.id && !isSearching
                        ? 'bg-library-ink text-white font-medium'
                        : 'text-stone-500 hover:text-library-accent'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result meta */}
            {!loading && !error && (
              <p className="text-sm text-stone-400 mb-6">
                {isSearching ? (
                  <>نتائج البحث عن «{debouncedQuery}» — {total.toLocaleString('ar-EG')} كتاب</>
                ) : (
                  <>قسم «{SUBJECT_LABELS[subject.id]}» — {total.toLocaleString('ar-EG')} كتاب متاح</>
                )}
                {page > 1 ? ` · صفحة ${page} من ${pages}` : ''}
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="max-w-xl mx-auto text-center py-16">
                <div className="inline-flex w-16 h-16 bg-red-50 rounded-full items-center justify-center text-red-400 mb-4">
                  <TriangleAlert size={30} />
                </div>
                <p className="text-stone-600">{error}</p>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {Array.from({length: PER_PAGE}).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-black/5 bg-white">
                    <div className="aspect-[3/4] bg-stone-200/70 animate-pulse" />
                    <div className="p-4 space-y-2">
                      <div className="h-3.5 bg-stone-200 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-stone-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {books.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            ) : !error ? (
              <div className="py-20 text-center">
                <div className="inline-flex w-16 h-16 bg-stone-100 rounded-full items-center justify-center text-stone-400 mb-4">
                  <BookOpen size={30} />
                </div>
                <p className="text-stone-500">لم نجد كتبًا تطابق بحثك. جرّب كلمات أخرى.</p>
              </div>
            ) : null}

            {/* Pagination */}
            {!loading && !error && pages > 1 && (
              <nav className="flex items-center justify-center gap-2 py-12">
                <button
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="w-10 h-10 rounded-xl border border-black/5 bg-white flex items-center justify-center text-stone-600 hover:text-library-accent disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronRight size={17} />
                </button>
                <span className="px-4 text-sm text-stone-500 font-medium">
                  صفحة {page.toLocaleString('ar-EG')} من {pages.toLocaleString('ar-EG')}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => goToPage(page + 1)}
                  className="w-10 h-10 rounded-xl border border-black/5 bg-white flex items-center justify-center text-stone-600 hover:text-library-accent disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  <ChevronLeft size={17} />
                </button>
              </nav>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-library-accent rounded-lg flex items-center justify-center text-white">
              <LibraryBig size={19} />
            </div>
            <span className="serif-title text-xl font-bold">مكتبي</span>
          </div>
          <p className="text-sm text-stone-400 text-center">
            الكتالوج والأغلفة والنسخ الرقمية مقدمة من{' '}
            <a href="https://openlibrary.org" target="_blank" rel="noreferrer" className="text-library-accent font-medium hover:underline">
              Open Library
            </a>{' '}
            و{' '}
            <a href="https://archive.org" target="_blank" rel="noreferrer" className="text-library-accent font-medium hover:underline">
              Internet Archive
            </a>{' '}
            — واجهة مجانية مفتوحة.
          </p>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-black/5 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} مكتبي — جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
