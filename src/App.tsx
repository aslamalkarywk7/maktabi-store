import React, { useState, useMemo } from 'react';
import { Search, Book as BookIcon, Github, Menu, X, Globe, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BOOKS } from './data/books';
import BookCard from './components/BookCard';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const categories = useMemo(() => {
    const cats = new Set(BOOKS.map(b => b.category));
    return ['الكل', ...Array.from(cats)];
  }, []);

  const filteredBooks = useMemo(() => {
    return BOOKS.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-library-accent selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-warm-beige/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-library-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-library-accent/20">
              <BookIcon size={24} />
            </div>
            <h1 className="serif-title text-2xl font-bold tracking-tight">مكتبي</h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-library-accent transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-library-accent transition-colors">عن المكتبة</a>
            <a href="#" className="hover:text-library-accent transition-colors">اتصل بنا</a>
          </div>

          <div className="flex items-center gap-4">
             <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
               <Globe size={20} />
             </button>
             <button className="md:hidden p-2 hover:bg-black/5 rounded-full">
               <Menu size={20} />
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden px-6">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="serif-title text-5xl md:text-7xl mb-6 leading-[1.1]">
                اكتشف المعرفة <br /> 
                <span className="italic text-library-accent">بكل اللغات</span>
              </h2>
              <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                مكتبة رقمية متكاملة تتيح لك الوصول إلى مجموعة مختارة من الكتب والمؤلفات مترجمة لعدة لغات عالمية، متاحة للتحميل والقراءة مجاناً.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative max-w-xl mx-auto"
            >
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="ابحث عن عناوين أو مؤلفين..."
                className="w-full h-14 bg-white border border-black/5 rounded-2xl pr-12 pl-4 shadow-xl shadow-black/5 focus:outline-none focus:ring-2 focus:ring-library-accent/20 transition-all text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 select-none pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-library-accent/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Categories & Filter */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat 
                        ? 'bg-library-accent text-white shadow-lg' 
                        : 'bg-white hover:bg-stone-50 border border-black/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-stone-400">
                عرض {filteredBooks.length} من أصل {BOOKS.length} كتب
              </div>
            </div>

            {/* Books Grid */}
            <AnimatePresence mode="popLayout">
              {filteredBooks.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {filteredBooks.map((book) => (
                    <div key={book.id}>
                      <BookCard book={book} />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center"
                >
                  <div className="inline-flex w-16 h-16 bg-stone-100 rounded-full items-center justify-center text-stone-400 mb-4">
                    <Search size={32} />
                  </div>
                  <p className="text-stone-500">لم نجد أي كتب تطابق بحثك حالياً.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-library-accent rounded-lg flex items-center justify-center text-white">
                <BookIcon size={18} />
              </div>
              <span className="serif-title text-xl font-bold">مكتبي</span>
            </div>
            <p className="text-stone-500 max-w-sm leading-relaxed text-sm">
              نسعى لتسهيل الوصول للمعرفة وتجاوز حواجز اللغة من خلال توفير المحتوى الأكاديمي والأدبي بمختلف اللغات العالمية مجاناً للجميع.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">روابط سريعة</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li><a href="#" className="hover:text-library-accent transition-colors">أحدث الإصدارات</a></li>
              <li><a href="#" className="hover:text-library-accent transition-colors">الأكثر تحميلاً</a></li>
              <li><a href="#" className="hover:text-library-accent transition-colors">سياسة النشر</a></li>
              <li><a href="#" className="hover:text-library-accent transition-colors">الأسئلة الشائعة</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">تواصل معنا</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center hover:bg-library-accent hover:text-white transition-all">
                <Github size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center hover:bg-library-accent hover:text-white transition-all">
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} مكتبي - جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-library-accent transition-colors">شروط الخدمة</a>
            <a href="#" className="hover:text-library-accent transition-colors">الخصوصية</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
