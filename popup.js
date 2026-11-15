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
  concurrentDownloads: 6,
  exportFormat: 'zip',
  imageQuality: 'high',
  urlPattern: '',
  excludePattern: '',
  minFileSize: 0,
  excludeExternalDomains: false,
  nofollowIgnore: false,
  pathFilter: '',
  crawlIncludePattern: '',
  crawlExcludePattern: '',
  downloadSpeedLimit: 0,
  requestDelay: 0,
  requestTimeout: 30,
  pageLoadTimeout: 10,
  maxDownloadTime: 30,
  theme: 'light'
};

// مدیریت تم
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggle').textContent = '🌙';
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  // ذخیره تم
  chrome.storage.local.set({ theme: newTheme });
}

// پروفایل‌های تنظیمات
let profiles = {
  'default': { ...defaultSettings }
};

// پروفایل‌های آماده
const presetProfiles = {
  'complete': {
    includeImages: true,
    includeVideos: true,
    includeAudio: true,
    includeFonts: true,
    maxFileSize: 100,
    followRedirects: true,
    enableCrawling: true,
    crawlDepth: 3,
    maxPages: 50,
    followInternalLinks: true,
    sameDomain: true,
    concurrentDownloads: 8,
    exportFormat: 'zip',
    imageQuality: 'high',
    urlPattern: '',
    excludePattern: '',
    minFileSize: 0,
    excludeExternalDomains: false,
    nofollowIgnore: false,
    pathFilter: '',
    crawlIncludePattern: '',
    crawlExcludePattern: '',
    downloadSpeedLimit: 0,
    requestDelay: 100,
    requestTimeout: 60,
    pageLoadTimeout: 30,
    maxDownloadTime: 60,
    theme: 'light'
  },
  'text': {
    includeImages: false,
    includeVideos: false,
    includeAudio: false,
    includeFonts: true,
    maxFileSize: 5,
    followRedirects: true,
    enableCrawling: false,
    crawlDepth: 1,
    maxPages: 10,
    followInternalLinks: true,
    sameDomain: true,
    concurrentDownloads: 4,
    exportFormat: 'zip',
    imageQuality: 'low',
    urlPattern: '',
    excludePattern: '\\.(png|jpg|jpeg|gif|webp|svg|mp4|webm|mp3|wav|ogg)$',
    minFileSize: 0,
    excludeExternalDomains: true,
    nofollowIgnore: false,
    pathFilter: '',
    crawlIncludePattern: '',
    crawlExcludePattern: '',
    downloadSpeedLimit: 0,
    requestDelay: 0,
    requestTimeout: 30,
    pageLoadTimeout: 10,
    maxDownloadTime: 30,
    theme: 'light'
  },
  'lightweight': {
    includeImages: true,
    includeVideos: false,
    includeAudio: false,
    includeFonts: true,
    maxFileSize: 10,
    followRedirects: true,
    enableCrawling: true,
    crawlDepth: 2,
    maxPages: 20,
    followInternalLinks: true,
    sameDomain: true,
    concurrentDownloads: 6,
    exportFormat: 'zip',
    imageQuality: 'medium',
    urlPattern: '',
    excludePattern: '\\.(mp4|webm|mp3|wav|ogg|avi|mkv)$',
    minFileSize: 0,
    excludeExternalDomains: true,
    nofollowIgnore: false,
    pathFilter: '',
    crawlIncludePattern: '',
    crawlExcludePattern: '',
    downloadSpeedLimit: 500,
    requestDelay: 200,
    requestTimeout: 30,
    pageLoadTimeout: 15,
    maxDownloadTime: 30,
    theme: 'light'
  },
  'archive': {
    includeImages: true,
    includeVideos: true,
    includeAudio: true,
    includeFonts: true,
    maxFileSize: 200,
    followRedirects: true,
    enableCrawling: true,
    crawlDepth: 5,
    maxPages: 100,
    followInternalLinks: true,
    sameDomain: false,
    concurrentDownloads: 12,
    exportFormat: 'zip',
    imageQuality: 'high',
    urlPattern: '',
    excludePattern: '',
    minFileSize: 0,
    excludeExternalDomains: false,
    nofollowIgnore: true,
    pathFilter: '',
    crawlIncludePattern: '',
    crawlExcludePattern: '',
    downloadSpeedLimit: 0,
    requestDelay: 0,
    requestTimeout: 120,
    pageLoadTimeout: 60,
    maxDownloadTime: 120,
    theme: 'light'
  }
};

