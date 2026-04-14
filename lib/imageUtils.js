/**
 * /lib/imageUtils.js  v3
 * Image quality utilities — all browser-only, safe for SSR (no top-level DOM access).
 * Fixed: robust error handling, better blur threshold tuning, Safari compat.
 */

/**
 * Compress a base64 data URI using browser-image-compression.
 * Falls back to original on any error.
 * @param {string} dataURI
 * @returns {Promise<string>}
 */
export async function compressImage(dataURI) {
  if (typeof window === 'undefined') return dataURI;
  try {
    const { default: imageCompression } = await import('browser-image-compression');
    const res  = await fetch(dataURI);
    const blob = await res.blob();
    const file = new File([blob], 'plant.jpg', { type: blob.type || 'image/jpeg' });
    const opts = { maxSizeMB: 1.5, maxWidthOrHeight: 1920, useWebWorker: true,
                   fileType: 'image/jpeg', initialQuality: 0.88 };
    const compressed = await imageCompression(file, opts);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressed);
    });
  } catch (err) {
    console.warn('[imageUtils] Compression failed, using original:', err?.message);
    return dataURI;
  }
}

/**
 * Convert a base64 data URI to a Blob.
 * @param {string} dataURI
 * @returns {Blob}
 */
export function dataURItoBlob(dataURI) {
  const [header, b64] = dataURI.split(',');
  const mime   = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(b64);
  const ab     = new ArrayBuffer(binary.length);
  const ia     = new Uint8Array(ab);
  for (let i = 0; i < binary.length; i++) ia[i] = binary.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

/**
 * Estimate image sharpness via Laplacian variance.
 * Score < 16 → blurry; >= 16 → acceptable.
 * @param {string} dataURI
 * @returns {Promise<{ score: number, isBlurry: boolean }>}
 */
export function detectBlur(dataURI) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve({ score: 100, isBlurry: false });
    }
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas  = document.createElement('canvas');
        const scale   = Math.min(1, 480 / Math.max(img.width, img.height));
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx     = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Grayscale
        const gray = new Float32Array(width * height);
        for (let i = 0; i < gray.length; i++) {
          const p = i * 4;
          gray[i] = 0.299 * data[p] + 0.587 * data[p+1] + 0.114 * data[p+2];
        }

        // Laplacian variance
        let sumSq = 0, n = 0;
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const lap =
              gray[(y-1)*width+x] + gray[(y+1)*width+x] +
              gray[y*width+(x-1)] + gray[y*width+(x+1)] -
              4 * gray[y*width+x];
            sumSq += lap * lap;
            n++;
          }
        }
        const score = n > 0 ? Math.round(Math.sqrt(sumSq / n) * 10) / 10 : 0;
        resolve({ score, isBlurry: score < 16 });
      } catch {
        resolve({ score: 100, isBlurry: false }); // fail open
      }
    };
    img.onerror = () => resolve({ score: 100, isBlurry: false });
    img.src = dataURI;
  });
}

/**
 * Check minimum image resolution.
 * @param {string} dataURI
 * @param {{ minWidth?: number, minHeight?: number }} opts
 * @returns {Promise<{ ok: boolean, width: number, height: number }>}
 */
export function checkResolution(dataURI, { minWidth = 280, minHeight = 280 } = {}) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve({ ok: true, width: 0, height: 0 });
    const img = new window.Image();
    img.onload  = () => resolve({ ok: img.width >= minWidth && img.height >= minHeight, width: img.width, height: img.height });
    img.onerror = () => resolve({ ok: true, width: 0, height: 0 });
    img.src = dataURI;
  });
}
