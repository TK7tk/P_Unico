import React from 'react';
import { Board, FallingPair, PuyoColor } from '@/app/types/game';
import { PuyoCell } from '../Puyo/PuyoCell';
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } from '@/app/constants/game';

interface GameBoardProps {
  board: Board;
  fallingPair: FallingPair | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, fallingPair }) => {
  // ボード全体の表示を準備（固定されたぷよ + 落下中のぷよ）
  const displayBoard: PuyoColor[][] = board.map((row) => [...row]);

  // 落下中のぷよを表示用ボードに追加
  if (fallingPair) {
    const { main, sub } = fallingPair;
    if (
      main.position.y >= 0 &&
      main.position.y < BOARD_HEIGHT &&
      main.position.x >= 0 &&
      main.position.x < BOARD_WIDTH
    ) {
      displayBoard[main.position.y][main.position.x] = main.color;
    }
    if (
      sub.position.y >= 0 &&
      sub.position.y < BOARD_HEIGHT &&
      sub.position.x >= 0 &&
      sub.position.x < BOARD_WIDTH
    ) {
      displayBoard[sub.position.y][sub.position.x] = sub.color;
    }
  }

  return (
    <div
      className="inline-block bg-gray-800 p-2 rounded-lg shadow-2xl"
      style={{
        width: `${BOARD_WIDTH * CELL_SIZE + 16}px`,
      }}
    >
      <div className="grid gap-0.5">
        {displayBoard.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((color, x) => {
              const isFalling =
                fallingPair &&
                ((fallingPair.main.position.x === x &&
                  fallingPair.main.position.y === y) ||
                  (fallingPair.sub.position.x === x &&
                    fallingPair.sub.position.y === y));

              return (
                <PuyoCell
                  key={`${x}-${y}`}
                  color={color}
                  isFalling={!!isFalling}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
