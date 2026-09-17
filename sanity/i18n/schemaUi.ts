import {NORA_STUDIO_NS} from './constants';

type StudioUiRow = {key: string; he: string; en: string; ar: string};

/**
 * Studio-only labels for schema titles/groups/fields.
 * Keys are reused when a Hebrew schema title already has a structure.* string.
 */
const extraUi: StudioUiRow[] = [
  {key: 'ui.content', he: 'תוכן', en: 'Content', ar: 'المحتوى'},
  {key: 'ui.settings', he: 'הגדרות', en: 'Settings', ar: 'الإعدادات'},
  {key: 'ui.seo', he: 'SEO', en: 'SEO', ar: 'SEO'},
  {key: 'ui.hero', he: 'הירו', en: 'Hero', ar: 'البطل'},
  {key: 'ui.intro', he: 'מבוא', en: 'Intro', ar: 'مقدمة'},
  {key: 'ui.whyUs', he: 'למה אנחנו', en: 'Why us', ar: 'لماذا نحن'},
  {key: 'ui.sectionHeadings', he: 'כותרות מקטעים', en: 'Section headings', ar: 'عناوين الأقسام'},
  {key: 'ui.featuredContent', he: 'תוכן מומלץ', en: 'Featured content', ar: 'محتوى مميز'},
  {key: 'ui.cta', he: 'קריאה ליצירת קשר', en: 'Contact call to action', ar: 'دعوة للتواصل'},
  {key: 'ui.mainTitle', he: 'כותרת ראשית', en: 'Main title', ar: 'العنوان الرئيسي'},
  {key: 'ui.subtitleDesc', he: 'תת-כותרת / תיאור', en: 'Subtitle / description', ar: 'العنوان الفرعي / الوصف'},
  {key: 'ui.heroImages', he: 'תמונות הירו', en: 'Hero images', ar: 'صور البطل'},
  {key: 'ui.eyebrow', he: 'שורה עליונה', en: 'Eyebrow', ar: 'السطر العلوي'},
  {key: 'ui.title', he: 'כותרת', en: 'Title', ar: 'العنوان'},
  {key: 'ui.subtitle', he: 'תת-כותרת', en: 'Subtitle', ar: 'العنوان الفرعي'},
  {key: 'ui.bgImage', he: 'תמונת רקע', en: 'Background image', ar: 'صورة الخلفية'},
  {key: 'ui.description', he: 'תיאור', en: 'Description', ar: 'الوصف'},
  {key: 'ui.introEyebrow', he: 'מבוא — שורה עליונה', en: 'Intro — eyebrow', ar: 'مقدمة — السطر العلوي'},
  {key: 'ui.introTitle', he: 'מבוא — כותרת', en: 'Intro — title', ar: 'مقدمة — العنوان'},
  {key: 'ui.introDesc', he: 'מבוא — תיאור', en: 'Intro — description', ar: 'مقدمة — الوصف'},
  {key: 'ui.introCards', he: 'מבוא — כרטיסים', en: 'Intro — cards', ar: 'مقدمة — البطاقات'},
  {key: 'ui.whyEyebrow', he: 'למה אנחנו — שורה עליונה', en: 'Why us — eyebrow', ar: 'لماذا نحن — السطر العلوي'},
  {key: 'ui.whyTitle', he: 'למה אנחנו — כותרת', en: 'Why us — title', ar: 'لماذا نحن — العنوان'},
  {key: 'ui.whySubtitle', he: 'למה אנחנו — תת-כותרת', en: 'Why us — subtitle', ar: 'لماذا نحن — العنوان الفرعي'},
  {key: 'ui.whyItems', he: 'למה אנחנו — פריטים', en: 'Why us — items', ar: 'لماذا نحن — العناصر'},
  {key: 'ui.processEyebrow', he: 'תהליך — שורה עליונה', en: 'Process — eyebrow', ar: 'العملية — السطر العلوي'},
  {key: 'ui.processTitle', he: 'תהליך — כותרת', en: 'Process — title', ar: 'العملية — العنوان'},
  {key: 'ui.processSubtitle', he: 'תהליך — תת-כותרת', en: 'Process — subtitle', ar: 'العملية — العنوان الفرعي'},
  {key: 'ui.servicesEyebrow', he: 'שירותים — שורה עליונה', en: 'Services — eyebrow', ar: 'الخدمات — السطر العلوي'},
  {key: 'ui.servicesTitle', he: 'שירותים — כותרת', en: 'Services — title', ar: 'الخدمات — العنوان'},
  {key: 'ui.servicesSubtitle', he: 'שירותים — תת-כותרת', en: 'Services — subtitle', ar: 'الخدمات — العنوان الفرعي'},
  {key: 'ui.projectsEyebrow', he: 'פרויקטים — שורה עליונה', en: 'Projects — eyebrow', ar: 'المشاريع — السطر العلوي'},
  {key: 'ui.projectsTitle', he: 'פרויקטים — כותרת', en: 'Projects — title', ar: 'المشاريع — العنوان'},
  {key: 'ui.projectsSubtitle', he: 'פרויקטים — תת-כותרת', en: 'Projects — subtitle', ar: 'المشاريع — العنوان الفرعي'},
  {key: 'ui.materialsEyebrow', he: 'חומרים — שורה עליונה', en: 'Materials — eyebrow', ar: 'المواد — السطر العلوي'},
  {key: 'ui.materialsTitle', he: 'חומרים — כותרת', en: 'Materials — title', ar: 'المواد — العنوان'},
  {key: 'ui.materialsSubtitle', he: 'חומרים — תת-כותרת', en: 'Materials — subtitle', ar: 'المواد — العنوان الفرعي'},
  {key: 'ui.testimonialsEyebrow', he: 'המלצות — שורה עליונה', en: 'Testimonials — eyebrow', ar: 'التوصيات — السطر العلوي'},
  {key: 'ui.testimonialsTitle', he: 'המלצות — כותרת', en: 'Testimonials — title', ar: 'التوصيات — العنوان'},
  {key: 'ui.testimonialsSubtitle', he: 'המלצות — תת-כותרת', en: 'Testimonials — subtitle', ar: 'التوصيات — العنوان الفرعي'},
  {key: 'ui.homeServices', he: 'שירותים בעמוד הבית', en: 'Homepage services', ar: 'خدمات الصفحة الرئيسية'},
  {key: 'ui.homeProjects', he: 'פרויקטים בעמוד הבית', en: 'Homepage projects', ar: 'مشاريع الصفحة الرئيسية'},
  {key: 'ui.ctaTitle', he: 'CTA — כותרת', en: 'CTA — title', ar: 'دعوة الإجراء — العنوان'},
  {key: 'ui.ctaSubtitle', he: 'CTA — תת-כותרת', en: 'CTA — subtitle', ar: 'دعوة الإجراء — العنوان الفرعي'},
  {key: 'ui.seoTitle', he: 'כותרת SEO', en: 'SEO title', ar: 'عنوان SEO'},
  {key: 'ui.seoDesc', he: 'תיאור SEO', en: 'SEO description', ar: 'وصف SEO'},
  {key: 'ui.shareImage', he: 'תמונת שיתוף', en: 'Share image', ar: 'صورة المشاركة'},
  {key: 'ui.displayOrder', he: 'סדר תצוגה', en: 'Display order', ar: 'ترتيب العرض'},
  {key: 'ui.featuredHome', he: 'מומלץ / בעמוד הבית', en: 'Featured / homepage', ar: 'مميز / الصفحة الرئيسية'},
  {key: 'ui.visible', he: 'מוצג באתר', en: 'Visible on the site', ar: 'ظاهر في الموقع'},
  {key: 'ui.featured', he: 'מומלץ', en: 'Featured', ar: 'مميز'},
  {key: 'ui.featuredPlural', he: 'מומלצים', en: 'Featured', ar: 'مميز'},
  {key: 'ui.companyDesc', he: 'תיאור החברה', en: 'Company description', ar: 'وصف الشركة'},
  {key: 'ui.mission', he: 'ייעוד', en: 'Mission', ar: 'الرسالة'},
  {key: 'ui.vision', he: 'חזון', en: 'Vision', ar: 'الرؤية'},
  {key: 'ui.valuesTitle', he: 'כותרת ערכים', en: 'Values title', ar: 'عنوان القيم'},
  {key: 'ui.values', he: 'ערכים', en: 'Values', ar: 'القيم'},
  {key: 'ui.steps', he: 'שלבים', en: 'Steps', ar: 'الخطوات'},
  {key: 'ui.number', he: 'מספר', en: 'Number', ar: 'الرقم'},
  {key: 'ui.imageIcon', he: 'תמונה / אייקון', en: 'Image / icon', ar: 'صورة / أيقونة'},
  {key: 'ui.editorNote', he: 'הערה לעורכים', en: 'Note for editors', ar: 'ملاحظة للمحررين'},
  {key: 'ui.faqPageTitle', he: 'שאלות נפוצות — כותרת העמוד', en: 'FAQ — page title', ar: 'الأسئلة الشائعة — عنوان الصفحة'},
  {key: 'ui.blogPageTitle', he: 'בלוג — כותרת העמוד', en: 'Blog — page title', ar: 'المدونة — عنوان الصفحة'},
  {key: 'ui.nav', he: 'ניווט', en: 'Navigation', ar: 'التنقل'},
  {key: 'ui.buttons', he: 'כפתורים', en: 'Buttons', ar: 'الأزرار'},
  {key: 'ui.footer', he: 'פוטר', en: 'Footer', ar: 'التذييل'},
  {key: 'ui.projectCategories', he: 'קטגוריות פרויקטים', en: 'Project categories', ar: 'فئات المشاريع'},
  {key: 'ui.language', he: 'שפה', en: 'Language', ar: 'اللغة'},
  {key: 'ui.hebrew', he: 'עברית', en: 'Hebrew', ar: 'العبرية'},
  {key: 'ui.callUs', he: 'התקשרו אלינו', en: 'Call us', ar: 'اتصلوا بنا'},
  {key: 'ui.whatsapp', he: 'וואטסאפ', en: 'WhatsApp', ar: 'واتساب'},
  {key: 'ui.viewWork', he: 'צפו בעבודות', en: 'View work', ar: 'شاهدوا الأعمال'},
  {key: 'ui.learnMore', he: 'למידע נוסף', en: 'Learn more', ar: 'المزيد'},
  {key: 'ui.viewAll', he: 'הצג הכול', en: 'View all', ar: 'عرض الكل'},
  {key: 'ui.viewProject', he: 'צפו בפרויקט', en: 'View project', ar: 'شاهدوا المشروع'},
  {key: 'ui.readMore', he: 'קראו עוד', en: 'Read more', ar: 'اقرأوا المزيد'},
  {key: 'ui.backHome', he: 'חזרה לדף הבית', en: 'Back to home', ar: 'العودة للرئيسية'},
  {key: 'ui.all', he: 'הכול', en: 'All', ar: 'الكل'},
  {key: 'ui.footerCta', he: 'קריאה בפוטר', en: 'Footer call to action', ar: 'دعوة التذييل'},
  {key: 'ui.footerTagline', he: 'סלוגן בפוטר', en: 'Footer tagline', ar: 'شعار التذييل'},
  {key: 'ui.footerServicesTitle', he: 'כותרת שירותים בפוטר', en: 'Footer services title', ar: 'عنوان الخدمات في التذييل'},
  {key: 'ui.footerNavTitle', he: 'כותרת ניווט בפוטר', en: 'Footer navigation title', ar: 'عنوان التنقل في التذيיל'},
  {key: 'ui.footerContactTitle', he: 'כותרת יצירת קשר בפוטר', en: 'Footer contact title', ar: 'عنوان التواصل في التذييل'},
  {key: 'ui.languagesTitle', he: 'כותרת שפות', en: 'Languages title', ar: 'عنوان اللغات'},
  {key: 'ui.notFoundTitle', he: 'כותרת 404', en: '404 title', ar: 'عنوان 404'},
  {key: 'ui.notFoundBody', he: 'טקסט 404', en: '404 text', ar: 'نص 404'},
  {key: 'ui.relatedProjects', he: 'פרויקטים קשורים', en: 'Related projects', ar: 'مشاريع ذات صلة'},
  {key: 'ui.catAll', he: 'קטגוריה: הכול', en: 'Category: all', ar: 'الفئة: الكل'},
  {key: 'ui.catKitchens', he: 'קטגוריה: מטבחים', en: 'Category: kitchens', ar: 'الفئة: مطابخ'},
  {key: 'ui.catBedrooms', he: 'קטגוריה: חדרי שינה', en: 'Category: bedrooms', ar: 'الفئة: غرف نوم'},
  {key: 'ui.catWardrobes', he: 'קטגוריה: ארונות', en: 'Category: wardrobes', ar: 'الفئة: خزائن'},
  {key: 'ui.catFurniture', he: 'קטגוריה: ריהוט', en: 'Category: furniture', ar: 'الفئة: أثاث'},
  {key: 'ui.catCommercial', he: 'קטגוריה: מסחרי', en: 'Category: commercial', ar: 'الفئة: تجاري'},
  {key: 'ui.brand', he: 'מותג', en: 'Brand', ar: 'العلامة'},
  {key: 'ui.social', he: 'רשתות חברתיות', en: 'Social networks', ar: 'شبكات التواصل'},
  {key: 'ui.brandName', he: 'שם המותג', en: 'Brand name', ar: 'اسم العلامة'},
  {key: 'ui.tagline', he: 'סלוגן', en: 'Tagline', ar: 'الشعار'},
  {key: 'ui.pillars', he: 'שורת עמוד הבית (מעל הכותרת)', en: 'Homepage line (above the title)', ar: 'سطر الصفحة الرئيسية (فوق العنوان)'},
  {key: 'ui.logoLight', he: 'לוגו (רקע בהיר)', en: 'Logo (light background)', ar: 'الشعار (خلفية فاتحة)'},
  {key: 'ui.logoDark', he: 'לוגו (רקע כהה / פוטר)', en: 'Logo (dark background / footer)', ar: 'الشعار (خلفية داكنة / تذييل)'},
  {key: 'ui.phoneDisplay', he: 'טלפון לתצוגה', en: 'Phone (display)', ar: 'الهاتف للعرض'},
  {key: 'ui.phoneTel', he: 'טלפון ללחיצה (E.164)', en: 'Phone for tap-to-call (E.164)', ar: 'هاتف للاتصال (E.164)'},
  {key: 'ui.whatsappDigits', he: 'וואטסאפ (ספרות בלבד)', en: 'WhatsApp (digits only)', ar: 'واتساب (أرقام فقط)'},
  {key: 'ui.email', he: 'אימייל', en: 'Email', ar: 'البريد الإلكتروني'},
  {key: 'ui.address', he: 'כתובת', en: 'Address', ar: 'العنوان'},
  {key: 'ui.hours', he: 'שעות פעילות', en: 'Opening hours', ar: 'ساعات العمل'},
  {key: 'ui.whatsappDefault', he: 'הודעת וואטסאפ כברירת מחדל', en: 'Default WhatsApp message', ar: 'رسالة واتساب الافتراضية'},
  {key: 'ui.contactQr', he: 'קוד QR (עמוד יצירת קשר)', en: 'QR code (contact page)', ar: 'رمز QR (صفحة التواصل)'},
  {key: 'ui.mapUrl', he: 'קישור למפה', en: 'Map link', ar: 'رابط الخريطة'},
  {key: 'ui.shortDesc', he: 'תיאור קצר', en: 'Short description', ar: 'وصف مختصر'},
  {key: 'ui.fullDesc', he: 'תיאור מלא', en: 'Full description', ar: 'وصف كامل'},
  {key: 'ui.mainImage', he: 'תמונה ראשית', en: 'Main image', ar: 'الصورة الرئيسية'},
  {key: 'ui.imageAlt', he: 'טקסט חלופי לתמונה', en: 'Image alt text', ar: 'النص البديل للصورة'},
  {key: 'ui.gallery', he: 'גלריה', en: 'Gallery', ar: 'المعرض'},
  {key: 'ui.features', he: 'יתרונות', en: 'Features', ar: 'المميزات'},
  {key: 'ui.projectName', he: 'שם הפרויקט', en: 'Project name', ar: 'اسم المشروع'},
  {key: 'ui.category', he: 'קטגוריה', en: 'Category', ar: 'الفئة'},
  {key: 'ui.kitchens', he: 'מטבחים', en: 'Kitchens', ar: 'مطابخ'},
  {key: 'ui.bedrooms', he: 'חדרי שינה', en: 'Bedrooms', ar: 'غرف نوم'},
  {key: 'ui.wardrobes', he: 'ארונות', en: 'Wardrobes', ar: 'خزائن'},
  {key: 'ui.furniture', he: 'ריהוט', en: 'Furniture', ar: 'أثاث'},
  {key: 'ui.commercial', he: 'מסחרי', en: 'Commercial', ar: 'تجاري'},
  {key: 'ui.location', he: 'מיקום', en: 'Location', ar: 'الموقع'},
  {key: 'ui.completedAt', he: 'תאריך השלמה', en: 'Completion date', ar: 'تاريخ الإنجاز'},
  {key: 'ui.altText', he: 'טקסט חלופי', en: 'Alt text', ar: 'النص البديل'},
  {key: 'ui.materialSlugs', he: 'חומרים (slug, לדוגמה mdf)', en: 'Materials (slug, e.g. mdf)', ar: 'المواد (slug، مثل mdf)'},
  {key: 'ui.name', he: 'שם', en: 'Name', ar: 'الاسم'},
  {key: 'ui.woodVeneer', he: 'עץ / ציפוי', en: 'Wood / veneer', ar: 'خشب / قشرة'},
  {key: 'ui.boards', he: 'לוחות', en: 'Boards', ar: 'ألواح'},
  {key: 'ui.surfaces', he: 'משטחים', en: 'Surfaces', ar: 'أسطح'},
  {key: 'ui.metalGlass', he: 'מתכת / זכוכית', en: 'Metal / glass', ar: 'معدن / زجاج'},
  {key: 'ui.characteristics', he: 'מאפיינים', en: 'Characteristics', ar: 'الخصائص'},
  {key: 'ui.applications', he: 'שימושים', en: 'Uses', ar: 'الاستخدامات'},
  {key: 'ui.finishes', he: 'גימורים', en: 'Finishes', ar: 'التشطيبات'},
  {key: 'ui.image', he: 'תמונה', en: 'Image', ar: 'صورة'},
  {key: 'ui.excerpt', he: 'תקציר', en: 'Excerpt', ar: 'مقتطف'},
  {key: 'ui.tags', he: 'תגיות', en: 'Tags', ar: 'وسوم'},
  {key: 'ui.author', he: 'כותב', en: 'Author', ar: 'الكاتب'},
  {key: 'ui.publishDate', he: 'תאריך פרסום', en: 'Publish date', ar: 'تاريخ النشر'},
  {key: 'ui.coverImage', he: 'תמונת שער', en: 'Cover image', ar: 'صورة الغلاف'},
  {key: 'ui.question', he: 'שאלה', en: 'Question', ar: 'السؤال'},
  {key: 'ui.answer', he: 'תשובה', en: 'Answer', ar: 'الجواب'},
  {key: 'ui.clientName', he: 'שם הלקוח', en: 'Client name', ar: 'اسم العميل'},
  {key: 'ui.rating', he: 'דירוג', en: 'Rating', ar: 'التقييم'},
  {key: 'ui.review', he: 'המלצה', en: 'Testimonial', ar: 'التوصية'},
  {key: 'ui.projectType', he: 'סוג הפרויקט', en: 'Project type', ar: 'نوع المشروع'},
  {key: 'ui.avatar', he: 'תמונה / אווטאר', en: 'Image / avatar', ar: 'صورة / أفاتار'},
  {key: 'ui.localeString', he: 'טקסט רב-לשוני', en: 'Multilingual text', ar: 'نص متعدد اللغات'},
  {key: 'ui.localeText', he: 'פסקה רב-לשונית', en: 'Multilingual paragraph', ar: 'فقرة متعددة اللغات'},
  {key: 'ui.heDefault', he: 'עברית (ברירת מחדל באתר)', en: 'Hebrew (website default)', ar: 'العبرية (الافتراضي في الموقع)'},
];

