import {BookOpen, Download, Eye} from 'lucide-react';
import type {Book} from '@/types';

/** Availability badge — mirrors Internet Archive access levels. */
function AvailabilityBadge({access}: {access: Book['ebookAccess']}) {
  if (access === 'public') {
    return (
      <span className="px-3 py-1 bg-emerald-500/95 backdrop-blur-sm text-[11px] font-bold rounded-full shadow-sm text-white">
        مجاني للتحميل
      </span>
    );
  }
  if (access === 'borrowable') {
    return (
      <span className="px-3 py-1 bg-amber-500/95 backdrop-blur-sm text-[11px] font-bold rounded-full shadow-sm text-white">
        متاح للاستعارة
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-stone-600/80 backdrop-blur-sm text-[11px] font-bold rounded-full shadow-sm text-white">
      نسخة مطبوعة
    </span>
  );
}

export default function BookCard({book}: {book: Book}) {
  const authors = book.authors.slice(0, 2).join('، ') || 'مؤلف غير معروف';

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5 group flex flex-col">
      <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`غلاف كتاب ${book.title}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={e => {
              // Hide broken covers and fall back to the title placeholder
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        {!book.coverUrl && (
          <div className="absolute inset-0 bg-library-accent/90 text-white flex flex-col items-center justify-center gap-3 p-6 text-center">
            <BookOpen size={36} className="opacity-70" />
            <p className="serif-title text-lg leading-snug line-clamp-4">{book.title}</p>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <AvailabilityBadge access={book.ebookAccess} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="serif-title text-lg leading-snug line-clamp-2 group-hover:text-library-accent transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-stone-500 mt-1.5 line-clamp-1">{authors}</p>
        <p className="text-xs text-stone-400 mt-1">
          {book.year ? `نُشر عام ${book.year}` : 'سنة النشر غير معروفة'}
          {book.editionCount > 1 ? ` · ${book.editionCount} طبعات` : ''}
        </p>

        <div className="mt-auto pt-4 flex gap-2">
          {book.readUrl && (
            <a
              href={book.readUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-50 hover:bg-library-accent hover:text-white rounded-xl transition-all duration-300 font-medium text-sm"
            >
              <Eye size={16} />
              <span>اقرأ</span>
            </a>
          )}
          {book.downloadUrl ? (
            <a
              href={book.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-library-accent text-white rounded-xl hover:bg-library-ink transition-all duration-300 font-medium text-sm"
            >
              <Download size={16} />
              <span>تحميل PDF</span>
            </a>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-400 rounded-xl font-medium text-sm cursor-not-allowed">
              <Download size={16} />
              <span>تحميل</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
