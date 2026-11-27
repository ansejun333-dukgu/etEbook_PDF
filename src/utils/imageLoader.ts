import { AlbumPhoto } from '../types/album';

const MAX_EDGE_PX = 2400;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('파일을 읽지 못했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 중 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    img.src = src;
  });
}

function stripFileExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

export async function processImageFiles(files: FileList | File[]): Promise<AlbumPhoto[]> {
  const imageFiles = Array.from(files).filter((file) =>
    file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name)
  );

  const results: AlbumPhoto[] = [];

  for (let i = 0; i < imageFiles.length; i += 1) {
    const file = imageFiles[i];
    const rawDataUrl = await readFileAsDataUrl(file);
    const img = await loadHtmlImage(rawDataUrl);

    let finalSrc = rawDataUrl;
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    // Normalize extremely large camera files so multiple photos remain fast and memory-safe
    if (width > MAX_EDGE_PX || height > MAX_EDGE_PX) {
      const scale = Math.min(MAX_EDGE_PX / width, MAX_EDGE_PX / height);
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        finalSrc = canvas.toDataURL(mimeType, 0.92);
        width = targetWidth;
        height = targetHeight;
      }
    }

    const baseName = stripFileExtension(file.name);

    results.push({
      id: `photo-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      src: finalSrc,
      title: baseName || '',
      description: '',
      fileName: file.name,
      width,
      height,
      isSample: false,
      createdAt: Date.now() + i,
    });
  }

  return results;
}