const reuseExistingTitleKey: Record<string, string> = {
  'דף הבית': 'structure.home',
  'אודות': 'structure.about',
  'שירותים': 'structure.services',
  'פרויקטים': 'structure.projects',
  'חומרים': 'structure.materials',
  'איך אנחנו עובדים': 'structure.howWeWork',
  'המלצות': 'structure.testimonials',
  'שאלות נפוצות': 'structure.faq',
  'יצירת קשר': 'structure.contact',
  'בלוג': 'structure.blog',
  'הגדרות האתר': 'structure.websiteSettings',
  'תפריט וטקסטים': 'structure.uiLabels',
  'מדיה': 'structure.media',
  'כותרת העמוד': 'structure.faqPage',
  'מאמרים': 'structure.blogPosts',
  'שאלות': 'structure.faqItems',
  'סקירה': 'structure.overview',
};

const titleToKey: Record<string, string> = {
  ...reuseExistingTitleKey,
  ...Object.fromEntries(extraUi.map((row) => [row.he, row.key])),
};

export function studioUiResources(lang: 'en' | 'ar' | 'he'): Record<string, string> {
  return Object.fromEntries(extraUi.map((row) => [row.key, row[lang]]));
}

export function studioUiTitleKey(title: string): string | undefined {
  return titleToKey[title];
}

