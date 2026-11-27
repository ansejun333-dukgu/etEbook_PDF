import React, { useEffect, useState } from 'react';
import { Download, ImageDown, X } from 'lucide-react';
import { AlbumFont, AlbumPhoto, AlbumTheme, PageStyle, PaperOrientation } from '../types/album';
import { exportAlbumToPdf, exportSinglePageToPng } from '../utils/pdfExport';

interface PdfExportModalProps {
  isOpen: boolean;
  photos: AlbumPhoto[];
  currentIndex: number;
  albumTitle: string;
  coverSubtitle: string;
  authorName: string;
  albumDate: string;
  closingMessage: string;
  orientation: PaperOrientation;
  pageStyle: PageStyle;
  theme: AlbumTheme;
  font: AlbumFont;
  onChangeTitle: (title: string) => void;
  onChangeOrientation: (orientation: PaperOrientation) => void;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  photos,
  currentIndex,
  albumTitle,
  coverSubtitle,
  authorName,
  albumDate,
  closingMessage,
  orientation,
  pageStyle,
  theme,
  font,
  onChangeTitle,
  onChangeOrientation,
  onClose,
}) => {
  const [includeCover, setIncludeCover] = useState(true);
  const [includeClosing, setIncludeClosing] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setProgress(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPdfPages =
    photos.length + (includeCover ? 1 : 0) + (includeClosing ? 1 : 0);

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    setProgress({ current: 0, total: totalPdfPages });

    try {
      await exportAlbumToPdf(
        photos,
        {
          albumTitle,
          coverSubtitle,
          authorName,
          albumDate,
          closingMessage,
          orientation,
          pageStyle,
          theme,
          font,
          includeCover,
          includeClosing,
          showPageNumbers,
        },
        (current, total) => setProgress({ current, total })
      );
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'PDF를 생성하는 중 문제가 발생했습니다.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentPng = async () => {
    setIsExporting(true);
    setErrorMsg(null);
    try {
      await exportSinglePageToPng(photos, currentIndex, {
        albumTitle,
        coverSubtitle,
        authorName,
        albumDate,
        closingMessage,
        orientation,
        pageStyle,
        theme,
        font,
        includeCover,
        includeClosing,
        showPageNumbers,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'PNG를 생성하는 중 문제가 발생했습니다.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 backdrop-blur-[2px] p-4"
      onClick={() => !isExporting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div
        className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
          <div>
            <h2 id="pdf-modal-title" className="font-editorial text-xl font-bold text-zinc-900">
              PDF 앨범으로 저장
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              한 쪽에 사진 한 장씩 총 {totalPdfPages}페이지의 PDF로 저장됩니다
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="pdf-title-input"
              className="block text-xs font-medium text-zinc-600 mb-1.5"
            >
              파일 이름 · 앨범 제목
            </label>
            <input
              id="pdf-title-input"
              type="text"
              value={albumTitle}
              disabled={isExporting}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="나의 사진 앨범"
              maxLength={60}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F6F5F1] border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-zinc-600 mb-2">
              PDF 용지 방향
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F5F1] rounded-lg border border-zinc-200/70">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onChangeOrientation('portrait')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  orientation === 'portrait'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                A4 세로형
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onChangeOrientation('landscape')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  orientation === 'landscape'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                A4 가로형
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCover}
                disabled={isExporting}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 rounded cursor-pointer"
              />
              <span>첫 쪽에 표지 페이지 포함</span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeClosing}
                disabled={isExporting}
                onChange={(e) => setIncludeClosing(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 rounded cursor-pointer"
              />
              <span>마지막 쪽에 마무리 문구 페이지 포함</span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPageNumbers}
                disabled={isExporting}
                onChange={(e) => setShowPageNumbers(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 rounded cursor-pointer"
              />
              <span>하단에 쪽 번호(01 / {String(photos.length).padStart(2, '0')}) 표시</span>
            </label>
          </div>

          {isExporting && progress && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5">
                <span>고해상도 PDF 페이지 생성 중...</span>
                <span className="font-mono tabular-nums">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 transition-all duration-150"
                  style={{
                    width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-[#C83E2B] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}
        </div>

        <div className="mt-7 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleExportCurrentPng}
            disabled={isExporting || photos.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-zinc-700 bg-[#F6F5F1] border border-zinc-200 rounded-lg hover:bg-zinc-200/70 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ImageDown className="w-4 h-4" />
            <span>현재 쪽 PNG</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-40 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || photos.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? '생성 중...' : 'PDF 다운로드'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
