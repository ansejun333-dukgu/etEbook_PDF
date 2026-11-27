export interface AlbumPhoto {
  id: string;
  src: string;
  title: string;
  description: string;
  fileName?: string;
  width?: number;
  height?: number;
  isSample?: boolean;
  createdAt: number;
}

export type PaperOrientation = 'portrait' | 'landscape';

export type PageStyle = 'classic' | 'framed';

export type AlbumTheme = 'white' | 'beige' | 'navy';

export type AlbumFont = 'gothic' | 'myeongjo' | 'handwriting';

export type ViewMode = 'single' | 'overview';

export interface AlbumState {
  albumTitle: string;
  coverSubtitle?: string;
  authorName?: string;
  albumDate?: string;
  closingMessage?: string;
  photos: AlbumPhoto[];
  orientation: PaperOrientation;
  pageStyle: PageStyle;
  theme?: AlbumTheme;
  font?: AlbumFont;
  isUsingSamples: boolean;
}

export interface PdfExportOptions {
  albumTitle: string;
  coverSubtitle: string;
  authorName: string;
  albumDate: string;
  closingMessage: string;
  orientation: PaperOrientation;
  pageStyle: PageStyle;
  theme: AlbumTheme;
  font: AlbumFont;
  includeCover: boolean;
  includeClosing: boolean;
  showPageNumbers: boolean;
}