function withTitleI18n<T extends {title?: unknown; i18n?: unknown}>(node: T): T {
  if (typeof node.title !== 'string') return node;
  const key = studioUiTitleKey(node.title);
  if (!key) return node;
  return {
    ...node,
    i18n: {
      ...(typeof node.i18n === 'object' && node.i18n ? node.i18n : {}),
      title: {key, ns: NORA_STUDIO_NS},
    },
  };
}

function localizeNode<T>(node: T): T {
  if (!node || typeof node !== 'object') return node;
  const src = node as Record<string, unknown>;
  let next: Record<string, unknown> = withTitleI18n(src);

  if (Array.isArray(next.groups)) {
    next = {...next, groups: next.groups.map((group) => localizeNode(group))};
  }
  if (Array.isArray(next.fieldsets)) {
    next = {...next, fieldsets: next.fieldsets.map((fieldset) => localizeNode(fieldset))};
  }
  if (Array.isArray(next.fields)) {
    next = {...next, fields: next.fields.map((field) => localizeNode(field))};
  }
  if (Array.isArray(next.of)) {
    next = {...next, of: next.of.map((item) => localizeNode(item))};
  }
  if (Array.isArray(next.orderings)) {
    next = {...next, orderings: next.orderings.map((ordering) => localizeNode(ordering))};
  }
  if (Array.isArray(next.options) === false && next.options && typeof next.options === 'object') {
    const options = next.options as {list?: unknown};
    if (Array.isArray(options.list)) {
      next = {
        ...next,
        options: {
          ...options,
          list: options.list.map((item) => localizeNode(item)),
        },
      };
    }
  }

  return next as T;
}

/** Adds Sanity i18n title keys. Does not change the content model. */
export function withStudioUiI18n<T>(types: T[]): T[] {
  return types.map((type) => localizeNode(type));
}