// بارگذاری تنظیمات از chrome.storage
async function loadSettings() {
  const result = await chrome.storage.local.get('downloadSettings');
  return result.downloadSettings || defaultSettings;
}

// بارگذاری پروفایل‌ها
async function loadProfiles() {
  const result = await chrome.storage.local.get('settingsProfiles');
  if (result.settingsProfiles) {
    profiles = result.settingsProfiles;
  }
  updateProfileSelect();
}

// ذخیره پروفایل‌ها
async function saveProfiles() {
  await chrome.storage.local.set({ settingsProfiles: profiles });
}

// ذخیره تنظیمات
async function saveSettings(settings) {
  await chrome.storage.local.set({ downloadSettings: settings });
}

// دریافت تنظیمات فعلی از UI
function getCurrentUISettings() {
  return {
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
    concurrentDownloads: parseInt(document.getElementById('concurrentDownloads').value),
    exportFormat: document.getElementById('exportFormat').value,
    imageQuality: document.getElementById('imageQuality').value,
    urlPattern: document.getElementById('urlPattern').value,
    excludePattern: document.getElementById('excludePattern').value,
    minFileSize: parseInt(document.getElementById('minFileSize').value) || 0,
    excludeExternalDomains: document.getElementById('excludeExternalDomains').checked,
    nofollowIgnore: document.getElementById('nofollowIgnore').checked,
    pathFilter: document.getElementById('pathFilter').value,
    crawlIncludePattern: document.getElementById('crawlIncludePattern').value,
    crawlExcludePattern: document.getElementById('crawlExcludePattern').value,
    downloadSpeedLimit: parseInt(document.getElementById('downloadSpeedLimit').value) || 0,
    requestDelay: parseInt(document.getElementById('requestDelay').value) || 0,
    requestTimeout: parseInt(document.getElementById('requestTimeout').value) || 30,
    pageLoadTimeout: parseInt(document.getElementById('pageLoadTimeout').value) || 10,
    maxDownloadTime: parseInt(document.getElementById('maxDownloadTime').value) || 30
  };
}

// اعمال تنظیمات به UI
function applySettingsToUI(settings) {
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
  document.getElementById('exportFormat').value = settings.exportFormat || 'zip';
  document.getElementById('imageQuality').value = settings.imageQuality || 'high';
  document.getElementById('urlPattern').value = settings.urlPattern || '';
  document.getElementById('excludePattern').value = settings.excludePattern || '';
  document.getElementById('minFileSize').value = settings.minFileSize || 0;
  document.getElementById('excludeExternalDomains').checked = settings.excludeExternalDomains || false;
  document.getElementById('nofollowIgnore').checked = settings.nofollowIgnore || false;
  document.getElementById('pathFilter').value = settings.pathFilter || '';
  document.getElementById('crawlIncludePattern').value = settings.crawlIncludePattern || '';
  document.getElementById('crawlExcludePattern').value = settings.crawlExcludePattern || '';
  document.getElementById('downloadSpeedLimit').value = settings.downloadSpeedLimit || 0;
  document.getElementById('requestDelay').value = settings.requestDelay || 0;
  document.getElementById('requestTimeout').value = settings.requestTimeout || 30;
  document.getElementById('pageLoadTimeout').value = settings.pageLoadTimeout || 10;
  document.getElementById('maxDownloadTime').value = settings.maxDownloadTime || 30;
}

// آپدیت منوی انتخاب پروفایل
function updateProfileSelect() {
  const select = document.getElementById('profileSelect');
  const currentValue = select.value;
  select.innerHTML = '';
  for (const name in profiles) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name === 'default' ? 'پیش‌فرض' : name;
    select.appendChild(option);
  }
  select.value = currentValue || 'default';
}

// ذخیره پروفایل جدید
async function saveProfile() {
  const name = prompt('نام پروفایل جدید:');
  if (!name) return;

  if (name === 'default') {
    showStatus('نام پیش‌فرض مجاز نیست', 'error');
    return;
  }

  const settings = getCurrentUISettings();
  profiles[name] = settings;
  await saveProfiles();
  updateProfileSelect();
  document.getElementById('profileSelect').value = name;
  showStatus(`پروفایل "${name}" ذخیره شد`, 'success');
}

