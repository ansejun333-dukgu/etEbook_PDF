import React from 'react';
import { ViewMode } from '../types/album';

interface TopBarProps {
  viewMode: ViewMode;
  photoCount: number;
  onUploadClick: () => void;
  onToggleViewMode: (mode: ViewMode) => void;
  onOpenSettings: () => void;
  onClearAlbum: () => void;
  onOpenPdfModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  viewMode,
  photoCount,
  onUploadClick,
  onToggleViewMode,
  onOpenSettings,
  onClearAlbum,
  onOpenPdfModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F5F1]/90 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onToggleViewMode('single');
          }}
          className="font-editorial text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded-sm"
        >
          모노그래프
        </a>

        {/* Zone 2: Clean single-line text links */}
        <nav
          aria-label="앨범 작업 메뉴"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <button
            type="button"
            onClick={onUploadClick}
            className="hover:text-zinc-950 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            사진 올리기
          </button>

          <button
            type="button"
            onClick={() => onToggleViewMode(viewMode === 'single' ? 'overview' : 'single')}
            className={`transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              viewMode === 'overview'
                ? 'text-zinc-950 border-zinc-900 font-semibold'
                : 'border-transparent hover:text-zinc-950 hover:border-zinc-900'
            }`}
          >
            {viewMode === 'overview' ? '한 장씩 보기' : '전체 페이지'}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="hover:text-zinc-950 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            편집 설정
          </button>

          <button
            type="button"
            onClick={onClearAlbum}
            disabled={photoCount === 0}
            className="hover:text-zinc-950 disabled:text-zinc-300 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer py-1 border-b border-transparent hover:border-zinc-900 disabled:hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            비우기
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPdfModal}
            disabled={photoCount === 0}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 active:scale-[0.98] disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900"
          >
            PDF 저장
          </button>
        </div>
      </div>
    </header>
  );
};
