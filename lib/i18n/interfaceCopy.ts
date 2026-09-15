import type { LocalizedString } from '@/lib/content/types';
import { L } from '@/lib/i18n/locale';

/**
 * Chrome labels used in cards/badges that are not CMS-editable.
 * All four locales are required — never branch on a single language.
 */
export const INTERFACE_COPY = {
  contactChannels: L('ערוצי התקשרות', 'قنوات التواصل', 'Direct Channels', 'Прямые каналы'),
  email: L('אימייל', 'البريد الإلكتروني', 'Email', 'Эл. почта'),
  address: L('כתובת', 'العنوان', 'Address', 'Адрес'),
  workingHours: L('שעות פעילות', 'ساعات العمل', 'Working Hours', 'Часы работы'),
  scanQrTitle: L(
    'סריקה ליצירת קשר',
    'مسح الرمز للتواصل المباشر',
    'Scan to Connect',
    'Сканируйте, чтобы связаться',
  ),
  scanQrBody: L(
    'סרקו את קוד ה-QR במצלמת הטלפון כדי לפתוח שיחת WhatsApp.',
    'امسح رمز QR بكاميرا جوالك لبدء محادثة واتساب مباشرة.',
    'Scan the QR code with your phone camera to start a WhatsApp chat.',
    'Отсканируйте QR-код камерой телефона, чтобы начать чат в WhatsApp.',
  ),
  visionMission: L(
    'החזון והייעוד שלנו',
    'رؤيتنا ورسالتنا',
    'Our Vision & Mission',
    'Наше видение и миссия',
  ),
  corePrinciples: L('עקרונות היסוד', 'مبادئنا الأساسية', 'Core Principles', 'Основные принципы'),
  serviceFeatures: L('יתרונות השירות', 'مميزات الخدمة', 'Service Features', 'Особенности услуги'),
  premiumMaterial: L('חומר משובח', 'خامة فاخرة', 'Premium Material', 'Премиальный материал'),
  materialSpecs: L('מפרטי החומר', 'مواصفات الخامة', 'Material Specs', 'Характеристики'),
  article: L('מאמר', 'مقال', 'Article', 'Статья'),
  materialsUsed: L(
    'חומרים בשימוש',
    'المواد والخامات المستخدمة',
    'Materials Used',
    'Используемые материалы',
  ),
  exploreMore: L('גלו עוד', 'استكشف المزيد', 'Explore More', 'Смотреть ещё'),
} as const satisfies Record<string, LocalizedString>;
