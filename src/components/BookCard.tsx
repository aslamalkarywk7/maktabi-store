import React, { useState } from 'react';
import { Download, Languages, Book as BookIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const [showLanguages, setShowLanguages] = useState(false);

  return (
    <motion.div 
      layout
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-black/5 group"
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-wider font-semibold rounded-full shadow-sm">
            {book.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="serif-title text-xl mb-1 group-hover:text-library-accent transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-stone-500 mb-4">{book.author}</p>
        <p className="text-sm text-stone-600 line-clamp-2 mb-6 h-10">
          {book.description}
        </p>

        <div className="relative">
          <button 
            onClick={() => setShowLanguages(!showLanguages)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-stone-50 hover:bg-library-accent hover:text-white rounded-xl transition-all duration-300 font-medium text-sm group/btn"
          >
            <Languages size={18} className="group-hover/btn:rotate-12 transition-transform" />
            <span>عرض اللغات المتاحة</span>
          </button>

          <AnimatePresence>
            {showLanguages && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-2 left-0 right-0 bg-white shadow-2xl rounded-xl p-2 border border-black/5 z-10 grid grid-cols-2 gap-1"
              >
                {book.versions.map((ver) => (
                  <a
                    key={ver.langCode}
                    href={ver.downloadUrl}
                    className="flex items-center justify-between gap-2 p-2 hover:bg-stone-50 rounded-lg transition-colors text-xs"
                  >
                    <span className="font-medium">{ver.language}</span>
                    <Download size={14} className="text-library-accent" />
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