// حذف پروفایل
async function deleteProfile() {
  const select = document.getElementById('profileSelect');
  const name = select.value;

  if (name === 'default') {
    showStatus('پروفایل پیش‌فرض قابل حذف نیست', 'error');
    return;
  }

  if (confirm(`آیا مطمئن هستید که می‌خواهید پروفایل "${name}" را حذف کنید؟`)) {
    delete profiles[name];
    await saveProfiles();
    updateProfileSelect();
    select.value = 'default';
    applySettingsToUI(profiles['default']);
    showStatus(`پروفایل "${name}" حذف شد`, 'success');
  }
}

// بارگذاری پروفایل انتخاب شده
function loadSelectedProfile() {
  const select = document.getElementById('profileSelect');
  const name = select.value;
  if (profiles[name]) {
    applySettingsToUI(profiles[name]);
    showStatus(`پروفایل "${name}" بارگذاری شد`, 'info');
  }
}

// بارگذاری پروفایل آماده
function loadPresetProfile(presetName) {
  if (presetProfiles[presetName]) {
    applySettingsToUI(presetProfiles[presetName]);
    const presetLabels = {
      'complete': 'بلاگ کامل',
      'text': 'فقط متن',
      'lightweight': 'دریفت',
      'archive': 'آرشیو'
    };
    showStatus(`پروفایل آماده "${presetLabels[presetName]}" بارگذاری شد`, 'success');
  }
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
  const settings = getCurrentUISettings();

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
    // ارسال پیام به background script بدون انتظار برای پاسخ
    chrome.runtime.sendMessage({
      action: 'downloadPage',
      tabId: tab.id,
      settings: settings
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus(`خطا: ${chrome.runtime.lastError.message}`, 'error');
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'دانلود صفحه';
      } else {
        showStatus('دانلود شروع شد (می‌توانید پاپ‌آپ را ببندید)', 'success');
        // باز کردن صفحه پیشرفت
        chrome.tabs.create({ url: 'progress.html' });
        // بستن پاپ‌آپ پس از مدت کوتاه
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    });

    // بستن پاپ‌آپ پس از ارسال پیام
    return true;
  } catch (error) {
    showStatus(`خطا: ${error.message}`, 'error');
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'دانلود صفحه';
    return false;
  }
}

// مقداردهی اولیه
async function init() {
  await loadProfiles();
  const settings = await loadSettings();

  applySettingsToUI(settings);

  // اعمال تم ذخیره شده
  const themeResult = await chrome.storage.local.get('theme');
  const savedTheme = themeResult.theme || 'light';
  applyTheme(savedTheme);

  // اضافه کردن event listeners
  document.getElementById('downloadBtn').addEventListener('click', startDownload);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('deleteProfileBtn').addEventListener('click', deleteProfile);
  document.getElementById('profileSelect').addEventListener('change', loadSelectedProfile);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('previewBtn').addEventListener('click', showSettingsPreview);
  document.querySelector('.modal-close').addEventListener('click', hideSettingsPreview);
  document.querySelector('.modal-cancel').addEventListener('click', hideSettingsPreview);
  document.querySelector('.modal-confirm').addEventListener('click', confirmAndDownload);

  // اضافه کردن event listeners برای دکمه‌های پروفایل آماده
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      loadPresetProfile(preset);
    });
  });

  // نمایش راهنمای میانبرها
  showStatus('از میانبرهای کیبورد استفاده کنید: Ctrl+Shift+D/S/T', 'info');

  // بارگذاری تنظیمات هنگام تغییر
  const inputs = ['includeImages', 'includeVideos', 'includeAudio', 'includeFonts', 'maxFileSize', 'followRedirects', 'enableCrawling', 'crawlDepth', 'maxPages', 'followInternalLinks', 'sameDomain', 'concurrentDownloads', 'exportFormat', 'imageQuality', 'urlPattern', 'excludePattern', 'minFileSize', 'excludeExternalDomains', 'nofollowIgnore', 'pathFilter', 'crawlIncludePattern', 'crawlExcludePattern', 'downloadSpeedLimit', 'requestDelay', 'requestTimeout', 'pageLoadTimeout', 'maxDownloadTime'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('change', async () => {
      const newSettings = getCurrentUISettings();
      await saveSettings(newSettings);
      // آپدیت پروفایل پیش‌فرض اگر لازم باشد
      const currentProfile = document.getElementById('profileSelect').value;
      if (currentProfile === 'default') {
        profiles['default'] = newSettings;
        await saveProfiles();
      }
    });
  });

  // بارگذاری وضعیت صف
  loadQueueStatus();
  setInterval(loadQueueStatus, 2000); // آپدیت هر 2 ثانیه

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

