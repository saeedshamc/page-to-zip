// پشتیبانی از تنظیمات پیش‌فرض
const defaultSettings = {
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
  concurrentDownloads: 6
};

// بارگذاری تنظیمات از chrome.storage
async function loadSettings() {
  const result = await chrome.storage.local.get('downloadSettings');
  return result.downloadSettings || defaultSettings;
}

// ذخیره تنظیمات
async function saveSettings(settings) {
  await chrome.storage.local.set({ downloadSettings: settings });
}

// نمایش وضعیت
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      status.className = 'status';
      status.textContent = '';
    }, 3000);
  }
}

// دریافت تب فعلی
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// بررسی اینکه آیا صفحه قابل دانلود است
function isDownloadableUrl(url) {
  return url && /^https?:/.test(url);
}

// شروع دانلود
async function startDownload() {
  const downloadBtn = document.getElementById('downloadBtn');
  const settings = await loadSettings();

  // اعتبارسنجی تنظیمات
  if (settings.maxFileSize < 1 || settings.maxFileSize > 500) {
    showStatus('حجم فایل باید بین 1 تا 500 مگابایت باشد', 'error');
    return;
  }

  if (settings.crawlDepth < 1 || settings.crawlDepth > 5) {
    showStatus('عمق خزش باید بین 1 تا 5 باشد', 'error');
    return;
  }

  if (settings.maxPages < 1 || settings.maxPages > 100) {
    showStatus('تعداد صفحات باید بین 1 تا 100 باشد', 'error');
    return;
  }

  // ذخیره تنظیمات
  await saveSettings(settings);

  const tab = await getCurrentTab();

  if (!tab || !isDownloadableUrl(tab.url)) {
    showStatus('این صفحه قابل دانلود نیست', 'error');
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = 'در حال دانلود...';

  if (settings.enableCrawling) {
    showStatus(`در حال خزش ${settings.maxPages} صفحه با عمق ${settings.crawlDepth}...`, 'info');
  } else {
    showStatus('در حال آماده‌سازی دانلود...', 'info');
  }

  try {
    // ارسال پیام به background script
    await chrome.runtime.sendMessage({
      action: 'downloadPage',
      tabId: tab.id,
      settings: settings
    });

    showStatus('دانلود شروع شد', 'success');
  } catch (error) {
    showStatus(`خطا: ${error.message}`, 'error');
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'دانلود صفحه';
  }
}

// مقداردهی اولیه
async function init() {
  const settings = await loadSettings();

  document.getElementById('includeImages').checked = settings.includeImages;
  document.getElementById('includeVideos').checked = settings.includeVideos;
  document.getElementById('includeAudio').checked = settings.includeAudio;
  document.getElementById('includeFonts').checked = settings.includeFonts;
  document.getElementById('maxFileSize').value = settings.maxFileSize;
  document.getElementById('followRedirects').checked = settings.followRedirects;
  document.getElementById('enableCrawling').checked = settings.enableCrawling;
  document.getElementById('crawlDepth').value = settings.crawlDepth;
  document.getElementById('maxPages').value = settings.maxPages;
  document.getElementById('followInternalLinks').checked = settings.followInternalLinks;
  document.getElementById('sameDomain').checked = settings.sameDomain;
  document.getElementById('concurrentDownloads').value = settings.concurrentDownloads;

  // اضافه کردن event listeners
  document.getElementById('downloadBtn').addEventListener('click', startDownload);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

  // ذخیره تنظیمات هنگام تغییر
  const inputs = ['includeImages', 'includeVideos', 'includeAudio', 'includeFonts', 'maxFileSize', 'followRedirects', 'enableCrawling', 'crawlDepth', 'maxPages', 'followInternalLinks', 'sameDomain', 'concurrentDownloads'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('change', async () => {
      const newSettings = {
        includeImages: document.getElementById('includeImages').checked,
        includeVideos: document.getElementById('includeVideos').checked,
        includeAudio: document.getElementById('includeAudio').checked,
        includeFonts: document.getElementById('includeFonts').checked,
        maxFileSize: parseInt(document.getElementById('maxFileSize').value),
        followRedirects: document.getElementById('followRedirects').checked,
        enableCrawling: document.getElementById('enableCrawling').checked,
        crawlDepth: parseInt(document.getElementById('crawlDepth').value),
        maxPages: parseInt(document.getElementById('maxPages').value),
        followInternalLinks: document.getElementById('followInternalLinks').checked,
        sameDomain: document.getElementById('sameDomain').checked,
        concurrentDownloads: parseInt(document.getElementById('concurrentDownloads').value)
      };
      await saveSettings(newSettings);
    });
  });

  // بارگذاری تاریخچه
  loadHistory();
}

// بارگذاری تاریخچه دانلود
async function loadHistory() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getHistory' });
    const history = response.history || [];
    renderHistory(history);
  } catch (e) {
    console.error('Failed to load history:', e);
  }
}

// نمایش تاریخچه
function renderHistory(history) {
  const historyList = document.getElementById('historyList');

  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">تاریخچه خالی است</div>';
    return;
  }

  historyList.innerHTML = history.map(item => {
    const date = new Date(item.timestamp).toLocaleString('fa-IR');
    return `
      <div class="history-item">
        <div class="history-title">${item.title}</div>
        <div class="history-date">${date}</div>
      </div>
    `;
  }).join('');
}

// پاک کردن تاریخچه
async function clearHistory() {
  try {
    await chrome.runtime.sendMessage({ action: 'clearHistory' });
    document.getElementById('historyList').innerHTML = '<div class="history-empty">تاریخچه خالی است</div>';
    showStatus('تاریخچه پاک شد', 'success');
  } catch (e) {
    showStatus('خطا در پاک کردن تاریخچه', 'error');
  }
}

// شروع
init();