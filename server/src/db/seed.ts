import bcrypt from 'bcryptjs';
import {db} from './connection';
import {derivePrice, searchOpenLibrary, slugify, type ImportedBook} from '../services/openlibrary';

/**
 * Seeds the store: users, genres, and a curated catalog of real books whose
 * metadata is imported live from Open Library. Prices/stock are derived
 * deterministically so reseeding is stable.
 *
 * Open Library requests are awaited BEFORE the synchronous SQLite
 * transaction runs (better-sqlite3 transactions cannot contain awaits).
 */

const GENRES = [
  {slug: 'fiction', name_ar: 'روايات وأدب', name_en: 'Fiction & Literature', q: 'subject:fiction'},
  {slug: 'philosophy', name_ar: 'فلسفة', name_en: 'Philosophy', q: 'subject:philosophy'},
  {slug: 'history', name_ar: 'تاريخ', name_en: 'History', q: 'subject:history'},
  {slug: 'science', name_ar: 'علوم', name_en: 'Science', q: 'subject:science'},
  {slug: 'poetry', name_ar: 'شعر', name_en: 'Poetry', q: 'subject:poetry'},
  {slug: 'children', name_ar: 'أدب أطفال', name_en: "Children's Books", q: 'subject:children'},
];

const BOOKS_PER_GENRE = 4;

const descAr = (b: ImportedBook) =>
  `طبعة مميزة من «${b.title}»${b.authors.length ? ` للكاتب ${b.authors[0]}` : ''}${b.year ? ` (نُشر أولًا عام ${b.year})` : ''}. نسخة عالية الجودة بغلاف متين، مع إمكانية القراءة المجانية عبر مكتبة Open Library.`;
const descEn = (b: ImportedBook) =>
  `A premium edition of “${b.title}”${b.authors.length ? ` by ${b.authors[0]}` : ''}${b.year ? ` (first published ${b.year})` : ''}. High-quality printing with a durable binding — plus free digital reading via Open Library.`;

export async function seed(): Promise<void> {
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get() as {n: number};
  if (count.n > 0) {
    console.log('Database already seeded — skipping.');
    return;
  }

  // Pass 1 — fetch book metadata from Open Library (network, async)
  const seenKeys = new Set<string>();
  const perGenre: {genre: (typeof GENRES)[number]; books: ImportedBook[]}[] = [];
  for (const genre of GENRES) {
    let books: ImportedBook[] = [];
    try {
      books = await searchOpenLibrary(genre.q, BOOKS_PER_GENRE + 4);
    } catch (err) {
      console.warn(`Open Library fetch failed for ${genre.slug}:`, (err as Error).message);
    }
    // A work can match several genres — keep the first occurrence only
    const unique = books.filter(b => (seenKeys.has(b.ol_key) ? false : (seenKeys.add(b.ol_key), true)));
    perGenre.push({genre, books: unique.slice(0, BOOKS_PER_GENRE)});
  }

  // Pass 2 — insert everything in one synchronous transaction
  const tx = db.transaction(() => {
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)');
    const admin = insertUser.run('Admin', 'admin@maktabi.com', bcrypt.hashSync('Admin@123', 10), 'admin', '+966500000000');
    const sara = insertUser.run('Sara Ahmed', 'sara@example.com', bcrypt.hashSync('User@123', 10), 'customer', '+966511111111');
    const omar = insertUser.run('Omar Khaled', 'omar@example.com', bcrypt.hashSync('User@123', 10), 'customer', '+966522222222');
    const saraId = Number(sara.lastInsertRowid);
    const omarId = Number(omar.lastInsertRowid);
    void admin;

    db.prepare('INSERT INTO addresses (user_id, label, line1, city, country, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, 1)')
      .run(saraId, 'Home', 'King Fahd Rd, Al Olaya', 'Riyadh', 'Saudi Arabia', '+966511111111');

    const insertCoupon = db.prepare('INSERT INTO coupons (code, type, value, min_subtotal, max_uses, expires_at, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)');
    insertCoupon.run('WELCOME10', 'percent', 10, 10000, 500, '2027-12-31');
    insertCoupon.run('SAVE50', 'fixed', 5000, 30000, 200, '2027-12-31');

    const insertGenre = db.prepare('INSERT INTO categories (slug, name_ar, name_en) VALUES (?, ?, ?)');
    const insertBook = db.prepare(`
      INSERT INTO products (sku, slug, name_ar, name_en, description_ar, description_en, price, compare_at_price,
        stock, category_id, brand, images, specs, is_featured, ol_key, ol_cover_id, ol_ia, authors, pub_year,
        format, isbn, pages, book_language)
      VALUES (@sku, @slug, @name_ar, @name_en, @description_ar, @description_en, @price, @compare_at_price,
        @stock, @category_id, @brand, @images, @specs, @is_featured, @ol_key, @ol_cover_id, @ol_ia, @authors,
        @pub_year, @format, @isbn, @pages, @book_language)
    `);

    let i = 0;
    for (const {genre, books} of perGenre) {
      const genreId = Number(insertGenre.run(genre.slug, genre.name_ar, genre.name_en).lastInsertRowid);
      for (const b of books) {
        i += 1;
        const {price, compareAt} = derivePrice(b.ol_key);
        insertBook.run({
          sku: `BOK-${String(i).padStart(3, '0')}-${b.ol_key.slice(-4).toUpperCase()}`,
          slug: slugify(b.title, b.ol_key.slice(-6)),
          name_ar: b.title, // OL titles are mostly English; editable in admin
          name_en: b.title,
          description_ar: descAr(b),
          description_en: descEn(b),
          price,
          compare_at_price: compareAt,
          stock: 8 + (i % 5) * 6,
          category_id: genreId,
          brand: b.publisher,
          images: JSON.stringify(b.coverUrl ? [b.coverUrl] : []),
          specs: JSON.stringify({}),
          is_featured: i % 5 === 1 ? 1 : 0,
          ol_key: b.ol_key,
          ol_cover_id: b.coverId,
          ol_ia: b.ia,
          authors: JSON.stringify(b.authors),
          pub_year: b.year,
          format: 'paperback',
          isbn: b.isbn,
          pages: b.pages,
          book_language: b.language,
        });
      }
    }

    // Sample reviews on the first few imported books
    const firstIds = db.prepare('SELECT id FROM products ORDER BY id LIMIT 4').all() as {id: number}[];
    const sampleReviews = [
      [saraId, 5, 'Beautiful edition', 'The binding quality exceeded my expectations.'],
      [omarId, 4, 'Great read', 'Fast delivery and a classic worth owning in print.'],
      [saraId, 5, 'A must-have', 'Free digital copy alongside the print edition is a brilliant touch.'],
      [omarId, 4, 'Solid purchase', 'Exactly as described — would buy again.'],
    ] as const;
    firstIds.forEach((row, idx) => {
      const [uid, rating, title, body] = sampleReviews[idx % sampleReviews.length];
      db.prepare('INSERT INTO reviews (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)')
        .run(row.id, uid, rating, title, body);
    });

    db.exec(`
      UPDATE products SET
        rating_avg = COALESCE((SELECT ROUND(AVG(rating), 2) FROM reviews WHERE product_id = products.id), 0),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = products.id)
    `);
  });

  tx();
  const total = (db.prepare('SELECT COUNT(*) AS n FROM products').get() as {n: number}).n;
  console.log(`Seeded: ${GENRES.length} genres, ${total} books (Open Library), users, coupons, reviews.`);
}
