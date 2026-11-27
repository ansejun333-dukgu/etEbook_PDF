import React from 'react';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { AlbumPhoto } from '../types/album';

interface FilmstripBarProps {
  photos: AlbumPhoto[];
  albumTitle: string;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onMovePhoto: (fromIndex: number, toIndex: number) => void;
  onDeletePhoto: (id: string) => void;
  onUploadClick: () => void;
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export const FilmstripBar: React.FC<FilmstripBarProps> = ({
  photos,
  albumTitle,
  currentIndex,
  onSelectIndex,
  onMovePhoto,
  onDeletePhoto,
  onUploadClick,
}) => {
  if (photos.length === 0) {
    return null;
  }

  const isCoverActive = currentIndex === 0;
  const isClosingActive = currentIndex === photos.length + 1;

  return (
    <div className="border-t border-zinc-200/80 bg-white/75 backdrop-blur-sm">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center gap-3 overflow-x-auto filmstrip-scroll pb-1">
          {/* Cover Page Tile (Index 0) */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectIndex(0)}
              aria-label="표지 페이지"
              aria-current={isCoverActive ? 'page' : undefined}
              className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-md bg-white border border-zinc-200 px-1.5 flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                isCoverActive
                  ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-[#F6F5F1]'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <span className="font-editorial text-[11px] font-bold text-zinc-900 line-clamp-2 leading-tight">
                {albumTitle || '표지'}
              </span>
            </button>
            <span
              className={`text-[11px] font-medium ${
                isCoverActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
              }`}
            >
              표지
            </span>
          </div>

          {/* Photo Pages (Indices 1..N) */}
          {photos.map((item, idx) => {
            const pageIdx = idx + 1;
            const isActive = pageIdx === currentIndex;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col items-center gap-1.5 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => onSelectIndex(pageIdx)}
                  aria-label={`${idx + 1}번 사진: ${item.title || '제목 없음'}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-md overflow-hidden bg-zinc-100 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                    isActive
                      ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-[#F6F5F1]'
                      : 'opacity-70 hover:opacity-100 border border-zinc-200'
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.title || `페이지 ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Compact hover/active reorder & delete actions */}
                <div
                  className={`flex items-center gap-1 text-[11px] font-mono tabular-nums transition-opacity ${
                    isActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  {isActive && idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, idx - 1)}
                      title="앞으로 이동"
                      aria-label="앞으로 이동"
                      className="p-0.5 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  <span>{padTwo(idx + 1)}</span>
                  {isActive && idx < photos.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onMovePhoto(idx, idx + 1)}
                      title="뒤로 이동"
                      aria-label="뒤로 이동"
                      className="p-0.5 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Quick remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePhoto(item.id);
                  }}
                  title="삭제"
                  aria-label={`${idx + 1}번 사진 삭제`}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-sm hover:bg-[#C83E2B] transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Closing Page Tile (Index N + 1) */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectIndex(photos.length + 1)}
              aria-label="마무리 페이지"
              aria-current={isClosingActive ? 'page' : undefined}
              className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-md bg-white border border-zinc-200 px-1.5 flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                isClosingActive
                  ? 'ring-2 ring-zinc-900 ring-offset-2 ring-offset-[#F6F5F1]'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <span className="font-editorial text-[11px] text-zinc-600 leading-tight">
                마무리
              </span>
            </button>
            <span
              className={`text-[11px] font-medium ${
                isClosingActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
              }`}
            >
              끝
            </span>
          </div>

          {/* Add more photos tile */}
          <button
            type="button"
            onClick={onUploadClick}
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] mb-5 rounded-md border border-dashed border-zinc-300 bg-[#F6F5F1] hover:border-zinc-500 hover:bg-zinc-200/50 text-zinc-600 flex flex-col items-center justify-center gap-1 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[11px] font-medium whitespace-nowrap">사진 추가</span>
          </button>
        </div>
      </div>
    </div>
  );
};
