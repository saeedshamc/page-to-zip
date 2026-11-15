// سیستم ترجمه

const translations = {
  'fa': {
    // Header
    'title': 'دانلود کامل صفحه',
    'themeToggle': '🌙',

    // Profiles
    'profilesHeader': 'پروفایل‌های تنظیمات',
    'currentProfile': 'پروفایل فعلی',
    'defaultProfile': 'پیش‌فرض',
    'saveProfile': 'ذخیره پروفایل',
    'deleteProfile': 'حذف پروفایل',

    // Presets
    'presetsHeader': 'پروفایل‌های آماده',
    'presetComplete': 'بلاگ کامل',
    'presetText': 'فقط متن',
    'presetLightweight': 'دریفت',
    'presetArchive': 'آرشیو',

    // Resources
    'resourcesHeader': 'تنظیمات منابع',
    'includeImages': 'دانلود تصاویر',
    'includeVideos': 'دانلود ویدیوها',
    'includeAudio': 'دانلود فایل‌های صوتی',
    'includeFonts': 'دانلود فونت‌ها',
    'maxFileSize': 'حداکثر حجم فایل (MB)',

    // Export
    'exportHeader': 'فرمت خروجی',
    'exportFormat': 'فرمت خروجی',
    'exportZip': 'ZIP (پیش‌فرض)',
    'exportMhtml': 'MHTML (تک فایل)',
    'exportPdf': 'PDF (حفظ فرمت)',

    // Crawling
    'crawlingHeader': 'تنظیمات خزش (Crawling)',
    'enableCrawling': 'فعال‌سازی خزش صفحات',
    'crawlDepth': 'عمق خزش (تعداد لایه)',
    'maxPages': 'حداکثر صفحات',
    'followInternalLinks': 'فقط لینک‌های داخلی',
    'sameDomain': 'فقط همان دامنه',
    'nofollowIgnore': 'نادیده گرفتن لینک‌های nofollow',
    'pathFilter': 'فیلتر مسیر URL',
    'crawlIncludePattern': 'الگوی شامل خزش (Regex)',
    'crawlExcludePattern': 'الگوی حذف خزش (Regex)',

    // Advanced Filtering
    'filteringHeader': 'فیلتر پیشرفته منابع',
    'urlPattern': 'الگوی URL (Regex)',
    'excludePattern': 'الگوی حذف (Regex)',
    'minFileSize': 'حداقل حجم فایل (KB)',
    'excludeExternalDomains': 'حذف دامنه‌های خارجی',

    // Rate Limiting
    'rateLimitHeader': 'محدودیت سرعت دانلود',
    'downloadSpeedLimit': 'محدودیت سرعت (KB/s)',
    'requestDelay': 'تاخیر درخواست (ms)',

    // Timeouts
    'timeoutHeader': 'تنظیمات زمانی',
    'requestTimeout': 'تایم‌اوت درخواست (ثانیه)',
    'pageLoadTimeout': 'تایم‌اوت لود صفحه (ثانیه)',
    'maxDownloadTime': 'حداکثر زمان دانلود (دقیقه)',
    'followRedirects': 'پیروی از ریدایرکت‌ها',

    // Queue
    'queueHeader': 'صف دانلود',
    'queueEmpty': 'صف دانلود خالی است',

    // History
    'historyHeader': 'تاریخچه دانلود',
    'historyEmpty': 'تاریخچه خالی است',
    'clearHistory': 'پاک کردن تاریخچه',

    // Actions
    'downloadBtn': 'دانلود صفحه',
    'previewBtn': 'پیش‌نمایش تنظیمات',
    'viewZipBtn': 'نمایش ZIP',

    // Shortcuts
    'shortcutsHeader': 'میانبرهای کیبورد',
    'shortcutOpenPopup': 'باز کردن پاپ‌آپ',
    'shortcutQuickDownload': 'دانلود سریع',
    'shortcutToggleTheme': 'تغییر تم',

    // Status
    'shortcutHint': 'از میانبرهای کیبورد استفاده کنید: Ctrl+Shift+D/S/T',

    // Preview Modal
    'previewTitle': 'پیش‌نمایش تنظیمات دانلود',
    'previewCancel': 'لغو',
    'previewConfirm': 'تایید و دانلود'
  },
  'en': {
    // Header
    'title': 'Full Page Downloader',
    'themeToggle': '🌙',

    // Profiles
    'profilesHeader': 'Settings Profiles',
    'currentProfile': 'Current Profile',
    'defaultProfile': 'Default',
    'saveProfile': 'Save Profile',
    'deleteProfile': 'Delete Profile',

    // Presets
    'presetsHeader': 'Preset Profiles',
    'presetComplete': 'Complete Blog',
    'presetText': 'Text Only',
    'presetLightweight': 'Lightweight',
    'presetArchive': 'Archive',

    // Resources
    'resourcesHeader': 'Resource Settings',
    'includeImages': 'Download Images',
    'includeVideos': 'Download Videos',
    'includeAudio': 'Download Audio',
    'includeFonts': 'Download Fonts',
    'maxFileSize': 'Max File Size (MB)',

    // Export
    'exportHeader': 'Export Format',
    'exportFormat': 'Export Format',
    'exportZip': 'ZIP (Default)',
    'exportMhtml': 'MHTML (Single File)',
    'exportPdf': 'PDF (Format Preserved)',

    // Crawling
    'crawlingHeader': 'Crawling Settings',
    'enableCrawling': 'Enable Page Crawling',
    'crawlDepth': 'Crawl Depth (Layers)',
    'maxPages': 'Max Pages',
    'followInternalLinks': 'Internal Links Only',
    'sameDomain': 'Same Domain Only',
    'nofollowIgnore': 'Ignore Nofollow Links',
    'pathFilter': 'URL Path Filter',
    'crawlIncludePattern': 'Crawl Include Pattern (Regex)',
    'crawlExcludePattern': 'Crawl Exclude Pattern (Regex)',

    // Advanced Filtering
    'filteringHeader': 'Advanced Resource Filtering',
    'urlPattern': 'URL Pattern (Regex)',
    'excludePattern': 'Exclude Pattern (Regex)',
    'minFileSize': 'Min File Size (KB)',
    'excludeExternalDomains': 'Exclude External Domains',

    // Rate Limiting
    'rateLimitHeader': 'Download Rate Limit',
    'downloadSpeedLimit': 'Speed Limit (KB/s)',
    'requestDelay': 'Request Delay (ms)',

    // Timeouts
    'timeoutHeader': 'Timeout Settings',
    'requestTimeout': 'Request Timeout (seconds)',
    'pageLoadTimeout': 'Page Load Timeout (seconds)',
    'maxDownloadTime': 'Max Download Time (minutes)',
    'followRedirects': 'Follow Redirects',

    // Queue
    'queueHeader': 'Download Queue',
    'queueEmpty': 'Download queue is empty',

    // History
    'historyHeader': 'Download History',
    'historyEmpty': 'History is empty',
    'clearHistory': 'Clear History',

    // Actions
    'downloadBtn': 'Download Page',
    'previewBtn': 'Preview Settings',
    'viewZipBtn': 'View ZIP',

    // Shortcuts
    'shortcutsHeader': 'Keyboard Shortcuts',
    'shortcutOpenPopup': 'Open Popup',
    'shortcutQuickDownload': 'Quick Download',
    'shortcutToggleTheme': 'Toggle Theme',

    // Status
    'shortcutHint': 'Use keyboard shortcuts: Ctrl+Shift+D/S/T',

    // Preview Modal
    'previewTitle': 'Download Settings Preview',
    'previewCancel': 'Cancel',
    'previewConfirm': 'Confirm & Download'
  }
};

// زبان فعلی
let currentLanguage = 'fa';

// تغییر زبان
function setLanguage(lang) {
  currentLanguage = lang;
  applyTranslations();
  chrome.storage.local.set({ language: lang });
}

// اعمال ترجمه‌ها
function applyTranslations() {
  const lang = translations[currentLanguage];

  // بروزرسانی همه عناصر با data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (lang[key]) {
      if (el.tagName === 'INPUT' && el.type === 'text') {
        el.placeholder = lang[key];
      } else {
        el.textContent = lang[key];
      }
    }
  });
}

// بارگذاری زبان ذخیره شده
async function loadLanguage() {
  const result = await chrome.storage.local.get('language');
  currentLanguage = result.language || 'fa';
  applyTranslations();
}
