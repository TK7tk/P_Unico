import { PuyoColor } from '../types/game';

// ボードサイズ
export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 12;

// セルサイズ（ピクセル）
export const CELL_SIZE = 48;

// 連鎖に必要なぷよの数
export const MATCH_COUNT = 4;

// ゲーム速度（ミリ秒）
export const INITIAL_DROP_SPEED = 1000;
export const MIN_DROP_SPEED = 100;
export const SPEED_INCREASE_PER_LEVEL = 50;

// スコアリング
export const BASE_SCORE = 10;
export const CHAIN_MULTIPLIER = 10;
export const COMBO_MULTIPLIER = 5;

// 色の定義
export const COLOR_MAP: Record<PuyoColor, string> = {
  [PuyoColor.EMPTY]: 'transparent',
  [PuyoColor.RED]: '#EF4444',
  [PuyoColor.BLUE]: '#3B82F6',
  [PuyoColor.GREEN]: '#10B981',
  [PuyoColor.YELLOW]: '#F59E0B',
  [PuyoColor.PURPLE]: '#A855F7',
};

// プレビュー数
export const NEXT_PREVIEW_COUNT = 2;

// 使用可能な色
export const AVAILABLE_COLORS = [
  PuyoColor.RED,
  PuyoColor.BLUE,
  PuyoColor.GREEN,
  PuyoColor.YELLOW,
  PuyoColor.PURPLE,
];
