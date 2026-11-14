import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Download, Search} from 'lucide-react';
import {toast} from '@/components/Toast';
import {api, ApiClientError} from '@/lib/api';
import type {Category, OlImportHit} from '@/types';

/**
 * Admin tool: search Open Library and import works into the store as
 * sellable products (price + stock + genre chosen at import time).
 */
export default function ImportPanel() {
  const {t, i18n} = useTranslation();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<OlImportHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [cats, setCats] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    api<{categories: Category[]}>('/admin/categories').then(r => setCategories(r.categories));
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setSearching(true);
    try {
      const r = await api<{results: OlImportHit[]}>(`/admin/openlibrary/search?q=${encodeURIComponent(q.trim())}`);
      setHits(r.results);
    } finally {
      setSearching(false);
    }
  };

  const importBook = async (hit: OlImportHit) => {
    const categoryId = Number(cats[hit.ol_key] ?? categories[0]?.id ?? 0);
    if (!categoryId) return;
    setBusyKey(hit.ol_key);
    try {
      await api('/admin/import-book', {
        method: 'POST',
        body: {
          ol_key: hit.ol_key,
          category_id: categoryId,
          price: prices[hit.ol_key] ? Number(prices[hit.ol_key]) : undefined,
          stock: 10,
        },
      });
      toast(t('admin.import_done'));
      setHits(list => (list ? list.filter(x => x.ol_key !== hit.ol_key) : list));
    } catch (err) {
      toast(err instanceof ApiClientError && err.code === 'ALREADY_IMPORTED' ? t('admin.import_already') : 'Error');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
      <h2 className="font-bold text-slate-800 mb-4">{t('admin.import_title')}</h2>
      <form onSubmit={search} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 text-slate-400" style={{insetInlineStart: 12}} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('admin.import_search')}
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <button
          disabled={searching}
          className="h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 transition shrink-0"
        >
          {searching ? t('admin.importing') : t('common.search')}
        </button>
      </form>

      {hits && hits.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100">
          {hits.map(hit => (
            <li key={hit.ol_key} className="py-3 flex flex-wrap items-center gap-3">
              <span className="w-12 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                {hit.coverUrl ? (
                  <img src={hit.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : null}
              </span>
              <div className="flex-1 min-w-40">
                <p className="font-semibold text-sm text-slate-800 line-clamp-1">{hit.title}</p>
                <p className="text-xs text-slate-400 line-clamp-1">
                  {hit.authors.slice(0, 2).join('، ') || '—'} {hit.year ? `· ${hit.year}` : ''}
                </p>
              </div>
              <input
                type="number"
                min={0}
                placeholder={t('admin.import_price')}
                value={prices[hit.ol_key] ?? ''}
                onChange={e => setPrices(p => ({...p, [hit.ol_key]: e.target.value}))}
                className="h-9 w-32 px-3 rounded-lg border border-slate-200 text-sm"
                dir="ltr"
              />
              <select
                value={cats[hit.ol_key] ?? String(categories[0]?.id ?? '')}
                onChange={e => setCats(c => ({...c, [hit.ol_key]: e.target.value}))}
                className="h-9 px-2 rounded-lg border border-slate-200 text-sm"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{i18n.language === 'ar' ? c.name_ar : c.name_en}</option>
                ))}
              </select>
              <button
                onClick={() => importBook(hit)}
                disabled={busyKey === hit.ol_key}
                className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                <Download size={13} /> {t('admin.import_btn')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
