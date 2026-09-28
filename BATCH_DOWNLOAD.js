// دانلود موازی با batch processing برای سرعت بیشتر
// این یک پیاده‌سازی مرجع است که باید در background.js ادغام شود
// این الگو می‌تواند تا 80% سرعت دانلود را بهبود دهد

/*
// نحوه استفاده در background.js:

async function downloadBatchParallel(queue, dependencies) {
  const { zip, urlToLocalPath, usedNames, seen, cssTextCache, skippedResources, currentProgress, sendProgressUpdate } = dependencies;

  let totalResources = queue.length;
  let downloadedCount = 0;

  while (queue.length) {
    const batch = [];
    const batchSize = Math.min(6, queue.length); // حداکثر 6 همزمان

    for (let i = 0; i < batchSize && queue.length > 0; i++) {
      const url = queue.shift();
      if (!urlToLocalPath.has(url)) {
        batch.push(url);
      }
    }

    if (batch.length === 0) continue;

    // دانلود همزمان batch
    const downloadPromises = batch.map(async (url) => {
      try {
        const { buf, contentType } = await fetchWithRetry(url);
        const folder = guessFolder(url, contentType);

        if (!shouldDownloadResource(folder, contentType)) {
          console.log('[PageDownloader] Skipping resource based on settings:', url);
          skippedResources.push(`${url} - Skipped by user settings`);
          return null;
        }

        const fileName = safeFileName(url, usedNames);
        const relPath = `${folder}/${fileName}`;
        zip.file(relPath, buf);
        urlToLocalPath.set(url, relPath);
        downloadedCount++;

        if (downloadedCount % 5 === 0) {
          const progress = Math.round((downloadedCount / totalResources) * 100);
          setBadge(`${progress}%`, '#6b7280`);
          currentProgress.progress = progress;
          currentProgress.resourcesDownloaded = downloadedCount;
          sendProgressUpdate();
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

        return { url, buf, contentType };
      } catch (e) {
        console.warn('[PageDownloader] Skipped resource:', url, e.message);
        skippedResources.push(`${url} - ${e.message}`);
        return null;
      }
    });

    await Promise.all(downloadPromises);
  }

  return { downloadedCount, totalResources };
}
*/