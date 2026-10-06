// دریافت وضعیت از background script
function updateProgress(data) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const pagesDownloaded = document.getElementById('pagesDownloaded');
  const resourcesDownloaded = document.getElementById('resourcesDownloaded');
  const status = document.getElementById('status');
  const pagesList = document.getElementById('pagesList');

  if (data.progress !== undefined) {
    progressFill.style.width = `${data.progress}%`;
    progressText.textContent = `${data.progress}%`;
  }

  if (data.pagesDownloaded !== undefined) {
    pagesDownloaded.textContent = data.pagesDownloaded;
  }

  if (data.resourcesDownloaded !== undefined) {
    resourcesDownloaded.textContent = data.resourcesDownloaded;
  }

  if (data.status) {
    status.textContent = data.status;
    status.className = `status ${data.statusType || 'downloading'}`;
  }

  if (data.currentPage) {
    // آپدیت لیست صفحات
    const existingItem = document.querySelector(`[data-url="${data.currentPage.url}"]`);
    if (existingItem) {
      existingItem.className = 'page-item completed';
      existingItem.textContent = `${data.currentPage.title} - تکمیل شد`;
    } else {
      const newItem = document.createElement('div');
      newItem.className = 'page-item current';
      newItem.setAttribute('data-url', data.currentPage.url);
      newItem.textContent = `${data.currentPage.title} - در حال دانلود`;
      pagesList.appendChild(newItem);
    }
  }
}

// گوش دادن به پیام‌های background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateProgress') {
    updateProgress(request.data);
  }
  if (request.action === 'downloadComplete') {
    updateProgress({
      progress: 100,
      status: 'دانلود تکمیل شد',
      statusType: 'completed'
    });
  }
  if (request.action === 'downloadError') {
    updateProgress({
      status: request.error,
      statusType: 'error'
    });
  }
});

// درخواست وضعیت فعلی
chrome.runtime.sendMessage({ action: 'getProgress' }, (response) => {
  if (response && response.data) {
    updateProgress(response.data);
  }
});

// آپدیت دوره‌ای
setInterval(() => {
  chrome.runtime.sendMessage({ action: 'getProgress' }, (response) => {
    if (response && response.data) {
      updateProgress(response.data);
    }
  });
}, 1000);