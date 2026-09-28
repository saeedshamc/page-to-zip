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