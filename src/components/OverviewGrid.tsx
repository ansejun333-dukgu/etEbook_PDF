import React from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react';
import { AlbumFont, AlbumPhoto } from '../types/album';

interface OverviewGridProps {
  photos: AlbumPhoto[];
  albumTitle: string;
  coverSubtitle: string;
  authorName: string;
  albumDate: string;
  closingMessage: string;
  font: AlbumFont;
  currentIndex: number;
  onSelectPage: (index: number) => void;
  onMovePhoto: (fromIndex: number, toIndex: number) => void;
  onDeletePhoto: (id: string) => void;
  onUpdatePhoto: (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => void;
  onUploadClick: () => void;
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export const OverviewGrid: React.FC<OverviewGridProps> = ({
  photos,
  albumTitle,
  coverSubtitle,
  authorName,
  albumDate,
  closingMessage,
  font,
  currentIndex,
  onSelectPage,
  onMovePhoto,
  onDeletePhoto,
  onUpdatePhoto,
  onUploadClick,
}) => {
  const fontClass =
    font === 'gothic'
      ? 'font-album-gothic'
      : font === 'handwriting'
        ? 'font-album-handwriting'
        : 'font-album-myeongjo';
  return (
    <section className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 mb-8">
        <div>
          <p className="text-xs text-zinc-500 mb-1.5">
            전체 페이지 구성 · 표지 + 사진 {photos.length}장 + 마무리
          </p>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900">
            {albumTitle || '나의 사진 앨범'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onUploadClick}
          className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          사진 더 올리기
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Cover Page Card */}
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectPage(0)}
            className={`text-left bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between p-5 min-h-[260px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              currentIndex === 0
                ? 'border-zinc-900 shadow-[0_10px_30px_-12px_rgba(24,24,27,0.14)]'
                : 'border-zinc-200/90 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>첫 쪽 · 표지</span>
              <span className="text-zinc-600 underline underline-offset-4">편집</span>
            </div>
            <div className="my-auto py-4 text-center">
              <p className={`${fontClass} text-xl font-bold text-zinc-900 line-clamp-2`}>
                {albumTitle || '나의 사진 앨범'}
              </p>
              {coverSubtitle && (
                <p className={`mt-1.5 ${fontClass} text-xs text-zinc-500 line-clamp-2`}>
                  {coverSubtitle}
                </p>
              )}
            </div>
            <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-500 text-center">
              {[authorName.trim(), albumDate.trim()].filter(Boolean).join(' · ') || '이름 · 날짜 입력'}
            </div>
          </button>
        )}

        {/* Photo Page Cards */}
        {photos.map((item, idx) => {
          const pageIndex = idx + 1;
          const isCurrent = pageIndex === currentIndex;
          return (
            <div
              key={item.id}
              className={`group bg-white rounded-xl border transition-all duration-150 flex flex-col overflow-hidden ${
                isCurrent
                  ? 'border-zinc-900 shadow-[0_10px_30px_-12px_rgba(24,24,27,0.14)]'
                  : 'border-zinc-200/90 hover:border-zinc-300 shadow-sm'
              }`}
            >
              {/* Thumbnail click opens single page */}
              <button
                type="button"
                onClick={() => onSelectPage(pageIndex)}
                className="relative aspect-[4/3] w-full bg-[#F7F6F2] overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900"
              >
                <img
                  src={item.src}
                  alt={item.title || `페이지 ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </button>

              <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-zinc-400">
                    <span className="font-mono tabular-nums text-zinc-600">
                      {padTwo(idx + 1)} 쪽
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectPage(pageIndex)}
                      className="text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer whitespace-nowrap"
                    >
                      이 쪽 편집
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => onUpdatePhoto(item.id, { title: e.target.value })}
                    placeholder="제목 없음"
                    maxLength={80}
                    className={`w-full ${fontClass} text-base font-bold text-zinc-900 placeholder:text-zinc-300 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none pb-0.5`}
                  />
                  <p className={`mt-1 ${fontClass} text-xs text-zinc-500 line-clamp-2 min-h-[2rem]`}>
                    {item.description || '설명을 입력하려면 클릭해 페이지를 열어보세요.'}
                  </p>
                </div>

                {/* Reorder & delete footer */}
                <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, idx - 1)}
                      disabled={idx === 0}
                      title="앞으로 이동"
                      aria-label="앞으로 이동"
                      className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, idx + 1)}
                      disabled={idx === photos.length - 1}
                      title="뒤로 이동"
                      aria-label="뒤로 이동"
                      className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePhoto(item.id)}
                    title="페이지 삭제"
                    aria-label="페이지 삭제"
                    className="p-1.5 rounded-md text-zinc-400 hover:text-[#C83E2B] hover:bg-red-50/60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Closing Page Card */}
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectPage(photos.length + 1)}
            className={`text-left bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between p-5 min-h-[260px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              currentIndex === photos.length + 1
                ? 'border-zinc-900 shadow-[0_10px_30px_-12px_rgba(24,24,27,0.14)]'
                : 'border-zinc-200/90 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>마지막 쪽 · 마무리</span>
              <span className="text-zinc-600 underline underline-offset-4">편집</span>
            </div>
            <div className="my-auto py-4 text-center">
              <p className={`${fontClass} text-sm text-zinc-700 line-clamp-4 leading-relaxed`}>
                {closingMessage || '마무리 문구를 적어보세요...'}
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-400 text-center">
              마무리 인사
            </div>
          </button>
        )}

        {/* Add photo card */}
        <button
          type="button"
          onClick={onUploadClick}
          className="min-h-[260px] rounded-xl border border-dashed border-zinc-300 bg-white/50 hover:bg-white hover:border-zinc-500 transition-all flex flex-col items-center justify-center gap-2.5 text-zinc-600 p-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <div className="w-10 h-10 rounded-lg bg-[#F6F5F1] border border-zinc-200 flex items-center justify-center">
            <ImagePlus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-zinc-800">사진 추가하기</span>
          <span className="text-xs text-zinc-400">여러 장을 동시에 선택할 수 있습니다</span>
        </button>
      </div>
    </section>
  );
};
