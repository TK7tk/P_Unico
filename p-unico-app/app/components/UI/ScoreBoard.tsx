import React from 'react';

interface ScoreBoardProps {
  score: number;
  chain: number;
  combo: number;
  level: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  chain,
  combo,
  level,
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">スコア</h2>
        <p className="text-4xl font-bold text-yellow-400">{score}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-400">レベル</p>
          <p className="text-2xl font-bold text-blue-400">{level}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">連鎖</p>
          <p className="text-2xl font-bold text-green-400">{chain}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">コンボ</p>
          <p className="text-2xl font-bold text-purple-400">{combo}</p>
        </div>
      </div>
    </div>
  );
};
