import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { AlbumPageStage } from './components/AlbumPageStage';
import { FilmstripBar } from './components/FilmstripBar';
import { OverviewGrid } from './components/OverviewGrid';
import { PdfExportModal } from './components/PdfExportModal';
import { SettingsModal } from './components/SettingsModal';
import { TopBar } from './components/TopBar';
import {
  SAMPLE_ALBUM_DATE,
  SAMPLE_ALBUM_TITLE,
  SAMPLE_AUTHOR_NAME,
  SAMPLE_CLOSING_MESSAGE,
  SAMPLE_COVER_SUBTITLE,
  SAMPLE_PHOTOS,
} from './data/sampleAlbum';
import { AlbumFont, AlbumPhoto, AlbumTheme, PageStyle, PaperOrientation, ViewMode } from './types/album';
import { processImageFiles } from './utils/imageLoader';
import { exportSinglePageToPng } from './utils/pdfExport';
import { loadAlbumState, saveAlbumState } from './utils/storage';

function getTodayFormatted(): string {
  const d = new Date();
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default function App() {
  const [photos, setPhotos] = useState<AlbumPhoto[]>(SAMPLE_PHOTOS);
  const [albumTitle, setAlbumTitle] = useState<string>(SAMPLE_ALBUM_TITLE);
  const [coverSubtitle, setCoverSubtitle] = useState<string>(SAMPLE_COVER_SUBTITLE);
  const [authorName, setAuthorName] = useState<string>(SAMPLE_AUTHOR_NAME);
  const [albumDate, setAlbumDate] = useState<string>(SAMPLE_ALBUM_DATE);
  const [closingMessage, setClosingMessage] = useState<string>(SAMPLE_CLOSING_MESSAGE);
  const [orientation, setOrientation] = useState<PaperOrientation>('portrait');
  const [pageStyle, setPageStyle] = useState<PageStyle>('classic');
  const [theme, setTheme] = useState<AlbumTheme>('white');
  const [font, setFont] = useState<AlbumFont>('myeongjo');
  const [isUsingSamples, setIsUsingSamples] = useState<boolean>(true);
  const [isSavingPng, setIsSavingPng] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef<number>(0);

  // Restore persisted album from IndexedDB on initial mount
  useEffect(() => {
    let active = true;
    loadAlbumState().then((saved) => {
      if (!active) return;
      if (saved && Array.isArray(saved.photos)) {
        setPhotos(saved.photos);
        setAlbumTitle(saved.albumTitle || '나의 사진 앨범');
        setCoverSubtitle(saved.coverSubtitle ?? '');
        setAuthorName(saved.authorName ?? '');
        setAlbumDate(saved.albumDate ?? getTodayFormatted());
        setClosingMessage(saved.closingMessage ?? '');
        setOrientation(saved.orientation || 'portrait');
        setPageStyle(saved.pageStyle || 'classic');
        setTheme(saved.theme || 'white');
        setFont(saved.font || 'myeongjo');
        setIsUsingSamples(Boolean(saved.isUsingSamples));
        setCurrentIndex(0);
      }
      setIsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Save state whenever album content or preferences change
  useEffect(() => {
    if (!isLoaded) return;
    saveAlbumState({
      albumTitle,
      coverSubtitle,
      authorName,
      albumDate,
      closingMessage,
      photos,
      orientation,
      pageStyle,
      theme,
      font,
      isUsingSamples,
    });
  }, [
    albumTitle,
    coverSubtitle,
    authorName,
    albumDate,
    closingMessage,
    photos,
    orientation,
    pageStyle,
    theme,
    font,
    isUsingSamples,
    isLoaded,
  ]);

  // Keep currentIndex bounded across Cover (0) + Photos (1..N) + Closing (N+1)
  useEffect(() => {
    if (photos.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex > photos.length + 1) {
      setCurrentIndex(photos.length + 1);
    }
  }, [photos.length, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(photos.length + 1, prev + 1));
  }, [photos.length]);

  // Keyboard arrow navigation in Single-Page View
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'single' || isSettingsOpen || isPdfModalOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, isSettingsOpen, isPdfModalOpen, handlePrev, handleNext]);

  const handleFilesSelected = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList || fileList.length === 0) return;
      setUploadError(null);
      setIsProcessingUpload(true);

      try {
        const addedPhotos = await processImageFiles(fileList);
        if (addedPhotos.length === 0) {
          setUploadError('지원되는 이미지 파일(JPG, PNG, WEBP 등)을 선택해주세요.');
          return;
        }

        if (isUsingSamples) {
          setPhotos(addedPhotos);
          setIsUsingSamples(false);
          if (albumTitle === SAMPLE_ALBUM_TITLE) {
            setAlbumTitle('나의 사진 앨범');
          }
          if (coverSubtitle === SAMPLE_COVER_SUBTITLE) {
            setCoverSubtitle('');
          }
          if (authorName === SAMPLE_AUTHOR_NAME) {
            setAuthorName('');
          }
          if (closingMessage === SAMPLE_CLOSING_MESSAGE) {
            setClosingMessage('');
          }
          setCurrentIndex(1);
        } else {
          setPhotos((prev) => {
            const next = [...prev, ...addedPhotos];
            setCurrentIndex(prev.length + 1);
            return next;
          });
        }
      } catch {
        setUploadError('사진을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsProcessingUpload(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [isUsingSamples, albumTitle, coverSubtitle, authorName, closingMessage]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpdateCover = useCallback(
    (patch: {
      albumTitle?: string;
      coverSubtitle?: string;
      authorName?: string;
      albumDate?: string;
      closingMessage?: string;
    }) => {
      if (patch.albumTitle !== undefined) setAlbumTitle(patch.albumTitle);
      if (patch.coverSubtitle !== undefined) setCoverSubtitle(patch.coverSubtitle);
      if (patch.authorName !== undefined) setAuthorName(patch.authorName);
      if (patch.albumDate !== undefined) setAlbumDate(patch.albumDate);
      if (patch.closingMessage !== undefined) setClosingMessage(patch.closingMessage);
      setIsUsingSamples(false);
    },
    []
  );

  const handleUpdatePhoto = useCallback(
    (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => {
      setPhotos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
      setIsUsingSamples(false);
    },
    []
  );

  const handleDeletePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      const next = prev.filter((item) => item.id !== id);
      if (next.length === 0) {
        setIsUsingSamples(false);
        setCurrentIndex(0);
      } else if (idx !== -1) {
        setCurrentIndex((curr) => (curr > next.length + 1 ? next.length + 1 : curr));
      }
      return next;
    });
  }, []);

  const handleMovePhoto = useCallback((fromIndex: number, toIndex: number) => {
    setPhotos((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    const fromPage = fromIndex + 1;
    const toPage = toIndex + 1;
    setCurrentIndex((curr) => {
      if (curr === fromPage) return toPage;
      if (fromPage < curr && toPage >= curr) return curr - 1;
      if (fromPage > curr && toPage <= curr) return curr + 1;
      return curr;
    });
  }, []);

  const handleClearAlbum = useCallback(() => {
    setPhotos([]);
    setIsUsingSamples(false);
    setCurrentIndex(0);
    setViewMode('single');
  }, []);

  const handleRestoreSamples = useCallback(() => {
    setPhotos(SAMPLE_PHOTOS);
    setAlbumTitle(SAMPLE_ALBUM_TITLE);
    setCoverSubtitle(SAMPLE_COVER_SUBTITLE);
    setAuthorName(SAMPLE_AUTHOR_NAME);
    setAlbumDate(SAMPLE_ALBUM_DATE);
    setClosingMessage(SAMPLE_CLOSING_MESSAGE);
    setIsUsingSamples(true);
    setCurrentIndex(0);
    setViewMode('single');
  }, []);

  const handleSaveCurrentPng = useCallback(async () => {
    if (photos.length === 0) return;
    setIsSavingPng(true);
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
        includeCover: true,
        includeClosing: true,
        showPageNumbers: true,
      });
    } finally {
      setIsSavingPng(false);
    }
  }, [
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
  ]);

  // Global drag-and-drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.types.includes('Files')) return;
    dragCounterRef.current += 1;
    setIsDraggingFiles(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDraggingFiles(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingFiles(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const currentPhoto =
    currentIndex >= 1 && currentIndex <= photos.length
      ? photos[currentIndex - 1]
      : undefined;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F6F5F1] text-zinc-900"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden multi-file image input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      <TopBar
        viewMode={viewMode}
        photoCount={photos.length}
        onUploadClick={handleUploadClick}
        onToggleViewMode={setViewMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearAlbum={handleClearAlbum}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      {/* Mobile secondary quick bar */}
      <div className="md:hidden border-b border-zinc-200/70 bg-[#F6F5F1] px-4 py-2 flex items-center justify-between gap-2 text-xs text-zinc-700 overflow-x-auto">
        <button
          type="button"
          onClick={handleUploadClick}
          className="px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          사진 올리기
        </button>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'single' ? 'overview' : 'single')}
          className="px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          {viewMode === 'overview' ? '한 장씩 보기' : '전체 페이지'}
        </button>
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          편집 설정
        </button>
      </div>

      {/* Upload error or processing banner */}
      {(uploadError || isProcessingUpload) && (
        <div className="max-w-[1040px] w-full mx-auto px-4 sm:px-8 pt-3">
          {isProcessingUpload && (
            <div className="text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg px-4 py-2.5 shadow-sm">
              사진을 앨범 페이지에 맞게 정리하는 중입니다...
            </div>
          )}
          {uploadError && (
            <div className="flex items-center justify-between text-xs text-[#C83E2B] bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              <span>{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="underline cursor-pointer ml-4 shrink-0"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        {viewMode === 'single' ? (
          <>
            <AlbumPageStage
              photo={currentPhoto}
              currentIndex={currentIndex}
              photoCount={photos.length}
              albumTitle={albumTitle}
              coverSubtitle={coverSubtitle}
              authorName={authorName}
              albumDate={albumDate}
              closingMessage={closingMessage}
              orientation={orientation}
              pageStyle={pageStyle}
              theme={theme}
              font={font}
              isUsingSamples={isUsingSamples}
              isSavingPng={isSavingPng}
              onPrev={handlePrev}
              onNext={handleNext}
              onChangeTheme={setTheme}
              onChangeFont={setFont}
              onSavePng={handleSaveCurrentPng}
              onUpdateCover={handleUpdateCover}
              onUpdatePhoto={handleUpdatePhoto}
              onDeletePhoto={handleDeletePhoto}
              onUploadClick={handleUploadClick}
              onRestoreSamples={handleRestoreSamples}
            />
            <FilmstripBar
              photos={photos}
              albumTitle={albumTitle}
              currentIndex={currentIndex}
              onSelectIndex={setCurrentIndex}
              onMovePhoto={handleMovePhoto}
              onDeletePhoto={handleDeletePhoto}
              onUploadClick={handleUploadClick}
            />
          </>
        ) : (
          <OverviewGrid
            photos={photos}
            albumTitle={albumTitle}
            coverSubtitle={coverSubtitle}
            authorName={authorName}
            albumDate={albumDate}
            closingMessage={closingMessage}
            font={font}
            currentIndex={currentIndex}
            onSelectPage={(idx) => {
              setCurrentIndex(idx);
              setViewMode('single');
            }}
            onMovePhoto={handleMovePhoto}
            onDeletePhoto={handleDeletePhoto}
            onUpdatePhoto={handleUpdatePhoto}
            onUploadClick={handleUploadClick}
          />
        )}
      </main>

      {/* Drag & Drop Overlay */}
      {isDraggingFiles && (
        <div className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-none">
          <div className="w-full max-w-md bg-white border-2 border-dashed border-zinc-900 rounded-2xl p-10 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#F6F5F1] flex items-center justify-center text-zinc-900">
              <Upload className="w-5 h-5" />
            </div>
            <p className="font-editorial text-xl font-bold text-zinc-900 mb-1.5">
              여기에 사진을 놓아주세요
            </p>
            <p className="text-sm text-zinc-500">
              여러 장을 한꺼번에 앨범 페이지로 추가합니다
            </p>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        albumTitle={albumTitle}
        orientation={orientation}
        pageStyle={pageStyle}
        onChangeTitle={setAlbumTitle}
        onChangeOrientation={setOrientation}
        onChangePageStyle={setPageStyle}
        onClose={() => setIsSettingsOpen(false)}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        photos={photos}
        currentIndex={currentIndex}
        albumTitle={albumTitle}
        coverSubtitle={coverSubtitle}
        authorName={authorName}
        albumDate={albumDate}
        closingMessage={closingMessage}
        orientation={orientation}
        pageStyle={pageStyle}
        theme={theme}
        font={font}
        onChangeTitle={setAlbumTitle}
        onChangeOrientation={setOrientation}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
