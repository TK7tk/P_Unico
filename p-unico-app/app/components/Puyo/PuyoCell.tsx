import React from 'react';
import { PuyoColor } from '@/app/types/game';
import { COLOR_MAP, CELL_SIZE } from '@/app/constants/game';

interface PuyoCellProps {
  color: PuyoColor;
  isFalling?: boolean;
}

export const PuyoCell: React.FC<PuyoCellProps> = ({
  color,
  isFalling = false,
}) => {
  if (color === PuyoColor.EMPTY) {
    return (
      <div
        className="border border-gray-700 bg-gray-900"
        style={{
          width: `${CELL_SIZE}px`,
          height: `${CELL_SIZE}px`,
        }}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full border-2 border-white/30
        flex items-center justify-center
        shadow-lg
        transition-all duration-150
        ${isFalling ? 'animate-pulse' : ''}
      `}
      style={{
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        backgroundColor: COLOR_MAP[color],
        boxShadow: `0 0 10px ${COLOR_MAP[color]}40`,
      }}
    >
      {/* 内側のハイライト */}
      <div
        className="rounded-full bg-white/30"
        style={{
          width: `${CELL_SIZE * 0.4}px`,
          height: `${CELL_SIZE * 0.4}px`,
        }}
      />
    </div>
  );
};
