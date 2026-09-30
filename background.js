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

  // Picture element support
  document.querySelectorAll('picture source[srcset]').forEach((el) => {
    const srcset = el.getAttribute('srcset');
    if (!srcset) return;
    srcset.split(',').forEach((part) => {
      const url = part.trim().split(/\s+/)[0];
      const u = abs(url);
      if (u) resources.add(u);
    });
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

  // پشتیبانی بهتر از SPA - استخراج منابع از style tags و script contents
  document.querySelectorAll('style').forEach((el) => {
    const styleContent = el.textContent || '';
    const matches = styleContent.match(/url\((['"]?)([^'")]+)\1\)/g) || [];
    matches.forEach((m) => {
      const inner = m.replace(/^url\((['"]?)/, '').replace(/\1?\)$/, '').replace(/['"]/g, '');
      const u = abs(inner);
      if (u) resources.add(u);
    });
  });

  // استخراج منابع از inline script tags (برای SPA)
  document.querySelectorAll('script:not([src])').forEach((el) => {
    const scriptContent = el.textContent || '';
    // استخراج URLها از string literals در JavaScript
    const urlPattern = /['"`](https?:[^'"`]+[^'"`])['"`]/g;
    let match;
    while ((match = urlPattern.exec(scriptContent)) !== null) {
      const url = match[1];
      if (url.match(/\.(png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|otf)$/i)) {
        const u = abs(url);
        if (u) resources.add(u);
      }
    }
  });

  return {
    html: document.documentElement.outerHTML,
    baseURI: document.baseURI,
    title: document.title || 'page',
    resources: Array.from(resources),
  };
}

// ---------------------------------------------------------------------------
// تابعی که لینک‌ها را از صفحه استخراج می‌کند برای خزش
// ---------------------------------------------------------------------------
function extractLinks() {
  const abs = (u) => {
    try {
      if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('javascript:') || u.startsWith('mailto:') || u.startsWith('tel:')) return null;
      return new URL(u, document.baseURI).href;
    } catch (e) { return null; }
  };

  const links = new Set();

  // لینک‌های معمولی <a>
  document.querySelectorAll('a[href]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u && /^https?:/.test(u)) {
      links.add(u);
    }
  });

  // لینک‌های navigation
  document.querySelectorAll('area[href]').forEach((el) => {
    const u = abs(el.getAttribute('href'));
    if (u && /^https?:/.test(u)) {
      links.add(u);
    }
  });

  return {
    links: Array.from(links),
    currentUrl: document.baseURI,
    domain: new URL(document.baseURI).hostname
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
  // استخراج از background-image و background
  const bgRegex = /background(?:-image)?:\s*([^;]+)/g;
  while ((m = bgRegex.exec(cssText)) !== null) {
    const bgValue = m[1];
    const bgUrlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
    let bgMatch;
    while ((bgMatch = bgUrlRegex.exec(bgValue)) !== null) {
      const raw = bgMatch[2];
      if (raw.startsWith('data:') || raw.startsWith('#')) continue;
      try {
        urls.add(new URL(raw, cssBaseURI).href);
      } catch (e) {}
    }
  }
  // استخراج از mask-image و clip-path
  const maskRegex = /(?:mask-image|clip-path|mask):\s*([^;]+)/g;
  while ((m = maskRegex.exec(cssText)) !== null) {
    const maskValue = m[1];
    const maskUrlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
    let maskMatch;
    while ((maskMatch = maskUrlRegex.exec(maskValue)) !== null) {
      const raw = maskMatch[2];
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
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif', 'tiff', 'pjp', 'pjpeg'].includes(ext)) return 'assets/img';
  if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return 'assets/fonts';
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(ext)) return 'assets/video';
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)) return 'assets/audio';
  if (['json', 'xml', 'webmanifest'].includes(ext)) return 'assets/data';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'assets/docs';
  if (contentType) {
    if (contentType.includes('css')) return 'assets/css';
    if (contentType.includes('javascript')) return 'assets/js';
    if (contentType.includes('image')) return 'assets/img';
    if (contentType.includes('font')) return 'assets/fonts';
    if (contentType.includes('video')) return 'assets/video';
    if (contentType.includes('audio')) return 'assets/audio';
    if (contentType.includes('json') || contentType.includes('xml')) return 'assets/data';
    if (contentType.includes('pdf') || contentType.includes('document') || contentType.includes('spreadsheet') || contentType.includes('presentation')) return 'assets/docs';
  }
  return 'assets/misc';
}

// بررسی اینکه آیا باید این منبع دانلود شود بر اساس تنظیمات
function shouldDownloadResource(folder, contentType) {
  if (!currentSettings.includeImages && (folder === 'assets/img' || contentType?.includes('image'))) {
    return false;
  }
  if (!currentSettings.includeVideos && (folder === 'assets/video' || contentType?.includes('video'))) {
    return false;
  }
  if (!currentSettings.includeAudio && (folder === 'assets/audio' || contentType?.includes('audio'))) {
    return false;
  }
  if (!currentSettings.includeFonts && (folder === 'assets/fonts' || contentType?.includes('font'))) {
    return false;
  }
  return true;
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

// محدودیت حجم فایل‌ها (برای جلوگیری از دانلود فایل‌های خیلی بزرگ)
let MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// مپ منابع مشترک برای جلوگیری از دانلود دوباره
const sharedResources = new Map(); // url -> { buf, contentType, refCount }

// پاکسازی منابع مشترک بعد از هر دانلود
function clearSharedResources() {
  sharedResources.clear();
}

// ذخیره تاریخچه دانلود
async function saveDownloadHistory(entry) {
  try {
    const result = await chrome.storage.local.get('downloadHistory');
    const history = result.downloadHistory || [];
    history.unshift(entry); // جدیدترین در ابتدا

    // نگه داشتن فقط 50 آخرین
    if (history.length > 50) {
      history.pop();
    }

    await chrome.storage.local.set({ downloadHistory: history });
  } catch (e) {
    console.warn('[PageDownloader] Failed to save download history:', e);
  }
}

// دریافت تاریخچه دانلود
async function getDownloadHistory() {
  try {
    const result = await chrome.storage.local.get('downloadHistory');
    return result.downloadHistory || [];
  } catch (e) {
    console.warn('[PageDownloader] Failed to get download history:', e);
    return [];
  }
}

// تنظیمات فعلی
let currentSettings = {
  includeImages: true,
  includeVideos: true,
  includeAudio: true,
  includeFonts: true,
  maxFileSize: 50,
  followRedirects: true,
  enableCrawling: false,
  crawlDepth: 1,
  maxPages: 10,
  followInternalLinks: true,
  sameDomain: true,
  concurrentDownloads: 6,
  exportFormat: 'zip',
  imageQuality: 'high'
};

// بارگذاری تنظیمات
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('downloadSettings');
    if (result.downloadSettings) {
      currentSettings = result.downloadSettings;
      MAX_FILE_SIZE = currentSettings.maxFileSize * 1024 * 1024;
    }
  } catch (e) {
    console.warn('[PageDownloader] Failed to load settings:', e);
  }
}

async function fetchAsArrayBuffer(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const contentLength = res.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB limit)`);
  }

  const contentType = res.headers.get('content-type') || '';
  const buf = await res.arrayBuffer();

  if (buf.byteLength > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(buf.byteLength / 1024 / 1024).toFixed(2)}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB limit)`);
  }

  return { buf, contentType };
}

// دریافت cookies برای دامنه‌های احراز هویت شده
async function getCookiesForDomain(domain) {
  try {
    const cookies = await chrome.cookies.getAll({ domain });
    return cookies;
  } catch (e) {
    console.warn('[PageDownloader] Failed to get cookies:', e);
    return [];
  }
}

// مدیریت صف دانلود
const downloadQueue = new Map();
let isProcessingQueue = false;

// اضافه کردن به صف دانلود
function addToQueue(tabId, settings) {
  const queueId = Date.now().toString();
  downloadQueue.set(queueId, { tabId, settings, status: 'pending', timestamp: Date.now() });
  processQueue();
  return queueId;
}

// پردازش صف دانلود
async function processQueue() {
  if (isProcessingQueue || downloadQueue.size === 0) return;

  isProcessingQueue = true;

  for (const [queueId, item] of downloadQueue.entries()) {
    if (item.status === 'pending') {
      item.status = 'processing';
      try {
        await handleDownload(item.tabId, item.settings);
        item.status = 'completed';
      } catch (e) {
        item.status = 'failed';
        item.error = e.message;
      }
    }
  }

  // پاکسازی موارد تکمیل شده
  for (const [queueId, item] of downloadQueue.entries()) {
    if (item.status === 'completed' || item.status === 'failed') {
      if (Date.now() - item.timestamp > 60000) { // پاک کردن بعد از 1 دقیقه
        downloadQueue.delete(queueId);
      }
    }
  }

  isProcessingQueue = false;
}

// لغو دانلود از صف
function cancelFromQueue(queueId) {
  const item = downloadQueue.get(queueId);
  if (item && item.status === 'pending') {
    item.status = 'cancelled';
    return true;
  }
  return false;
}

// دریافت وضعیت صف
function getQueueStatus() {
  const status = [];
  for (const [queueId, item] of downloadQueue.entries()) {
    status.push({ queueId, status: item.status, timestamp: item.timestamp });
  }
  return status;
}
const downloadQueue = new Map();
let isProcessingQueue = false;

// اضافه کردن به صف دانلود
function addToQueue(tabId, settings) {
  const queueId = Date.now().toString();
  downloadQueue.set(queueId, { tabId, settings, status: 'pending', timestamp: Date.now() });
  processQueue();
  return queueId;
}

// پردازش صف دانلود
async function processQueue() {
  if (isProcessingQueue || downloadQueue.size === 0) return;

  isProcessingQueue = true;

  for (const [queueId, item] of downloadQueue.entries()) {
    if (item.status === 'pending') {
      item.status = 'processing';
      try {
        await handleDownload(item.tabId, item.settings);
        item.status = 'completed';
      } catch (e) {
        item.status = 'failed';
        item.error = e.message;
      }
    }
  }

  // پاکسازی موارد تکمیل شده
  for (const [queueId, item] of downloadQueue.entries()) {
    if (item.status === 'completed' || item.status === 'failed') {
      if (Date.now() - item.timestamp > 60000) { // پاک کردن بعد از 1 دقیقه
        downloadQueue.delete(queueId);
      }
    }
  }

  isProcessingQueue = false;
}

// لغو دانلود از صف
function cancelFromQueue(queueId) {
  const item = downloadQueue.get(queueId);
  if (item && item.status === 'pending') {
    item.status = 'cancelled';
    return true;
  }
  return false;
}
async function getCookiesForDomain(domain) {
  try {
    const cookies = await chrome.cookies.getAll({ domain });
    return cookies;
  } catch (e) {
    console.warn('[PageDownloader] Failed to get cookies:', e);
    return [];
  }
}

// بهینه‌سازی تصاویر بر اساس کیفیت
async function optimizeImage(buf, contentType, quality) {
  if (!contentType.includes('image/') || quality === 'high') {
    return buf;
  }

  try {
    // استفاده از OffscreenCanvas برای فشرده‌سازی تصاویر
    const bitmap = await createImageBitmap(new Blob([buf]));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);

    let jpegQuality = 0.9;
    if (quality === 'medium') jpegQuality = 0.7;
    if (quality === 'low') jpegQuality = 0.5;

    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: jpegQuality
    });

    const optimizedBuf = await blob.arrayBuffer();
    console.log('[PageDownloader] Image optimized:', buf.byteLength, '->', optimizedBuf.byteLength, 'bytes');
    return optimizedBuf;
  } catch (e) {
    console.warn('[PageDownloader] Image optimization failed:', e);
    return buf;
  }
}

