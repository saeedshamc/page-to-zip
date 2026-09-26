// پشتیبانی از تنظیمات پیش‌فرض
const defaultSettings = {
  includeImages: true,
  includeVideos: true,
  includeAudio: true,
  includeFonts: true,
  maxFileSize: 50,
  followRedirects: true
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
  
  // ذخیره تنظیمات
  await saveSettings(settings);
  
  const tab = await getCurrentTab();
  
  if (!tab || !isDownloadableUrl(tab.url)) {
    showStatus('این صفحه قابل دانلود نیست', 'error');
    return;
  }
  
  downloadBtn.disabled = true;
  downloadBtn.textContent = 'در حال دانلود...';
  showStatus('در حال آماده‌سازی دانلود...', 'info');
  
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
  
  // اضافه کردن event listeners
  document.getElementById('downloadBtn').addEventListener('click', startDownload);
  
  // ذخیره تنظیمات هنگام تغییر
  const inputs = ['includeImages', 'includeVideos', 'includeAudio', 'includeFonts', 'maxFileSize', 'followRedirects'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('change', async () => {
      const newSettings = {
        includeImages: document.getElementById('includeImages').checked,
        includeVideos: document.getElementById('includeVideos').checked,
        includeAudio: document.getElementById('includeAudio').checked,
        includeFonts: document.getElementById('includeFonts').checked,
        maxFileSize: parseInt(document.getElementById('maxFileSize').value),
        followRedirects: document.getElementById('followRedirects').checked
      };
      await saveSettings(newSettings);
    });
  });
}

// شروع
init();