importScripts('libs/jszip.min.js');

// ---------------------------------------------------------------------------
// تابعی که داخل خود صفحه (content) اجرا می‌شود تا HTML کامل و آدرس همه
// منابع وابسته (عکس، CSS، JS، آیکون و ...) را جمع‌آوری کند.
// ---------------------------------------------------------------------------
function collectPageData() {
  const abs = (u) => {
    try {
      // اگر data URI یا blob URL است، نادیده بگیر
      if (u.startsWith('data:') || u.startsWith('blob:')) return null;
      return new URL(u, document.baseURI).href;
    } catch (e) { return null; }
  };

  const resources = new Set();

  document.querySelectorAll('img[src]').forEach((el) => {
    const u = abs(el.getAttribute('src'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('img[srcset], source[srcset]').forEach((el) => {
    const srcset = el.getAttribute('srcset');
    if (!srcset) return;
    srcset.split(',').forEach((part) => {
      const url = part.trim().split(/\s+/)[0];
      const u = abs(url);
      if (u) resources.add(u);
    });
  });

  document.querySelectorAll('link[rel~="stylesheet"]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('link[rel~="preload"], link[rel~="prefetch"], link[rel~="prerender"]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('script[src]').forEach((el) => {
    const u = abs(el.getAttribute('src'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('link[rel*="icon"]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('video[src], audio[src], source[src], track[src]').forEach((el) => {
    const u = abs(el.getAttribute('src'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('video[poster]').forEach((el) => {
    const u = abs(el.getAttribute('poster'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('iframe[src]').forEach((el) => {
    const u = abs(el.getAttribute('src'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('object[data]').forEach((el) => {
    const u = abs(el.getAttribute('data'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('embed[src]').forEach((el) => {
    const u = abs(el.getAttribute('src'));
    if (u) resources.add(u);
  });

  document.querySelectorAll('svg image[href], svg use[href]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u) resources.add(u);
  });

  // Open Graph و Twitter Card meta tags برای تصاویر
  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((el) => {
    const u = abs(el.getAttribute('content'));
    if (u) resources.add(u);
  });

  // Manifest
  document.querySelectorAll('link[rel="manifest"]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u) resources.add(u);
  });

  // بک‌گراندهای اینلاین (style="background-image:url(...)")
  document.querySelectorAll('[style]').forEach((el) => {
    const style = el.getAttribute('style') || '';
    const matches = style.match(/url\((['"]?)([^'")]+)\1\)/g) || [];
    matches.forEach((m) => {
      const inner = m.replace(/^url\((['"]?)/, '').replace(/\1?\)$/, '').replace(/['"]/g, '');
      const u = abs(inner);
      if (u) resources.add(u);
    });
  });

  return {
    html: document.documentElement.outerHTML,
    baseURI: document.baseURI,
    title: document.title || 'page',
    resources: Array.from(resources),
  };
}

// استخراج آدرس url(...) و @import و @font-face از متن CSS
function extractCssUrls(cssText, cssBaseURI) {
  const urls = new Set();
  const urlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  let m;
  while ((m = urlRegex.exec(cssText)) !== null) {
    const raw = m[2];
    if (raw.startsWith('data:') || raw.startsWith('#')) continue;
    try {
      urls.add(new URL(raw, cssBaseURI).href);
    } catch (e) {}
  }
  const importRegex = /@import\s+(?:url\()?['"]?([^'")\s;]+)['"]?\)?/g;
  while ((m = importRegex.exec(cssText)) !== null) {
    try {
      urls.add(new URL(m[1], cssBaseURI).href);
    } catch (e) {}
  }
  // استخراج فونت‌ها از @font-face
  const fontFaceRegex = /@font-face\s*{[^}]*src:\s*([^;]+);/g;
  while ((m = fontFaceRegex.exec(cssText)) !== null) {
    const srcValue = m[1];
    const fontUrlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
    let fontMatch;
    while ((fontMatch = fontUrlRegex.exec(srcValue)) !== null) {
      const raw = fontMatch[2];
      if (raw.startsWith('data:') || raw.startsWith('#')) continue;
      try {
        urls.add(new URL(raw, cssBaseURI).href);
      } catch (e) {}
    }
  }
  return Array.from(urls);
}

function guessFolder(url, contentType) {
  const path = url.split('?')[0].split('#')[0];
  const ext = (path.split('.').pop() || '').toLowerCase();
  if (['css'].includes(ext)) return 'assets/css';
  if (['js', 'mjs'].includes(ext)) return 'assets/js';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif'].includes(ext)) return 'assets/img';
  if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return 'assets/fonts';
  if (contentType) {
    if (contentType.includes('css')) return 'assets/css';
    if (contentType.includes('javascript')) return 'assets/js';
    if (contentType.includes('image')) return 'assets/img';
    if (contentType.includes('font')) return 'assets/fonts';
  }
  return 'assets/misc';
}

function safeFileName(url, usedNames) {
  const path = url.split('?')[0].split('#')[0];
  let name = decodeURIComponent(path.split('/').pop() || 'file');
  name = name.replace(/[^a-zA-Z0-9_.\-]/g, '_');
  if (!name) name = 'file';
  let finalName = name;
  let i = 1;
  while (usedNames.has(finalName)) {
    const dot = name.lastIndexOf('.');
    finalName = dot > 0 ? `${name.slice(0, dot)}_${i}${name.slice(dot)}` : `${name}_${i}`;
    i++;
  }
  usedNames.add(finalName);
  return finalName;
}

async function fetchAsArrayBuffer(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get('content-type') || '';
  const buf = await res.arrayBuffer();
  return { buf, contentType };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// جایگزینی امن همه‌ی آدرس‌ها با معادل لوکالشان در یک پاس واحد (regex).
// روش قبلی (split/join پشت‌سرهم) وقتی آدرس یک فایل، پیشوندِ آدرس فایل
// دیگری بود (مثلاً lib.js و lib.js.map) باعث جایگزینی اشتباه می‌شد.
function applyUrlReplacements(text, mapping) {
  const entries = Array.from(mapping.entries()).sort((a, b) => b[0].length - a[0].length);
  if (!entries.length) return text;
  const pattern = entries.map(([url]) => escapeRegExp(url)).join('|');
  const re = new RegExp(pattern, 'g');
  return text.replace(re, (match) => (mapping.has(match) ? mapping.get(match) : match));
}

async function buildZipForTab(tab) {
  const [{ result: pageData }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectPageData,
  });

  const zip = new JSZip();
  const usedNames = new Set();
  const urlToLocalPath = new Map(); // absoluteURL -> relative path inside zip (relative to index.html)
  const cssTextCache = new Map(); // absoluteURL -> css text (to rewrite later)

  // صف اولیه: منابع پیدا شده در HTML
  const queue = [...pageData.resources];
  const seen = new Set(queue);

  let totalResources = queue.length;
  let downloadedCount = 0;

  while (queue.length) {
    const url = queue.shift();
    if (urlToLocalPath.has(url)) continue;
    try {
      const { buf, contentType } = await fetchAsArrayBuffer(url);
      const folder = guessFolder(url, contentType);
      const fileName = safeFileName(url, usedNames);
      const relPath = `${folder}/${fileName}`;
      zip.file(relPath, buf);
      urlToLocalPath.set(url, relPath);
      downloadedCount++;

      // آپدیت نشانگر پیشرفت
      if (downloadedCount % 5 === 0 || queue.length === 0) {
        const progress = Math.round((downloadedCount / totalResources) * 100);
        setBadge(`${progress}%`, '#6b7280');
      }

      // اگر فایل CSS بود، داخلش را هم برای url()های تو در تو (فونت، بک‌گراند) بگرد
      if (folder === 'assets/css' || contentType.includes('css')) {
        const text = new TextDecoder('utf-8').decode(buf);
        cssTextCache.set(url, text);
        const nested = extractCssUrls(text, url);
        nested.forEach((nUrl) => {
          if (!seen.has(nUrl)) {
            seen.add(nUrl);
            queue.push(nUrl);
            totalResources++;
          }
        });
      }
    } catch (e) {
      // منبعی که قابل دانلود نبود (مثلاً CORS) را نادیده می‌گیریم؛
      // لینک اصلی در HTML دست‌نخورده باقی می‌ماند.
      console.warn('[PageDownloader] Skipped resource:', url, e.message);
    }
  }

  // بازنویسی متن CSSها با مسیرهای لوکال
  // CSS در assets/css/ است و باید به سایر پوشه‌های assets/ رفرنس بدهد
  const cssMapping = new Map();
  urlToLocalPath.forEach((localPath, origUrl) => {
    // مسیر نسبی از assets/css/ به سایر پوشه‌ها
    if (localPath.startsWith('assets/')) {
      const relativeFromCss = localPath.replace('assets/', '../');
      cssMapping.set(origUrl, relativeFromCss);
    } else {
      cssMapping.set(origUrl, localPath);
    }
  });
  for (const [cssUrl, relPath] of urlToLocalPath.entries()) {
    if (!cssTextCache.has(cssUrl)) continue;
    const text = applyUrlReplacements(cssTextCache.get(cssUrl), cssMapping);
    zip.file(relPath, text);
  }

  // بازنویسی HTML اصلی با مسیرهای لوکال (مسیر نسبی به index.html در ریشه)
  let html = applyUrlReplacements(pageData.html, urlToLocalPath);

  // حذف تگ <base>: چون همه‌ی مسیرها را قبلاً نسبت به دامنه‌ی اصلی resolve و
  // با مسیر لوکال جایگزین کرده‌ایم، وجود <base> باعث می‌شد مرورگر مسیرهای
  // لوکال را دوباره نسبت به دامنه‌ی آنلاین resolve کند و همه‌چیز بشکند.
  html = html.replace(/<base\b[^>]*>/gi, '');

  // حذف integrity (SRI): هش فایل لوکال با نسخه‌ی آنلاین یکی نیست و مرورگر
  // از اجرای اسکریپت/استایل با integrity نامعتبر امتناع می‌کند.
  html = html.replace(/\s+integrity=(".*?"|'.*?')/gi, '');

  // حذف متای Content-Security-Policy که می‌تواند بارگذاری فایل‌های لوکال را ببندد
  html = html.replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi, '');

  // افزودن <meta charset> اگر وجود نداشت (برای نمایش درست فارسی/عربی هنگام باز شدن لوکال)
  if (!/<meta[^>]+charset=/i.test(html)) {
    html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n    <meta charset="utf-8">`);
  }

  // افزودن DOCTYPE (نبودش باعث Quirks Mode و به‌هم‌ریختگی چیدمان می‌شود)
  if (!/^\s*<!doctype/i.test(html)) {
    html = `<!DOCTYPE html>\n${html}`;
  }

  zip.file('index.html', html);

  // راهنما + سرور محلی کوچک، چون خیلی از سایت‌های امروزی از
  // <script type="module"> استفاده می‌کنند که مرورگر روی file:// اجازه‌ی
  // اجرایش را نمی‌دهد؛ اجرای یک سرور محلی این محدودیت را دور می‌زند.
  zip.file(
    'HOW-TO-OPEN.txt',
    'برای باز کردن این صفحه با کمترین مشکل، پیشنهاد می‌شود به‌جای دابل-کلیک روی index.html،\n' +
      'یک سرور محلی اجرا کنید (چون خیلی از سایت‌ها از اسکریپت‌هایی استفاده می‌کنند که مرورگر\n' +
      'اجازه‌ی اجرایشان را مستقیم از روی فایل (file://) نمی‌دهد):\n\n' +
      '1) پایتون نصب دارید؟ داخل همین پوشه دستور زیر را اجرا کنید:\n' +
      '   python3 -m http.server 8000\n' +
      '   یا روی ویندوز: python -m http.server 8000\n' +
      '   سپس در مرورگر بروید به: http://localhost:8000\n\n' +
      '2) یا فایل serve.py داخل همین پوشه را دابل-کلیک کنید (در صورت نصب بودن پایتون)،\n' +
      '   خودش سرور را بالا می‌آورد و صفحه را در مرورگر باز می‌کند.\n\n' +
      'اگر صفحه فقط از HTML/CSS/عکس ساده استفاده می‌کرده (بدون اسکریپت ماژولار)،\n' +
      'دابل-کلیک مستقیم روی index.html هم معمولاً کار می‌کند.\n'
  );
  zip.file(
    'serve.py',
    "import http.server, socketserver, webbrowser, os\n" +
      "PORT = 8000\n" +
      "os.chdir(os.path.dirname(os.path.abspath(__file__)))\n" +
      "Handler = http.server.SimpleHTTPRequestHandler\n" +
      "with socketserver.TCPServer(('', PORT), Handler) as httpd:\n" +
      "    print(f'Serving at http://localhost:{PORT}')\n" +
      "    webbrowser.open(f'http://localhost:{PORT}/index.html')\n" +
      "    httpd.serve_forever()\n"
  );

  console.log('[PageDownloader] در حال فشرده‌سازی زیپ...');
  // به‌جای blob از base64 استفاده می‌کنیم چون URL.createObjectURL داخل
  // Service Worker در بعضی نسخه‌های کروم بی‌صدا شکست می‌خورد.
  const base64 = await zip.generateAsync({ type: 'base64' });
  return { base64, title: pageData.title };
}

function sanitizeZipName(title) {
  const clean = (title || 'page').replace(/[^a-zA-Z0-9_\-آ-ی ]/g, '').trim().replace(/\s+/g, '_');
  return clean ? clean.slice(0, 60) : 'page';
}

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
}

chrome.action.onClicked.addListener(async (tab) => {
  console.log('[PageDownloader] کلیک شد. تب:', tab && tab.id, tab && tab.url);

  if (!tab.id || !/^https?:/.test(tab.url || '')) {
    console.warn('[PageDownloader] این صفحه قابل دانلود نیست (فقط http/https پشتیبانی می‌شود).');
    setBadge('✕', '#e11d48');
    setTimeout(() => setBadge(''), 3000);
    return;
  }

  setBadge('0%', '#6b7280');
  try {
    const { base64, title } = await buildZipForTab(tab);
    const filename = `${sanitizeZipName(title)}.zip`;
    const dataUrl = `data:application/zip;base64,${base64}`;

    console.log('[PageDownloader] شروع دانلود:', filename, 'حجم base64:', base64.length);
    const downloadId = await chrome.downloads.download({ url: dataUrl, filename, saveAs: true });
    console.log('[PageDownloader] دانلود ثبت شد، شناسه:', downloadId);

    setBadge('OK', '#16a34a');
  } catch (e) {
    console.error('[PageDownloader] خطا در ساخت فایل ZIP:', e);
    setBadge('ERR', '#e11d48');
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'خطا در دانلود صفحه',
      message: `خطا در ساخت فایل ZIP: ${e.message}`,
      priority: 2
    });
  } finally {
    setTimeout(() => setBadge(''), 4000);
  }
});
