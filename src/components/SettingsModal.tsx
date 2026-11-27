import React from 'react';
import { X } from 'lucide-react';
import { PageStyle, PaperOrientation } from '../types/album';

interface SettingsModalProps {
  isOpen: boolean;
  albumTitle: string;
  orientation: PaperOrientation;
  pageStyle: PageStyle;
  onChangeTitle: (title: string) => void;
  onChangeOrientation: (orientation: PaperOrientation) => void;
  onChangePageStyle: (style: PageStyle) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  albumTitle,
  orientation,
  pageStyle,
  onChangeTitle,
  onChangeOrientation,
  onChangePageStyle,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 backdrop-blur-[2px] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
          <h2 id="settings-modal-title" className="font-editorial text-xl font-bold text-zinc-900">
            앨범 편집 설정
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Album Title */}
          <div>
            <label
              htmlFor="album-title-input"
              className="block text-xs font-medium text-zinc-600 mb-1.5"
            >
              앨범 제목
            </label>
            <input
              id="album-title-input"
              type="text"
              value={albumTitle}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="나의 사진 앨범"
              maxLength={60}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F6F5F1] border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Paper Orientation */}
          <div>
            <span className="block text-xs font-medium text-zinc-600 mb-2">
              페이지 방향
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F5F1] rounded-lg border border-zinc-200/70">
              <button
                type="button"
                onClick={() => onChangeOrientation('portrait')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  orientation === 'portrait'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                세로형 (A4 Portrait)
              </button>
              <button
                type="button"
                onClick={() => onChangeOrientation('landscape')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  orientation === 'landscape'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                가로형 (A4 Landscape)
              </button>
            </div>
          </div>

          {/* Page Style */}
          <div>
            <span className="block text-xs font-medium text-zinc-600 mb-2">
              사진 여백 스타일
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F5F1] rounded-lg border border-zinc-200/70">
              <button
                type="button"
                onClick={() => onChangePageStyle('classic')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  pageStyle === 'classic'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                깔끔한 여백
              </button>
              <button
                type="button"
                onClick={() => onChangePageStyle('framed')}
                className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  pageStyle === 'framed'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                전시 매트 프레임
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 pt-4 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            적용 완료
          </button>
        </div>
      </div>
    </div>
  );
};
