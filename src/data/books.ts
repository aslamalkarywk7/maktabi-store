import { Book } from '../types';

export const BOOKS: Book[] = [
  {
    id: '1',
    title: 'مقدمة في علوم الحاسب',
    author: 'أحمد محمود',
    description: 'دليل شامل لأساسيات البرمجة وعلوم الحاسب باللغة العربية ومترجم لعدة لغات عالمية.',
    category: 'تقنية',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    versions: [
      { language: 'العربية', langCode: 'ar', downloadUrl: '#' },
      { language: 'English', langCode: 'en', downloadUrl: '#' },
      { language: 'Français', langCode: 'fr', downloadUrl: '#' },
      { language: 'Español', langCode: 'es', downloadUrl: '#' },
      { language: 'Deutsch', langCode: 'de', downloadUrl: '#' },
    ]
  },
  {
    id: '2',
    title: 'تاريخ الحضارات القديمة',
    author: 'د. سارة خالد',
    description: 'رحلة عبر الزمن لاستكشاف أعظم الحضارات التي عرفتها البشرية وتأثيرها على عالمنا اليوم.',
    category: 'تاريخ',
    coverImage: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&q=80&w=400',
    versions: [
      { language: 'العربية', langCode: 'ar', downloadUrl: '#' },
      { language: 'English', langCode: 'en', downloadUrl: '#' },
      { language: 'Français', langCode: 'fr', downloadUrl: '#' },
      { language: 'Español', langCode: 'es', downloadUrl: '#' },
      { language: 'Deutsch', langCode: 'de', downloadUrl: '#' },
    ]
  },
  {
    id: '3',
    title: 'أدب الرحلات المعاصر',
    author: 'عمر ياسين',
    description: 'مجموعة من القصص والتجارب الشخصية لرحالة جابوا العالم ووثقوا تجاربهم بلغات مختلفة.',
    category: 'أدب',
    coverImage: 'https://images.unsplash.com/photo-1501503060443-ef4aa6693b2d?auto=format&fit=crop&q=80&w=400',
    versions: [
      { language: 'العربية', langCode: 'ar', downloadUrl: '#' },
      { language: 'English', langCode: 'en', downloadUrl: '#' },
      { language: 'Français', langCode: 'fr', downloadUrl: '#' },
      { language: 'Español', langCode: 'es', downloadUrl: '#' },
      { language: 'Deutsch', langCode: 'de', downloadUrl: '#' },
    ]
  },
  {
    id: '4',
    title: 'أساسيات الاقتصاد الكلي',
    author: 'ليلى إبراهيم',
    description: 'فهم أعمق للأنظمة الاقتصادية العالمية والسياسات المالية بأسلوب مبسط وشامل.',
    category: 'اقتصاد',
    coverImage: 'https://images.unsplash.com/photo-1518186230481-32a246e45d4e?auto=format&fit=crop&q=80&w=400',
    versions: [
      { language: 'العربية', langCode: 'ar', downloadUrl: '#' },
      { language: 'English', langCode: 'en', downloadUrl: '#' },
      { language: 'Français', langCode: 'fr', downloadUrl: '#' },
      { language: 'Español', langCode: 'es', downloadUrl: '#' },
      { language: 'Deutsch', langCode: 'de', downloadUrl: '#' },
    ]
  }
];
