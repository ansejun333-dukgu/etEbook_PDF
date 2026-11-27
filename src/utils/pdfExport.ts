import { jsPDF } from 'jspdf';
import { AlbumFont, AlbumPhoto, AlbumTheme, PdfExportOptions } from '../types/album';

// ~200 DPI A4 dimensions for crisp print quality and fast client-side rendering
const A4_PORTRAIT_PX = { width: 1654, height: 2339 };
const A4_LANDSCAPE_PX = { width: 2339, height: 1654 };

function getAlbumFontSpec(font: AlbumFont) {
  switch (font) {
    case 'gothic':
      return {
        family: '"Plus Jakarta Sans", "Noto Sans KR", sans-serif',
        titleWeight: '700',
        bodyWeight: '400',
        scale: 0.96,
      };
    case 'handwriting':
      return {
        family: '"Nanum Pen Script", "Gowun Batang", cursive',
        titleWeight: '400',
        bodyWeight: '400',
        scale: 1.26,
      };
    case 'myeongjo':
    default:
      return {
        family: '"Gowun Batang", Georgia, serif',
        titleWeight: '700',
        bodyWeight: '400',
        scale: 1,
      };
  }
}

async function ensureFontsReady(font: AlbumFont): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const spec = getAlbumFontSpec(font);
  try {
    await Promise.all([
      document.fonts.load(`${spec.titleWeight} 48px ${spec.family}`, '가나다라ABC123'),
      document.fonts.load(`${spec.bodyWeight} 28px ${spec.family}`, '가나다라ABC123'),
      document.fonts.load('500 24px "JetBrains Mono", monospace', '01 / 03'),
    ]);
    await document.fonts.ready;
  } catch {
    await document.fonts.ready;
  }
}

function getThemeColors(theme: AlbumTheme) {
  switch (theme) {
    case 'beige':
      return {
        bg: '#F5EFE6',
        matBg: '#ECE3D5',
        border: '#DFD4C4',
        ruleStrong: '#2C241E',
        ruleSoft: '#C9BCA9',
        textPrimary: '#2C241E',
        textSecondary: '#5E5247',
        textMuted: '#7A6D60',
      };
    case 'navy':
      return {
        bg: '#162235',
        matBg: '#1D2D44',
        border: '#2A3A54',
        ruleStrong: '#E2E8F0',
        ruleSoft: '#475569',
        textPrimary: '#F3F4F6',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
      };
    case 'white':
    default:
      return {
        bg: '#FFFFFF',
        matBg: '#F7F6F2',
        border: '#E4E4E7',
        ruleStrong: '#18181B',
        ruleSoft: '#D4D4D8',
        textPrimary: '#18181B',
        textSecondary: '#52525B',
        textMuted: '#71717A',
      };
  }
}

