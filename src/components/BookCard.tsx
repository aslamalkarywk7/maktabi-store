import {Link} from 'react-router-dom';
import {BookOpen, Download, Eye, ShoppingBag} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import RatingStars from './RatingStars';
import {toast} from './Toast';
import {useAuth} from '@/context/AuthContext';
import {useCart} from '@/context/CartContext';
import {api} from '@/lib/api';
import {formatMoney} from '@/lib/money';
import type {Product} from '@/types';

export default function BookCard({product}: {product: Product}) {
  const {t, i18n} = useTranslation();
  const {addItem} = useCart();
  const {user} = useAuth();
  const navigate = useNavigate();
  const name = i18n.language === 'ar' ? product.name_ar : product.name_en;
  const image = product.images[0];
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    try {
      await addItem(product, 1);
      toast(t('toast.added_to_cart', {name}));
    } catch {
      /* server cart errors surface at checkout */
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api('/wishlist', {method: 'POST', body: {product_id: product.id}});
      toast(t('product.added_to_wishlist'));
    } catch {
      /* ignore duplicates */
    }
  };

  return (
    <Link
      to={`/books/${product.slug}`}
      className="group bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        {image ? (
          <img
            src={image}
            alt={`غلاف ${name}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        {!image && (
          <div className="absolute inset-0 bg-brand-600/95 text-white flex flex-col items-center justify-center gap-3 p-6 text-center">
            <BookOpen size={34} className="opacity-70" />
            <p className="serif-title text-base leading-snug line-clamp-4">{name}</p>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 start-3 px-2 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg">
            −{discount}%
          </span>
        )}
        <button
          onClick={toggleWishlist}
          aria-label={t('nav.wishlist')}
          className="absolute top-3 end-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-500 hover:text-red-500 shadow-sm transition"
        >
          ♥
        </button>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded-lg">
              {t('product.out_of_stock')}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
          {i18n.language === 'ar' ? product.category.name_ar : product.category.name_en}
        </span>
        <h3 className="serif-title mt-1 text-base leading-snug line-clamp-2 text-stone-800 group-hover:text-brand-700 transition">
          {name}
        </h3>
        {product.authors.length > 0 && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-1">{product.authors.slice(0, 2).join('، ')}</p>
        )}
        <div className="mt-1.5">
          <RatingStars rating={product.rating_avg} showValue count={product.rating_count} size={13} />
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-bold text-stone-900">{formatMoney(product.price, i18n.language)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-stone-400 line-through">
                {formatMoney(product.compare_at_price, i18n.language)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {product.read_url && (
              <a
                href={product.read_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                title={t('product.free_read')}
                className="w-8 h-8 rounded-lg bg-stone-100 text-stone-500 hover:text-brand-700 hover:bg-brand-50 flex items-center justify-center transition"
              >
                <Eye size={14} />
              </a>
            )}
            <button
              onClick={addToCart}
              disabled={product.stock <= 0}
              aria-label={t('product.add_to_cart')}
              className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:bg-stone-200 disabled:text-stone-400 transition"
            >
              <ShoppingBag size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
