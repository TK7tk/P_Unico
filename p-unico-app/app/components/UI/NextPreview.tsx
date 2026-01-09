import React from 'react';
import { FallingPair } from '@/app/types/game';
import { PuyoCell } from '../Puyo/PuyoCell';

interface NextPreviewProps {
  nextPairs: FallingPair[];
}

export const NextPreview: React.FC<NextPreviewProps> = ({ nextPairs }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 text-center">NEXT</h2>
      <div className="space-y-4">
        {nextPairs.map((pair, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <PuyoCell color={pair.sub.color} />
            <PuyoCell color={pair.main.color} />
          </div>
        ))}
      </div>
    </div>
  );
};