// ساخت فایل MHTML (ساده - فشردن همه چیز در یک فایل HTML)
async function buildMHTML(tab) {
  try {
    const [{ result: pageData }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectPageData,
    });

    // ساده‌سازی: همه منابع را در data URI تبدیل کن
    let html = pageData.html;

    // جایگزینی همه منابع با data URIs
    for (const url of pageData.resources) {
      try {
        const { buf, contentType } = await fetchWithRetry(url);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        const dataUri = `data:${contentType};base64,${base64}`;
        html = html.replace(new RegExp(escapeRegExp(url), 'g'), dataUri);
      } catch (e) {
        console.warn('[PageDownloader] Failed to convert to data URI:', url, e);
      }
    }

    const base64 = btoa(html);
    return { base64, title: pageData.title || 'page' };
  } catch (e) {
    console.error('[PageDownloader] Failed to build MHTML:', e);
    throw new Error('MHTML construction failed: ' + e.message);
  }
}

// تابعی برای تلاش مجدد هوشمند در صورت خطای شبکه
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchAsArrayBuffer(url);
    } catch (e) {
      if (i === maxRetries - 1) throw e;

      // استراتژی‌های مختلف retry بر اساس نوع خطا
      const errorMessage = e.message.toLowerCase();

      // خطاهای شبکه موقت - تاخیر کوتاه
      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
      // خطاهای سرور - تاخیر طولانی‌تر
      else if (errorMessage.includes('503') || errorMessage.includes('502') || errorMessage.includes('504')) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
      // خطاهای دیگر - تاخیر استاندارد
      else {
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// دانلود موازی با کنترل همزمانی
async function downloadWithConcurrency(urls, maxConcurrency = 6, onProgress) {
  const results = new Map();
  const errors = new Map();
  let completed = 0;
  let index = 0;

  const processUrl = async (url) => {
    try {
      const result = await fetchWithRetry(url);
      results.set(url, result);
    } catch (error) {
      errors.set(url, error);
    } finally {
      completed++;
      if (onProgress) onProgress(completed, urls.length);
    }
  };

  const workers = [];
  for (let i = 0; i < maxConcurrency; i++) {
    workers.push((async () => {
      while (index < urls.length) {
        const url = urls[index++];
        await processUrl(url);
      }
    })());
  }

  await Promise.all(workers);
  return { results, errors };
}

// دانلود با کنترل همزمانی واقعی
async function downloadResourcesWithConcurrency(resources, urlToLocalPath, zip, usedNames, skippedResources, cssTextCache, onProgress) {
  const maxConcurrency = currentSettings.concurrentDownloads || 6;
  const queue = [...resources];
  const results = await downloadWithConcurrency(queue, maxConcurrency, onProgress);

  for (const [url, { buf, contentType }] of results.entries()) {
    if (urlToLocalPath.has(url)) continue;

    // بررسی منابع مشترک برای جلوگیری از دانلود دوباره
    if (sharedResources.has(url)) {
      const shared = sharedResources.get(url);
      const folder = guessFolder(url, shared.contentType);
      const fileName = safeFileName(url, usedNames);
      const relPath = `${folder}/${fileName}`;

      if (!urlToLocalPath.has(url)) {
        zip.file(relPath, shared.buf);
        urlToLocalPath.set(url, relPath);
      }
      shared.refCount++;
      console.log('[PageDownloader] Using shared resource:', url, 'RefCount:', shared.refCount);
      continue;
    }

    const folder = guessFolder(url, contentType);

    if (!shouldDownloadResource(folder, contentType)) {
      console.log('[PageDownloader] Skipping resource based on settings:', url);
      skippedResources.push(`${url} - Skipped by user settings`);
      continue;
    }

    // بهینه‌سازی تصاویر
    let optimizedBuf = buf;
    if (folder === 'assets/img' && contentType.includes('image/')) {
      optimizedBuf = await optimizeImage(buf, contentType, currentSettings.imageQuality);
    }

    const fileName = safeFileName(url, usedNames);
    const relPath = `${folder}/${fileName}`;
    zip.file(relPath, optimizedBuf);
    urlToLocalPath.set(url, relPath);

    // ذخیره در منابع مشترک
    sharedResources.set(url, { buf: optimizedBuf, contentType, refCount: 1 });

    if (folder === 'assets/css' || contentType.includes('css')) {
      const text = new TextDecoder('utf-8').decode(optimizedBuf);
      cssTextCache.set(url, text);
    }
  }

  for (const [url, error] of results.errors.entries()) {
    console.warn('[PageDownloader] Skipped resource:', url, error.message);
    skippedResources.push(`${url} - ${error.message}`);
  }

  return results.results.size;
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
  const skippedResources = []; // track resources that couldn't be downloaded

  // صف اولیه: منابع پیدا شده در HTML
  const queue = [...pageData.resources];
  const seen = new Set(queue);

  let totalResources = queue.length;
  let downloadedCount = 0;

  // دانلود منابع موازی
  const downloadedCount = await downloadResourcesWithConcurrency(
    resources,
    urlToLocalPath,
    zip,
    usedNames,
    skippedResources,
    cssTextCache,
    (completed, total) => {
      const progress = Math.round((completed / total) * 100);
      setBadge(`${progress}%`, '#6b7280');
    }
  );

  // استخراج منابع CSS
  for (const [cssUrl, cssText] of cssTextCache.entries()) {
    const nested = extractCssUrls(cssText, cssUrl);
    const nestedResults = await downloadResourcesWithConcurrency(
      nested,
      urlToLocalPath,
      zip,
      usedNames,
      skippedResources,
      cssTextCache,
      (completed, total) => {
        const progress = Math.round((completed / total) * 100);
        setBadge(`${progress}%`, '#6b7280');
      }
    );
  }

  // بازنویسی متن CSSها با مسیرهای لوکال
  // مسیرهای نسبی را بر اساس محل فایل CSS محاسبه می‌کنیم
  const cssMapping = new Map();
  urlToLocalPath.forEach((localPath, origUrl) => {
    // برای هر منبع، مسیر نسبی آن را به روت assets/ محاسبه می‌کنیم
    // مثلاً assets/img/logo.png -> ../img/logo.png
    // assets/css/style.css -> ../css/style.css
    if (localPath.startsWith('assets/')) {
      cssMapping.set(origUrl, `../${localPath.replace('assets/', '')}`);
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

  // فایل گزارش خطاها
  if (skippedResources.length > 0) {
    const report = skippedResources.join('\n');
    zip.file('SKIPPED_RESOURCES.txt', `These resources could not be downloaded (CORS, network errors, etc.):\n\n${report}`);
  }

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

// هندل کردن پیام از popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadPage') {
    handleDownload(request.tabId, request.settings);
    return true;
  }
  if (request.action === 'getProgress') {
    sendResponse({ data: currentProgress });
    return true;
  }
  if (request.action === 'getHistory') {
    getDownloadHistory().then(history => sendResponse({ history }));
    return true;
  }
  if (request.action === 'clearHistory') {
    chrome.storage.local.remove('downloadHistory');
    sendResponse({ success: true });
    return true;
  }
  if (request.action === 'getQueueStatus') {
    sendResponse({ queue: getQueueStatus() });
    return true;
  }
  if (request.action === 'cancelDownload') {
    const success = cancelFromQueue(request.queueId);
    sendResponse({ success });
    return true;
  }
});

// وضعیت پیشرفت فعلی
let currentProgress = {
  progress: 0,
  pagesDownloaded: 0,
  resourcesDownloaded: 0,
  status: 'آماده',
  statusType: 'downloading',
  currentPage: null
};

// ارسال آپدیت پیشرفت به popup
function sendProgressUpdate() {
  chrome.runtime.sendMessage({
    action: 'updateProgress',
    data: currentProgress
  }).catch(() => {
    // Popup بسته شده است، نادیده بگیر
  });
}

// تابع هندل کردن دانلود
async function handleDownload(tabId, settings = null) {
  try {
    const tab = await chrome.tabs.get(tabId);

    if (!tab.id || !/^https?:/.test(tab.url || '')) {
      console.warn('[PageDownloader] این صفحه قابل دانلود نیست (فقط http/https پشتیبانی می‌شود).');
      setBadge('✕', '#e11d48');
      setTimeout(() => setBadge(''), 3000);
      return;
    }

    // اگر تنظیمات از popup آمده، آن را اعمال کن
    if (settings) {
      currentSettings = settings;
      MAX_FILE_SIZE = settings.maxFileSize * 1024 * 1024;
    } else {
      await loadSettings();
    }

    // دریافت cookies برای دامنه
    const domain = new URL(tab.url).hostname;
    const cookies = await getCookiesForDomain(domain);
    console.log('[PageDownloader] Retrieved cookies for domain:', domain, 'Count:', cookies.length);

    setBadge('0%', '#6b7280');

    let zipData;
    if (currentSettings.exportFormat === 'mhtml') {
      zipData = await buildMHTML(tab);
    } else if (currentSettings.enableCrawling) {
      zipData = await crawlAndDownload(tab);
    } else {
      zipData = await buildZipForTab(tab);
    }

    const { base64, title } = zipData;
    const filename = currentSettings.exportFormat === 'mhtml' ? `${sanitizeZipName(title)}.mhtml` : `${sanitizeZipName(title)}.zip`;
    const dataUrl = currentSettings.exportFormat === 'mhtml' ? `data:application/x-mimearchive;base64,${base64}` : `data:application/zip;base64,${base64}`;

    console.log('[PageDownloader] شروع دانلود:', filename, 'حجم base64:', base64.length);
    const downloadId = await chrome.downloads.download({ url: dataUrl, filename, saveAs: true });
    console.log('[PageDownloader] دانلود ثبت شد، شناسه:', downloadId);

    // ذخیره در تاریخچه
    await saveDownloadHistory({
      url: tab.url,
      title: title,
      filename: filename,
      timestamp: Date.now(),
      settings: currentSettings,
      cookiesCount: cookies.length
    });

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
    // پاکسازی منابع مشترک
    clearSharedResources();
    setTimeout(() => setBadge(''), 4000);
  }
}

// ---------------------------------------------------------------------------
// منطق خزش صفحات با کنترل عمق و تعداد صفحات
// ---------------------------------------------------------------------------
async function crawlAndDownload(startTab) {
  const visitedUrls = new Set();
  const urlQueue = [{ url: startTab.url, depth: 0 }];
  const baseDomain = new URL(startTab.url).hostname;
  const downloadedPages = [];
  let totalPages = 0;

  const zip = new JSZip();
  const usedNames = new Set();
  const urlToLocalPath = new Map();
  const cssTextCache = new Map();
  const skippedResources = [];

  while (urlQueue.length > 0 && totalPages < currentSettings.maxPages) {
    const { url, depth } = urlQueue.shift();

    // بررسی اینکه آیا قبلاً بازدید شده
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);

    // بررسی عمق
    if (depth > currentSettings.crawlDepth) continue;

    console.log('[PageDownloader] Crawling:', url, 'Depth:', depth);

    let createdTab = null;
    try {
      // ایجاد تب جدید برای خزش (یا استفاده از تب موجود)
      let tab;
      if (depth === 0) {
        tab = startTab;
      } else {
        tab = await chrome.tabs.create({ url, active: false });
        createdTab = tab;
        // صبر برای لود شدن صفحه
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // استخراج لینک‌ها و منابع
      const [{ result: pageData }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: collectPageData,
      });

      const [{ result: linkData }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractLinks,
      });

      // فیلتر کردن لینک‌ها بر اساس تنظیمات
      const filteredLinks = filterLinks(linkData.links, baseDomain, linkData.domain);

      // اضافه کردن لینک‌های فیلتر شده به صف
      filteredLinks.forEach(link => {
        if (!visitedUrls.has(link)) {
          urlQueue.push({ url: link, depth: depth + 1 });
        }
      });

      // پردازش منابع صفحه با deduplication
      const resources = pageData.resources;
      const queue = [...resources];
      const seen = new Set(queue);
      let totalResources = queue.length;
      let downloadedCount = 0;

      while (queue.length) {
        const resourceUrl = queue.shift();
        if (urlToLocalPath.has(resourceUrl)) continue;

        // بررسی منابع مشترک برای جلوگیری از دانلود دوباره
        if (sharedResources.has(resourceUrl)) {
          const shared = sharedResources.get(resourceUrl);
          const folder = guessFolder(resourceUrl, shared.contentType);
          const fileName = safeFileName(resourceUrl, usedNames);
          const relPath = `${folder}/${fileName}`;

          if (!urlToLocalPath.has(resourceUrl)) {
            zip.file(relPath, shared.buf);
            urlToLocalPath.set(resourceUrl, relPath);
          }
          downloadedCount++;
          shared.refCount++;
          console.log('[PageDownloader] Using shared resource:', resourceUrl, 'RefCount:', shared.refCount);
          continue;
        }

        try {
          const { buf, contentType } = await fetchWithRetry(resourceUrl);
          const folder = guessFolder(resourceUrl, contentType);

          if (!shouldDownloadResource(folder, contentType)) {
            console.log('[PageDownloader] Skipping resource based on settings:', resourceUrl);
            skippedResources.push(`${resourceUrl} - Skipped by user settings`);
            continue;
          }

          // بهینه‌سازی تصاویر
          let optimizedBuf = buf;
          if (folder === 'assets/img' && contentType.includes('image/')) {
            optimizedBuf = await optimizeImage(buf, contentType, currentSettings.imageQuality);
          }

          const fileName = safeFileName(resourceUrl, usedNames);
          const relPath = `${folder}/${fileName}`;
          zip.file(relPath, optimizedBuf);
          urlToLocalPath.set(resourceUrl, relPath);

          // ذخیره در منابع مشترک
          sharedResources.set(resourceUrl, { buf: optimizedBuf, contentType, refCount: 1 });

          downloadedCount++;

          if (downloadedCount % 5 === 0 || queue.length === 0) {
            const progress = Math.round((downloadedCount / totalResources) * 100);
            setBadge(`${progress}%`, '#6b7280`);
          }

          if (folder === 'assets/css' || contentType.includes('css')) {
            const text = new TextDecoder('utf-8').decode(optimizedBuf);
            cssTextCache.set(resourceUrl, text);
            const nested = extractCssUrls(text, resourceUrl);
            nested.forEach((nUrl) => {
              if (!seen.has(nUrl)) {
                seen.add(nUrl);
                queue.push(nUrl);
                totalResources++;
              }
            });
          }
        } catch (e) {
          console.warn('[PageDownloader] Skipped resource:', resourceUrl, e.message);
          skippedResources.push(`${resourceUrl} - ${e.message}`);
        }
      }

      // ذخیره صفحه HTML
      const safeTitle = sanitizeZipName(pageData.title);
      const pageFileName = depth === 0 ? 'index.html' : `pages/${safeTitle}_${totalPages}.html`;

      let html = applyUrlReplacements(pageData.html, urlToLocalPath);
      html = html.replace(/<base\b[^>]*>/gi, '');
      html = html.replace(/\s+integrity=(".*?"|'.*?')/gi, '');
      html = html.replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi, '');

      if (!/<meta[^>]+charset=/i.test(html)) {
        html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n    <meta charset="utf-8">`);
      }

      if (!/^\s*<!doctype/i.test(html)) {
        html = `<!DOCTYPE html>\n${html}`;
      }

      zip.file(pageFileName, html);
      downloadedPages.push({ url, title: pageData.title, fileName: pageFileName });
      totalPages++;

      // بستن تب اگر ایجاد شده بود
      if (createdTab) {
        await chrome.tabs.remove(createdTab.id);
        createdTab = null;
      }

    } catch (e) {
      console.error('[PageDownloader] Error crawling page:', url, e);
      if (createdTab) {
        try {
          await chrome.tabs.remove(createdTab.id);
        } catch (tabError) {
          console.warn('[PageDownloader] Error closing tab:', tabError);
        }
        createdTab = null;
      }
    }
  }

  // بازنویسی CSSها
  const cssMapping = new Map();
  urlToLocalPath.forEach((localPath, origUrl) => {
    if (localPath.startsWith('assets/')) {
      cssMapping.set(origUrl, `../${localPath.replace('assets/', '')}`);
    } else {
      cssMapping.set(origUrl, localPath);
    }
  });
  for (const [cssUrl, relPath] of urlToLocalPath.entries()) {
    if (!cssTextCache.has(cssUrl)) continue;
    const text = applyUrlReplacements(cssTextCache.get(cssUrl), cssMapping);
    zip.file(relPath, text);
  }

  // ایجاد فایل index صفحه اصلی برای لینک‌دن صفحات
  let indexHtml = '<!DOCTYPE html>\n<html lang="fa" dir="rtl">\n<head>\n';
  indexHtml += '<meta charset="utf-8">\n';
  indexHtml += '<title>Pages Index</title>\n';
  indexHtml += '<style>body{font-family:Arial,sans-serif;max-width:800px;margin:50px auto;padding:20px;} ul{list-style:none;padding:0;} li{margin:10px 0;} a{color:#0066cc;text-decoration:none;} a:hover{text-decoration:underline;}</style>\n';
  indexHtml += '</head>\n<body>\n';
  indexHtml += '<h1>صفحات دانلود شده</h1>\n';
  indexHtml += '<ul>\n';
  downloadedPages.forEach(page => {
    const relativePath = page.fileName.startsWith('pages/') ? page.fileName : page.fileName;
    indexHtml += `<li><a href="${relativePath}">${page.title}</a> - ${page.url}</li>\n`;
  });
  indexHtml += '</ul>\n';
  indexHtml += '</body>\n</html>';

  zip.file('pages/index.html', indexHtml);

  // فایل گزارش خطاها
  if (skippedResources.length > 0) {
    const report = skippedResources.join('\n');
    zip.file('SKIPPED_RESOURCES.txt', `These resources could not be downloaded (CORS, network errors, etc.):\n\n${report}`);
  }

  // راهنما
  zip.file(
    'HOW-TO-OPEN.txt',
    'برای باز کردن این صفحات با کمترین مشکل، پیشنهاد می‌شود به‌جای دابل-کلیک روی index.html،\n' +
      'یک سرور محلی اجرا کنید:\n\n' +
      '1) پایتون نصب دارید؟ داخل همین پوشه دستور زیر را اجرا کنید:\n' +
      '   python3 -m http.server 8000\n' +
      '   یا روی ویندوز: python -m http.server 8000\n' +
      '   سپس در مرورگر بروید به: http://localhost:8000\n\n' +
      'برای مشاهده index صفحات: http://localhost:8000/pages/index.html\n'
  );

  console.log('[PageDownloader] در حال فشرده‌سازی زیپ...');
  const base64 = await zip.generateAsync({ type: 'base64' });
  return { base64, title: 'crawled_pages' };
}

// فیلتر کردن لینک‌ها بر اساس تنظیمات
function filterLinks(links, baseDomain, currentPageDomain) {
  return links.filter(link => {
    try {
      const url = new URL(link);

      // فیلتر دامنه
      if (currentSettings.sameDomain && url.hostname !== baseDomain) {
        return false;
      }

      // فیلتر لینک‌های داخلی/خارجی
      if (currentSettings.followInternalLinks && url.hostname !== currentPageDomain) {
        return false;
      }

      // فیلتر پروتکل‌های غیر HTTP
      if (!/^https?:/.test(link)) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  });
}

// بارگذاری تنظیمات در startup
loadSettings();

// هندل کردن کلیک روی آیکون (fallback در صورت نبود popup)
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[PageDownloader] کلیک شد. تب:', tab && tab.id, tab && tab.url);
  await handleDownload(tab.id);
});