// بارگذاری وضعیت صف دانلود
async function loadQueueStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getQueueStatus' });
    const queue = response.queue || [];
    renderQueueStatus(queue);
  } catch (e) {
    console.error('Failed to load queue status:', e);
  }
}

// نمایش وضعیت صف
function renderQueueStatus(queue) {
  const queueStatus = document.getElementById('queueStatus');

  if (queue.length === 0) {
    queueStatus.innerHTML = '<div class="queue-empty">صف دانلود خالی است</div>';
    return;
  }

  queueStatus.innerHTML = queue.map(item => {
    const statusClass = item.status;
    const statusText = {
      'pending': 'در انتظار',
      'processing': 'در حال دانلود',
      'completed': 'تکمیل شده',
      'failed': 'شکست خورد',
      'cancelled': 'لغو شده'
    }[item.status] || item.status;

    return `
      <div class="queue-item">
        <span>ID: ${item.queueId.slice(-6)}</span>
        <span class="queue-item-status ${statusClass}">${statusText}</span>
      </div>
    `;
  }).join('');
}

// نمایش پیش‌نمایش تنظیمات
function showSettingsPreview() {
  const settings = getCurrentUISettings();
  const previewContent = document.getElementById('previewContent');

  const previewHTML = `
    <div class="preview-item">
      <div class="preview-label">تنظیمات منابع:</div>
      <div class="preview-value">
        تصاویر: ${settings.includeImages ? '✓' : '✗'} |
        ویدیو: ${settings.includeVideos ? '✓' : '✗'} |
        صوت: ${settings.includeAudio ? '✓' '✗'} |
        فونت: ${settings.includeFonts ? '✓' : '✗'}
      </div>
    </div>
    <div class="preview-item">
      <div class="preview-label">حداکثر حجم فایل:</div>
      <div class="preview-value">${settings.maxFileSize} MB</div>
    </div>
    <div class="preview-item">
      <div class="preview-label">دانلود همزمان:</div>
      <div class="preview-value">${settings.concurrentDownloads} درخواست</div>
    </div>
    <div class="preview-item">
      <div class="preview-label">تنظیمات خزش:</div>
      <div class="preview-value">
        فعال: ${settings.enableCrawling ? '✓' : '✗'} |
        عمق: ${settings.crawlDepth} |
        صفحات: ${settings.maxPages}
      </div>
    </div>
    <div class="preview-item">
      <div class="preview-label">فیلترهای لینک:</div>
      <div class="preview-value">
        داخلی: ${settings.followInternalLinks ? '✓' : '✗'} |
        همان دامنه: ${settings.sameDomain ? '✓' : '✗'}
      </div>
    </div>
    <div class="preview-item">
      <div class="preview-label">فرمت خروجی:</div>
      <div class="preview-value">${settings.exportFormat.toUpperCase()}</div>
    </div>
    <div class="preview-item">
      <div class="preview-label">کیفیت تصاویر:</div>
      <div class="preview-value">${settings.imageQuality}</div>
    </div>
    ${settings.urlPattern ? `
    <div class="preview-item">
      <div class="preview-label">الگوی URL:</div>
      <div class="preview-value">${settings.urlPattern}</div>
    </div>
    ` : ''}
    ${settings.excludePattern ? `
    <div class="preview-item">
      <div class="preview-label">الگوی حذف:</div>
      <div class="preview-value">${settings.excludePattern}</div>
    </div>
    ` : ''}
    ${settings.downloadSpeedLimit > 0 ? `
    <div class="preview-item">
      <div class="preview-label">محدودیت سرعت:</div>
      <div class="preview-value">${settings.downloadSpeedLimit} KB/s</div>
    </div>
    ` : ''}
    ${settings.requestDelay > 0 ? `
    <div class="preview-item">
      <div class="preview-label">تاخیر درخواست:</div>
      <div class="preview-value">${settings.requestDelay} ms</div>
    </div>
    ` : ''}
  `;

  previewContent.innerHTML = previewHTML;
  document.getElementById('previewModal').classList.add('show');
}

// بستن مودال پیش‌نمایش
function hideSettingsPreview() {
  document.getElementById('previewModal').classList.remove('show');
}

// تایید و دانلود از مودال
async function confirmAndDownload() {
  hideSettingsPreview();
  await startDownload();
}

// شروع
init();