function loadImageForCanvas(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지를 불러올 수 없습니다: ${src}`));
    img.src = src;
  });
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }

    let currentLine = '';
    const chars = Array.from(paragraph);

    for (let i = 0; i < chars.length; i += 1) {
      const char = chars[i];
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
        // Prefer breaking on space for English words if a space exists nearby
        const lastSpace = currentLine.lastIndexOf(' ');
        if (lastSpace > currentLine.length * 0.5 && !/[\u3131-\uD79D]/.test(char)) {
          lines.push(currentLine.slice(0, lastSpace));
          currentLine = currentLine.slice(lastSpace + 1) + char;
        } else {
          lines.push(currentLine);
          currentLine = char;
        }
      } else {
        currentLine = testLine;
      }

      if (lines.length >= maxLines) {
        break;
      }
    }

    if (currentLine.length > 0 && lines.length < maxLines) {
      lines.push(currentLine);
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  return lines.slice(0, maxLines);
}

function padTwo(num: number): string {
  return String(num).padStart(2, '0');
}

function renderCoverCanvas(options: PdfExportOptions): HTMLCanvasElement {
  const dims = options.orientation === 'portrait' ? A4_PORTRAIT_PX : A4_LANDSCAPE_PX;
  const palette = getThemeColors(options.theme);
  const fontSpec = getAlbumFontSpec(options.font);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, dims.width, dims.height);

  // Subtle hairline frame
  const inset = 110;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, dims.width - inset * 2, dims.height - inset * 2);

  const centerX = dims.width / 2;
  const isPortrait = options.orientation === 'portrait';
  const maxTextWidth = dims.width - 360;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Prominent Album Title
  ctx.fillStyle = palette.textPrimary;
  const titleSize = Math.round((isPortrait ? 104 : 92) * fontSpec.scale);
  ctx.font = `${fontSpec.titleWeight} ${titleSize}px ${fontSpec.family}`;
  const titleLines = wrapTextLines(ctx, options.albumTitle || '나의 사진 앨범', maxTextWidth, 3);
  const titleLineHeight = Math.round(titleSize * 1.28);
  const titleBlockCenterY = dims.height * (isPortrait ? 0.38 : 0.37);
  const titleStartY = titleBlockCenterY - ((titleLines.length - 1) * titleLineHeight) / 2;

  titleLines.forEach((line, idx) => {
    ctx.fillText(line, centerX, titleStartY + idx * titleLineHeight);
  });

  let cursorY = titleStartY + titleLines.length * titleLineHeight + 28;

  // Prominent Subtitle
  const subtitle = options.coverSubtitle.trim();
  if (subtitle) {
    ctx.fillStyle = palette.textSecondary;
    const subSize = Math.round((isPortrait ? 46 : 42) * fontSpec.scale);
    ctx.font = `${fontSpec.bodyWeight} ${subSize}px ${fontSpec.family}`;
    const subLines = wrapTextLines(ctx, subtitle, maxTextWidth, 2);
    const subLineHeight = Math.round(subSize * 1.38);
    subLines.forEach((line, idx) => {
      ctx.fillText(line, centerX, cursorY + idx * subLineHeight);
    });
    cursorY += subLines.length * subLineHeight + 44;
  } else {
    cursorY += 32;
  }

  // Minimalist rule divider
  ctx.strokeStyle = palette.ruleStrong;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 72, cursorY);
  ctx.lineTo(centerX + 72, cursorY);
  ctx.stroke();

  cursorY += 74;

  // Prominent Author Name & Date
  const author = options.authorName.trim();
  const dateStr = options.albumDate.trim();
  if (author) {
    ctx.fillStyle = palette.textPrimary;
    const authorSize = Math.round((isPortrait ? 42 : 38) * fontSpec.scale);
    ctx.font = `${fontSpec.titleWeight} ${authorSize}px ${fontSpec.family}`;
    ctx.fillText(author, centerX, cursorY);
    cursorY += Math.round(authorSize * 1.45);
  }

  if (dateStr) {
    ctx.fillStyle = palette.textSecondary;
    ctx.font = `400 ${isPortrait ? 34 : 32}px "JetBrains Mono", "Plus Jakarta Sans", "Noto Sans KR", monospace`;
    ctx.fillText(dateStr, centerX, cursorY);
  }

  return canvas;
}

function renderClosingCanvas(options: PdfExportOptions): HTMLCanvasElement {
  const dims = options.orientation === 'portrait' ? A4_PORTRAIT_PX : A4_LANDSCAPE_PX;
  const palette = getThemeColors(options.theme);
  const fontSpec = getAlbumFontSpec(options.font);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, dims.width, dims.height);

  const inset = 110;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, dims.width - inset * 2, dims.height - inset * 2);

  const centerX = dims.width / 2;
  const isPortrait = options.orientation === 'portrait';
  const maxTextWidth = dims.width - 420;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const message =
    options.closingMessage.trim() || '함께 기록한 소중한 순간들을 오래 기억하며.';

  ctx.fillStyle = palette.textPrimary;
  const msgSize = Math.round((isPortrait ? 44 : 40) * fontSpec.scale);
  ctx.font = `${fontSpec.bodyWeight} ${msgSize}px ${fontSpec.family}`;
  const msgLines = wrapTextLines(ctx, message, maxTextWidth, 10);
  const lineHeight = Math.round(msgSize * 1.6);
  const blockCenterY = dims.height * 0.45;
  const startY = blockCenterY - ((msgLines.length - 1) * lineHeight) / 2;

  msgLines.forEach((line, idx) => {
    ctx.fillText(line, centerX, startY + idx * lineHeight);
  });

  // Hairline divider and signature
  const ruleY = startY + msgLines.length * lineHeight + 56;
  ctx.strokeStyle = palette.ruleSoft;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 48, ruleY);
  ctx.lineTo(centerX + 48, ruleY);
  ctx.stroke();

  const metaParts = [options.authorName.trim(), options.albumDate.trim()].filter(Boolean);
  if (metaParts.length > 0) {
    ctx.fillStyle = palette.textMuted;
    const metaSize = Math.round(28 * fontSpec.scale);
    ctx.font = `${fontSpec.bodyWeight} ${metaSize}px ${fontSpec.family}`;
    ctx.fillText(metaParts.join(' · '), centerX, ruleY + 60);
  }

  return canvas;
}

async function renderPhotoPageCanvas(
  photo: AlbumPhoto,
  pageIndex: number,
  totalPages: number,
  options: PdfExportOptions
): Promise<HTMLCanvasElement> {
  const dims = options.orientation === 'portrait' ? A4_PORTRAIT_PX : A4_LANDSCAPE_PX;
  const palette = getThemeColors(options.theme);
  const fontSpec = getAlbumFontSpec(options.font);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, dims.width, dims.height);

  const isPortrait = options.orientation === 'portrait';
  const marginX = isPortrait ? 132 : 148;
  const marginTop = isPortrait ? 132 : 112;
  const marginBottom = isPortrait ? 120 : 108;

  // Footer area reserved for title + description + page number
  const hasTitle = photo.title.trim().length > 0;
  const hasDesc = photo.description.trim().length > 0;

  const captionBlockHeight = isPortrait
    ? hasTitle || hasDesc
      ? 370
      : 110
    : hasTitle || hasDesc
      ? 265
      : 90;

  const photoBoxX = marginX;
  const photoBoxY = marginTop;
  const photoBoxW = dims.width - marginX * 2;
  const photoBoxH = dims.height - marginTop - marginBottom - captionBlockHeight;

  // Subtle archival mat background when 'framed' style is active
  if (options.pageStyle === 'framed') {
    ctx.fillStyle = palette.matBg;
    ctx.fillRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);
  }

  // Load and draw image centered with contain fit
  const img = await loadImageForCanvas(photo.src);
  const innerPad = options.pageStyle === 'framed' ? 36 : 0;
  const availW = photoBoxW - innerPad * 2;
  const availH = photoBoxH - innerPad * 2;

  const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const drawX = photoBoxX + innerPad + (availW - drawW) / 2;
  const drawY = photoBoxY + innerPad + (availH - drawH) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // Subtle border around photo edge when framed
  if (options.pageStyle === 'framed') {
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);
  }

  // Hairline rule separating photo and editorial caption
  const textAreaTop = photoBoxY + photoBoxH + (isPortrait ? 56 : 42);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginX, textAreaTop - 24);
  ctx.lineTo(dims.width - marginX, textAreaTop - 24);
  ctx.stroke();

  const textWidth = isPortrait ? photoBoxW - 140 : photoBoxW - 220;

  let cursorY = textAreaTop + 18;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (hasTitle) {
    ctx.fillStyle = palette.textPrimary;
    const titleSize = Math.round((isPortrait ? 46 : 40) * fontSpec.scale);
    ctx.font = `${fontSpec.titleWeight} ${titleSize}px ${fontSpec.family}`;
    const titleLines = wrapTextLines(ctx, photo.title.trim(), textWidth, 2);
    const titleLineHeight = Math.round(titleSize * 1.3);
    titleLines.forEach((line) => {
      ctx.fillText(line, marginX, cursorY);
      cursorY += titleLineHeight;
    });
    cursorY += 14;
  }

  if (hasDesc) {
    ctx.fillStyle = palette.textSecondary;
    const descSize = Math.round((isPortrait ? 28 : 25) * fontSpec.scale);
    ctx.font = `${fontSpec.bodyWeight} ${descSize}px ${fontSpec.family}`;
    const descLines = wrapTextLines(ctx, photo.description.trim(), textWidth, isPortrait ? 5 : 4);
    const descLineHeight = Math.round(descSize * 1.52);
    descLines.forEach((line) => {
      ctx.fillText(line, marginX, cursorY);
      cursorY += descLineHeight;
    });
  }

  if (!hasTitle && !hasDesc) {
    ctx.fillStyle = palette.textMuted;
    const fallbackSize = Math.round(24 * fontSpec.scale);
    ctx.font = `${fontSpec.bodyWeight} ${fallbackSize}px ${fontSpec.family}`;
    ctx.fillText(options.albumTitle || '사진 앨범', marginX, cursorY);
  }

  // Page numbering in bottom-right
  if (options.showPageNumbers) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = palette.textMuted;
    ctx.font = '500 24px "JetBrains Mono", monospace';
    ctx.fillText(
      `${padTwo(pageIndex + 1)} / ${padTwo(totalPages)}`,
      dims.width - marginX,
      textAreaTop + 20
    );
  }

  return canvas;
}

function downloadCanvasAsPng(canvas: HTMLCanvasElement, fileName: string): void {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function sanitizeFileName(name: string): string {
  return (name || '사진_앨범').trim().replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
}

export async function exportSinglePageToPng(
  photos: AlbumPhoto[],
  currentIndex: number,
  options: PdfExportOptions
): Promise<void> {
  if (photos.length === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  await ensureFontsReady(options.font);
  const safeBase = sanitizeFileName(options.albumTitle);

  if (currentIndex === 0) {
    const canvas = renderCoverCanvas(options);
    downloadCanvasAsPng(canvas, `${safeBase}_표지.png`);
    return;
  }

  if (currentIndex === photos.length + 1) {
    const canvas = renderClosingCanvas(options);
    downloadCanvasAsPng(canvas, `${safeBase}_마무리.png`);
    return;
  }

  const photoIdx = Math.max(0, Math.min(photos.length - 1, currentIndex - 1));
  const canvas = await renderPhotoPageCanvas(photos[photoIdx], photoIdx, photos.length, options);
  downloadCanvasAsPng(canvas, `${safeBase}_${padTwo(photoIdx + 1)}.png`);
}

export async function exportAlbumToPdf(
  photos: AlbumPhoto[],
  options: PdfExportOptions,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (photos.length === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  await ensureFontsReady(options.font);

  const totalSteps =
    photos.length + (options.includeCover ? 1 : 0) + (options.includeClosing ? 1 : 0);
  let completed = 0;

  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  let isFirstPdfPage = true;

  if (options.includeCover) {
    const coverCanvas = renderCoverCanvas(options);
    const coverData = coverCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(coverData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    isFirstPdfPage = false;
    completed += 1;
    onProgress?.(completed, totalSteps);
  }

  for (let i = 0; i < photos.length; i += 1) {
    if (!isFirstPdfPage) {
      pdf.addPage('a4', options.orientation);
    }
    isFirstPdfPage = false;

    const pageCanvas = await renderPhotoPageCanvas(photos[i], i, photos.length, options);
    const pageData = pageCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(pageData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

    completed += 1;
    onProgress?.(completed, totalSteps);
  }

  if (options.includeClosing) {
    if (!isFirstPdfPage) {
      pdf.addPage('a4', options.orientation);
    }
    isFirstPdfPage = false;

    const closingCanvas = renderClosingCanvas(options);
    const closingData = closingCanvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(closingData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    completed += 1;
    onProgress?.(completed, totalSteps);
  }

  const safeTitle = sanitizeFileName(options.albumTitle);
  pdf.save(`${safeTitle || '사진_앨범'}.pdf`);
}
