import { AlbumPhoto } from '../types/album';

export const SAMPLE_ALBUM_TITLE = '조용한 오후의 기록';
export const SAMPLE_COVER_SUBTITLE = '빛과 그림자가 머문 계절의 조각들';
export const SAMPLE_AUTHOR_NAME = '홍길동';
export const SAMPLE_ALBUM_DATE = '2026. 11. 26';
export const SAMPLE_CLOSING_MESSAGE =
  '잠시 멈춰 서서 바라본 빛과 풍경들이 오래도록 따뜻한 기억으로 남기를 바랍니다.';

export const SAMPLE_PHOTOS: AlbumPhoto[] = [
  {
    id: 'sample-1',
    src: '/src/assets/images/sample_morning_window_1795745865924.jpg',
    title: '창가의 아침 빛',
    description:
      '리넨 커튼 사이로 번져 들어온 오전의 햇살이 원목 테이블 위에 고요한 그림자를 남겼습니다.',
    fileName: 'morning_window.jpg',
    isSample: true,
    createdAt: 1,
  },
  {
    id: 'sample-2',
    src: '/src/assets/images/sample_coastal_mist_1795745867536.jpg',
    title: '안개 낀 새벽 해안',
    description:
      '수평선과 하늘의 경계가 흐려진 새벽녘, 잔잔한 물결 위로 검은 현무암 바위들이 모습을 드러냅니다.',
    fileName: 'coastal_mist.jpg',
    isSample: true,
    createdAt: 2,
  },
  {
    id: 'sample-3',
    src: '/src/assets/images/sample_botanical_shadow_1795745866716.jpg',
    title: '유칼립투스와 오후의 그림자',
    description:
      '거친 트래버틴 돌판 위에 놓인 토기 화병과 마른 잎사귀가 벽면에 긴 실루엣을 그리는 시간.',
    fileName: 'botanical_shadow.jpg',
    isSample: true,
    createdAt: 3,
  },
];
