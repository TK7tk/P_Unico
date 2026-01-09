// ぷよの色
export enum PuyoColor {
  EMPTY = 0,
  RED = 1,
  BLUE = 2,
  GREEN = 3,
  YELLOW = 4,
  PURPLE = 5,
}

// ゲーム状態
export enum GameStatus {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

// ぷよの位置
export interface Position {
  x: number;
  y: number;
}

// 個別のぷよ
export interface Puyo {
  color: PuyoColor;
  position: Position;
}

// 落下中のぷよペア
export interface FallingPair {
  main: Puyo;
  sub: Puyo;
  rotation: number; // 0, 90, 180, 270度
}

// ゲームボードの状態
export type Board = PuyoColor[][];

// ゲーム状態
export interface GameState {
  board: Board;
  fallingPair: FallingPair | null;
  nextPairs: FallingPair[];
  score: number;
  chain: number;
  combo: number;
  status: GameStatus;
  level: number;
}

// 移動方向
export enum Direction {
  LEFT = 'left',
  RIGHT = 'right',
  DOWN = 'down',
}
