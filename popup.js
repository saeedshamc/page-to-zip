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
  crawlExcludePattern: ''
};

// پروفایل‌های تنظیمات
let profiles = {
  'default': { ...defaultSettings }
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
    crawlExcludePattern: document.getElementById('crawlExcludePattern').value
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

  // اضافه کردن event listeners
  document.getElementById('downloadBtn').addEventListener('click', startDownload);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('deleteProfileBtn').addEventListener('click', deleteProfile);
  document.getElementById('profileSelect').addEventListener('change', loadSelectedProfile);

  // بارگذاری تنظیمات هنگام تغییر
  const inputs = ['includeImages', 'includeVideos', 'includeAudio', 'includeFonts', 'maxFileSize', 'followRedirects', 'enableCrawling', 'crawlDepth', 'maxPages', 'followInternalLinks', 'sameDomain', 'concurrentDownloads', 'exportFormat', 'imageQuality', 'urlPattern', 'excludePattern', 'minFileSize', 'excludeExternalDomains', 'nofollowIgnore', 'pathFilter', 'crawlIncludePattern', 'crawlExcludePattern'];
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

// شروع
init();