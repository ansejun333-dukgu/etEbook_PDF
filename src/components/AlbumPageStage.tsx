import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageDown, ImagePlus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AlbumFont, AlbumPhoto, AlbumTheme, PageStyle, PaperOrientation } from '../types/album';

interface AlbumPageStageProps {
  photo: AlbumPhoto | undefined;
  currentIndex: number;
  photoCount: number;
  albumTitle: string;
  coverSubtitle: string;
  authorName: string;
  albumDate: string;
  closingMessage: string;
  orientation: PaperOrientation;
  pageStyle: PageStyle;
  theme: AlbumTheme;
  font: AlbumFont;
  isUsingSamples: boolean;
  isSavingPng?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onChangeTheme: (theme: AlbumTheme) => void;
  onChangeFont: (font: AlbumFont) => void;
  onSavePng: () => void;
  onUpdateCover: (patch: {
    albumTitle?: string;
    coverSubtitle?: string;
    authorName?: string;
    albumDate?: string;
    closingMessage?: string;
  }) => void;
  onUpdatePhoto: (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => void;
  onDeletePhoto: (id: string) => void;
  onUploadClick: () => void;
  onRestoreSamples: () => void;
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export const AlbumPageStage: React.FC<AlbumPageStageProps> = ({
  photo,
  currentIndex,
  photoCount,
  albumTitle,
  coverSubtitle,
  authorName,
  albumDate,
  closingMessage,
  orientation,
  pageStyle,
  theme,
  font,
  isUsingSamples,
  isSavingPng,
  onPrev,
  onNext,
  onChangeTheme,
  onChangeFont,
  onSavePng,
  onUpdateCover,
  onUpdatePhoto,
  onDeletePhoto,
  onUploadClick,
  onRestoreSamples,
}) => {
  const [imgError, setImgError] = useState(false);
  const descRef = useRef<HTMLTextAreaElement | null>(null);
  const coverTitleRef = useRef<HTMLTextAreaElement | null>(null);
  const closingRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [photo?.id, photo?.src]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [photo?.id, photo?.description]);

  useEffect(() => {
    const el = coverTitleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [currentIndex, albumTitle]);

  useEffect(() => {
    const el = closingRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [currentIndex, closingMessage]);

  // Empty state when user cleared all photos
  if (photoCount === 0) {
    return (
      <section className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-xl bg-white border border-zinc-200/90 rounded-2xl shadow-[0_12px_40px_-12px_rgba(24,24,27,0.08)] p-10 sm:p-14 text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-[#F6F5F1] border border-zinc-200 flex items-center justify-center text-zinc-700">
            <ImagePlus className="w-5 h-5" />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
            나만의 사진 앨범을 시작해보세요
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed mb-8">
            여러 장의 사진을 한 번에 올리거나 화면에 끌어다 놓으면, 한 쪽에 한 장씩 담긴 사진집이 만들어집니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onUploadClick}
              className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900"
            >
              사진 여러 장 올리기
            </button>
            <button
              type="button"
              onClick={onRestoreSamples}
              className="px-4 py-2.5 text-sm font-medium text-zinc-700 bg-[#F6F5F1] border border-zinc-200 rounded-lg hover:bg-zinc-200/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              예시 사진 불러오기
            </button>
          </div>
        </div>
      </section>
    );
  }

  const totalPages = photoCount + 2; // Cover (0) + Photos (1..N) + Closing (N+1)
  const isCoverPage = currentIndex === 0;
  const isClosingPage = currentIndex === photoCount + 1;
  const isPhotoPage = !isCoverPage && !isClosingPage;
  const photoIndex = currentIndex - 1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalPages - 1;
  const isPortrait = orientation === 'portrait';

  const pageLabel = isCoverPage
    ? '표지'
    : isClosingPage
      ? '마무리'
      : `${padTwo(photoIndex + 1)} / ${padTwo(photoCount)}`;

  const sheetKey = isCoverPage
    ? 'album-cover-page'
    : isClosingPage
      ? 'album-closing-page'
      : photo?.id ?? `photo-${currentIndex}`;

  const themeStyle =
    theme === 'beige'
      ? {
          sheet: 'bg-[#F5EFE6] border-[#DFD4C4]',
          innerFrame: 'border-[#DFD4C4]',
          titleText: 'text-[#2C241E]',
          bodyText: 'text-[#5E5247]',
          mutedText: 'text-[#7A6D60]',
          placeholder: 'placeholder:text-[#B8AC9D]',
          inputBorder: 'hover:border-[#CFC1AE] focus:border-[#2C241E]',
          ruleStrong: 'bg-[#2C241E]',
          ruleSoft: 'bg-[#C9BCA9]',
          dividerBorder: 'border-[#DFD4C4]',
          photoFramed: 'bg-[#ECE3D5] border border-[#DFD4C4] p-4 sm:p-6',
          photoClassic: 'bg-[#EFE8DC]/50',
        }
      : theme === 'navy'
        ? {
            sheet: 'bg-[#162235] border-[#2A3A54]',
            innerFrame: 'border-[#2A3A54]',
            titleText: 'text-[#F3F4F6]',
            bodyText: 'text-[#CBD5E1]',
            mutedText: 'text-[#94A3B8]',
            placeholder: 'placeholder:text-[#64748B]',
            inputBorder: 'hover:border-[#3E5272] focus:border-[#E2E8F0]',
            ruleStrong: 'bg-[#E2E8F0]',
            ruleSoft: 'bg-[#475569]',
            dividerBorder: 'border-[#2A3A54]',
            photoFramed: 'bg-[#1D2D44] border border-[#2A3A54] p-4 sm:p-6',
            photoClassic: 'bg-[#101A29]/45',
          }
        : {
            sheet: 'bg-white border-zinc-200/90',
            innerFrame: 'border-zinc-200/80',
            titleText: 'text-zinc-900',
            bodyText: 'text-zinc-600',
            mutedText: 'text-zinc-500',
            placeholder: 'placeholder:text-zinc-300',
            inputBorder: 'hover:border-zinc-200 focus:border-zinc-900',
            ruleStrong: 'bg-zinc-900',
            ruleSoft: 'bg-zinc-300',
            dividerBorder: 'border-zinc-200/80',
            photoFramed: 'bg-[#F7F6F2] border border-zinc-200/70 p-4 sm:p-6',
            photoClassic: 'bg-zinc-50/40',
          };

  const themeOptions: { id: AlbumTheme; label: string; swatchClass: string }[] = [
    { id: 'white', label: '흰색(깔끔)', swatchClass: 'bg-white border-zinc-300' },
    { id: 'beige', label: '베이지(따뜻한 종이)', swatchClass: 'bg-[#F5EFE6] border-[#C9BCA9]' },
    { id: 'navy', label: '네이비(차분함)', swatchClass: 'bg-[#162235] border-[#2A3A54]' },
  ];

  const fontOptions: { id: AlbumFont; label: string; previewClass: string }[] = [
    { id: 'gothic', label: '고딕', previewClass: 'font-album-gothic' },
    { id: 'myeongjo', label: '명조', previewClass: 'font-album-myeongjo' },
    { id: 'handwriting', label: '손글씨', previewClass: 'font-album-handwriting text-sm' },
  ];

  const fontClass =
    font === 'gothic'
      ? 'font-album-gothic'
      : font === 'handwriting'
        ? 'font-album-handwriting'
        : 'font-album-myeongjo';

  const isHandwriting = font === 'handwriting';

  return (
    <section
      aria-label="단일 페이지 앨범 뷰어"
      className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pt-5 pb-4 min-h-0"
    >
      {/* Top quiet context strip */}
      <div className="w-full max-w-[1040px] flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-zinc-800 truncate">
            {albumTitle || '나의 사진 앨범'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="whitespace-nowrap shrink-0">
            {isPortrait ? 'A4 세로' : 'A4 가로'}
          </span>
          {isUsingSamples && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-500 whitespace-nowrap shrink-0">
                예시 앨범 (내 사진을 올리면 바로 교체됩니다)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="font-mono tabular-nums text-zinc-600 whitespace-nowrap">
            {pageLabel}
          </span>
          <button
            type="button"
            onClick={onSavePng}
            disabled={isSavingPng}
            title="현재 페이지 PNG로 저장"
            aria-label="현재 페이지 PNG로 저장"
            className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-950 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded"
          >
            <ImageDown className="w-3.5 h-3.5" />
            <span>{isSavingPng ? '저장 중...' : 'PNG 저장'}</span>
          </button>
          {isPhotoPage && photo && (
            <button
              type="button"
              onClick={() => onDeletePhoto(photo.id)}
              title="현재 페이지 삭제"
              aria-label="현재 페이지 삭제"
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#C83E2B] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">페이지 삭제</span>
            </button>
          )}
        </div>
      </div>

      {/* Album Color Mood & Font Selectors */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
        <div
          role="group"
          aria-label="앨범 색 분위기 선택"
          className="inline-flex flex-wrap items-center justify-center gap-1 p-1 bg-zinc-200/60 border border-zinc-200/80 rounded-lg"
        >
          {themeOptions.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeTheme(opt.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                  active
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-3 h-3 rounded-[3px] border shrink-0 ${opt.swatchClass}`}
                />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="앨범 글꼴 선택"
          className="inline-flex items-center justify-center gap-1 p-1 bg-zinc-200/60 border border-zinc-200/80 rounded-lg"
        >
          {fontOptions.map((opt) => {
            const active = font === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeFont(opt.id)}
                aria-pressed={active}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                  opt.previewClass
                } ${
                  active
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Spread Area with Flanking Previous / Next Controls */}
      <div className="w-full max-w-[1160px] flex items-center justify-center gap-3 sm:gap-6 lg:gap-10">
        {/* Desktop Previous Button */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="이전 페이지"
          className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-zinc-200/90 text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-200/90 transition-all duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Single Archival Page Sheet */}
        <div
          className={`w-full flex justify-center ${
            isPortrait ? 'max-w-[520px]' : 'max-w-[780px]'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.article
              key={sheetKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full border rounded-sm shadow-[0_18px_50px_-16px_rgba(24,24,27,0.12)] flex flex-col justify-between transition-colors duration-200 ${
                themeStyle.sheet
              } ${
                isPortrait
                  ? 'p-5 sm:p-8 min-h-[540px] sm:min-h-[620px]'
                  : 'p-5 sm:p-8 min-h-[440px] sm:min-h-[520px]'
              }`}
            >
              {isCoverPage ? (
                /* Cover Page (First Page) */
                <div
                  className={`flex-1 border px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center justify-between text-center ${themeStyle.innerFrame}`}
                >
                  <span
                    className={`text-xs tracking-[0.22em] uppercase select-none ${themeStyle.mutedText}`}
                  >
                    Cover
                  </span>

                  <div className="w-full max-w-[440px] my-auto flex flex-col items-center gap-4">
                    <div className="w-full">
                      <label htmlFor="cover-title-input" className="sr-only">
                        앨범 제목
                      </label>
                      <textarea
                        ref={coverTitleRef}
                        id="cover-title-input"
                        value={albumTitle}
                        onChange={(e) => onUpdateCover({ albumTitle: e.target.value })}
                        placeholder="앨범 제목을 입력하세요"
                        rows={1}
                        maxLength={60}
                        className={`w-full text-center leading-tight bg-transparent border-b border-transparent focus:outline-none resize-none py-1 transition-colors ${fontClass} ${
                          isHandwriting
                            ? 'text-4xl sm:text-6xl font-normal'
                            : 'text-3xl sm:text-5xl font-bold'
                        } ${themeStyle.titleText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="cover-subtitle-input" className="sr-only">
                        앨범 부제
                      </label>
                      <input
                        id="cover-subtitle-input"
                        type="text"
                        value={coverSubtitle}
                        onChange={(e) => onUpdateCover({ coverSubtitle: e.target.value })}
                        placeholder="부제를 입력하세요"
                        maxLength={80}
                        className={`w-full text-center bg-transparent border-b border-transparent focus:outline-none py-1 transition-colors ${fontClass} ${
                          isHandwriting ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-2xl'
                        } ${themeStyle.bodyText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                      />
                    </div>

                    <div
                      className={`w-14 h-px my-3 ${themeStyle.ruleStrong}`}
                      aria-hidden="true"
                    />

                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="w-full max-w-[300px]">
                        <label htmlFor="cover-author-input" className="sr-only">
                          이름
                        </label>
                        <input
                          id="cover-author-input"
                          type="text"
                          value={authorName}
                          onChange={(e) => onUpdateCover({ authorName: e.target.value })}
                          placeholder="이름을 입력하세요"
                          maxLength={40}
                          className={`w-full text-center bg-transparent border-b border-transparent focus:outline-none py-1 transition-colors ${fontClass} ${
                            isHandwriting
                              ? 'text-2xl sm:text-3xl font-normal'
                              : 'text-lg sm:text-xl font-semibold'
                          } ${themeStyle.titleText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                        />
                      </div>

                      <div className="w-full max-w-[260px]">
                        <label htmlFor="cover-date-input" className="sr-only">
                          날짜
                        </label>
                        <input
                          id="cover-date-input"
                          type="text"
                          value={albumDate}
                          onChange={(e) => onUpdateCover({ albumDate: e.target.value })}
                          placeholder="날짜 (예: 2026. 11. 26)"
                          maxLength={40}
                          className={`w-full font-mono text-base sm:text-lg text-center bg-transparent border-b border-transparent focus:outline-none py-1 transition-colors ${themeStyle.mutedText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                        />
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs ${themeStyle.mutedText}`}>
                    사진 {photoCount}장 수록
                  </span>
                </div>
              ) : isClosingPage ? (
                /* Closing Page (Last Page) */
                <div
                  className={`flex-1 border px-6 sm:px-12 py-8 sm:py-12 flex flex-col items-center justify-between text-center ${themeStyle.innerFrame}`}
                >
                  <span className={`text-xs tracking-[0.22em] select-none ${themeStyle.mutedText}`}>
                    마무리
                  </span>

                  <div className="w-full max-w-[440px] my-auto flex flex-col items-center gap-6">
                    <div className="w-full">
                      <label htmlFor="closing-message-input" className="sr-only">
                        마무리 문구
                      </label>
                      <textarea
                        ref={closingRef}
                        id="closing-message-input"
                        value={closingMessage}
                        onChange={(e) => onUpdateCover({ closingMessage: e.target.value })}
                        placeholder="앨범을 마무리하는 문구나 소감을 적어보세요..."
                        rows={4}
                        maxLength={500}
                        className={`w-full text-center leading-relaxed bg-transparent border-b border-transparent focus:outline-none resize-none py-2 transition-colors ${fontClass} ${
                          isHandwriting ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-2xl'
                        } ${themeStyle.titleText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                      />
                    </div>

                    <div className={`w-12 h-px ${themeStyle.ruleSoft}`} aria-hidden="true" />

                    {(authorName.trim() || albumDate.trim()) && (
                      <p className={`text-sm ${fontClass} ${themeStyle.mutedText}`}>
                        {[authorName.trim(), albumDate.trim()].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  <span className={`text-xs ${themeStyle.mutedText}`}>
                    {albumTitle || '나의 사진 앨범'}
                  </span>
                </div>
              ) : (
                /* Existing Photo Page (Unchanged structure, themed colors + font) */
                photo && (
                  <>
                    {/* Single Photo Display Frame */}
                    <div
                      className={`relative w-full flex-1 flex items-center justify-center overflow-hidden ${
                        pageStyle === 'framed' ? themeStyle.photoFramed : themeStyle.photoClassic
                      } ${isPortrait ? 'h-[310px] sm:h-[390px]' : 'h-[260px] sm:h-[340px]'}`}
                    >
                      {!imgError ? (
                        <img
                          src={photo.src}
                          alt={photo.title || `앨범 사진 ${photoIndex + 1}`}
                          referrerPolicy="no-referrer"
                          onError={() => setImgError(true)}
                          className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center ${themeStyle.mutedText}`}
                        >
                          <ImagePlus className="w-6 h-6" />
                          <span className="text-xs">이미지를 불러올 수 없습니다</span>
                        </div>
                      )}
                    </div>

                    {/* Editorial Caption Area (Editable Title + Description) */}
                    <div
                      className={`mt-5 pt-4 border-t flex flex-col gap-2 ${themeStyle.dividerBorder}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <label htmlFor={`photo-title-${photo.id}`} className="sr-only">
                            사진 제목
                          </label>
                          <input
                            id={`photo-title-${photo.id}`}
                            type="text"
                            value={photo.title}
                            onChange={(e) => onUpdatePhoto(photo.id, { title: e.target.value })}
                            placeholder="사진 제목을 입력하세요"
                            maxLength={80}
                            className={`w-full bg-transparent border-b border-transparent focus:outline-none pb-1 transition-colors ${fontClass} ${
                              isHandwriting
                                ? 'text-2xl sm:text-3xl font-normal'
                                : 'text-lg sm:text-xl font-bold'
                            } ${themeStyle.titleText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                          />
                        </div>
                        <span
                          className={`font-mono tabular-nums text-xs pt-1.5 shrink-0 ${themeStyle.mutedText}`}
                        >
                          {padTwo(photoIndex + 1)}
                        </span>
                      </div>

                      <div>
                        <label htmlFor={`photo-desc-${photo.id}`} className="sr-only">
                          사진 설명
                        </label>
                        <textarea
                          ref={descRef}
                          id={`photo-desc-${photo.id}`}
                          value={photo.description}
                          onChange={(e) =>
                            onUpdatePhoto(photo.id, { description: e.target.value })
                          }
                          placeholder="이 사진에 담긴 이야기나 기록을 적어보세요..."
                          rows={2}
                          maxLength={400}
                          className={`w-full leading-relaxed bg-transparent border-b border-transparent focus:outline-none resize-none py-1 transition-colors ${fontClass} ${
                            isHandwriting ? 'text-lg sm:text-xl' : 'text-sm'
                          } ${themeStyle.bodyText} ${themeStyle.placeholder} ${themeStyle.inputBorder}`}
                        />
                      </div>
                    </div>
                  </>
                )
              )}
            </motion.article>
          </AnimatePresence>
        </div>

        {/* Desktop Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="다음 페이지"
          className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-zinc-200/90 text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-200/90 transition-all duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Explicit Previous / Next Text Controls */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-zinc-800 bg-white border border-zinc-200/90 rounded-lg hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전</span>
        </button>

        <span className="font-mono tabular-nums text-xs text-zinc-500 px-2 whitespace-nowrap shrink-0">
          {pageLabel}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-zinc-800 bg-white border border-zinc-200/90 rounded-lg hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <span>다음</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
