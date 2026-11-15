// نمایش ZIP Viewer

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const errorDiv = document.getElementById('error');
const statsDiv = document.getElementById('stats');
const fileCountSpan = document.getElementById('fileCount');
const totalSizeSpan = document.getElementById('totalSize');
const viewerPreview = document.getElementById('viewerPreview');
const previewContent = document.getElementById('previewContent');

let currentZip = null;
let currentFiles = [];

// کلیک روی upload area
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// تغییر فایل
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    loadZipFile(e.target.files[0]);
  }
});

// drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    loadZipFile(e.dataTransfer.files[0]);
  }
});

// بارگذاری فایل ZIP
async function loadZipFile(file) {
  try {
    errorDiv.style.display = 'none';
    fileList.innerHTML = '<div class="loading">در حال بارگذاری...</div>';
    statsDiv.style.display = 'none';

    const zip = new JSZip();
    currentZip = await zip.loadAsync(file);
    currentFiles = [];

    let totalSize = 0;
    let fileCount = 0;

    // استخراج فایل‌ها
    currentZip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        currentFiles.push({
          name: relativePath,
          size: zipEntry._data.uncompressedSize,
          entry: zipEntry
        });
        totalSize += zipEntry._data.uncompressedSize;
        fileCount++;
      }
    });

    // مرتب‌سازی فایل‌ها
    currentFiles.sort((a, b) => a.name.localeCompare(b.name));

    // نمایش آمار
    fileCountSpan.textContent = fileCount;
    totalSizeSpan.textContent = formatSize(totalSize);
    statsDiv.style.display = 'flex';

    // نمایش لیست فایل‌ها
    renderFileList();

  } catch (e) {
    console.error('Failed to load ZIP:', e);
    showError('خطا در بارگذاری فایل ZIP: ' + e.message);
    fileList.innerHTML = '';
  }
}

// نمایش لیست فایل‌ها
function renderFileList() {
  fileList.innerHTML = '';

  currentFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <span class="file-icon">${getFileIcon(file.name)}</span>
      <span class="file-name">${file.name}</span>
      <span class="file-size">${formatSize(file.size)}</span>
      <div class="file-actions">
        <button class="btn btn-primary" onclick="previewFile(${index})">پیش‌نمایش</button>
        <button class="btn btn-secondary" onclick="downloadFile(${index})">دانلود</button>
      </div>
    `;
    fileList.appendChild(item);
  });
}

// دریافت آیکون فایل
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    'html': '📄',
    'htm': '📄',
    'css': '🎨',
    'js': '📜',
    'json': '📋',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'webp': '🖼️',
    'mp4': '🎬',
    'webm': '🎬',
    'mp3': '🎵',
    'wav': '🎵',
    'pdf': '📕',
    'zip': '📦',
    'txt': '📝',
    'md': '📝'
  };
  return icons[ext] || '📁';
}

// فرمت حجم
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// پیش‌نمایش فایل
async function previewFile(index) {
  const file = currentFiles[index];
  const ext = file.name.split('.').pop().toLowerCase();

  try {
    const content = await file.entry.async('base64');
    const dataUrl = `data:${getMimeType(ext)};base64,${content}`;

    previewContent.innerHTML = '';

    if (['html', 'htm'].includes(ext)) {
      const iframe = document.createElement('iframe');
      iframe.src = dataUrl;
      previewContent.appendChild(iframe);
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      const img = document.createElement('img');
      img.src = dataUrl;
      previewContent.appendChild(img);
    } else if (['css', 'js', 'json', 'txt', 'md'].includes(ext)) {
      const text = await file.entry.async('string');
      const pre = document.createElement('pre');
      pre.textContent = text;
      previewContent.appendChild(pre);
    } else {
      previewContent.innerHTML = '<p>پیش‌نمایش برای این نوع فایل در دسترس نیست</p>';
    }

    viewerPreview.style.display = 'block';
  } catch (e) {
    console.error('Failed to preview file:', e);
    showError('خطا در پیش‌نمایش فایل: ' + e.message);
  }
}

// دانلود فایل
async function downloadFile(index) {
  const file = currentFiles[index];

  try {
    const blob = await file.entry.async('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to download file:', e);
    showError('خطا در دانلود فایل: ' + e.message);
  }
}

// بستن پیش‌نمایش
function closePreview() {
  viewerPreview.style.display = 'none';
  previewContent.innerHTML = '';
}

// دریافت MIME type
function getMimeType(ext) {
  const types = {
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'md': 'text/markdown'
  };
  return types[ext] || 'application/octet-stream';
}

// نمایش خطا
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}
