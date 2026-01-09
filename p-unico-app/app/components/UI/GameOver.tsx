import React from 'react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-red-500">GAME OVER</h1>
        <div>
          <p className="text-gray-400 mb-2">最終スコア</p>
          <p className="text-5xl font-bold text-yellow-400">{score}</p>
        </div>
        <button
          onClick={onRestart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          もう一度プレイ
        </button>
      </div>
    </div>
  );
};
