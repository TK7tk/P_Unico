import React from 'react';
import { GameStatus } from '@/app/types/game';

interface ControlPanelProps {
  status: GameStatus;
  onStart: () => void;
  onPause: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  onStart,
  onPause,
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl space-y-4">
      <h2 className="text-xl font-bold text-white mb-4 text-center">操作</h2>

      <div className="space-y-2">
        {status === GameStatus.IDLE && (
          <button
            onClick={onStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ゲーム開始
          </button>
        )}

        {status === GameStatus.PLAYING && (
          <button
            onClick={onPause}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            一時停止
          </button>
        )}

        {status === GameStatus.PAUSED && (
          <button
            onClick={onPause}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            再開
          </button>
        )}
      </div>

      <div className="text-sm text-gray-400 space-y-1 mt-6">
        <p className="font-bold text-white mb-2">キーボード操作:</p>
        <p>← → : 左右移動</p>
        <p>↑ / Space : 回転</p>
        <p>↓ : 高速落下</p>
        <p>P : 一時停止</p>
      </div>
    </div>
  );
};
