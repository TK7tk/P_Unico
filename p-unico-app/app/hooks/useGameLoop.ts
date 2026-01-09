import { useEffect, useRef } from 'react';
import { GameStatus } from '../types/game';
import { INITIAL_DROP_SPEED } from '../constants/game';

interface UseGameLoopProps {
  status: GameStatus;
  onTick: () => void;
  speed?: number;
}

export const useGameLoop = ({
  status,
  onTick,
  speed = INITIAL_DROP_SPEED,
}: UseGameLoopProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      intervalRef.current = setInterval(() => {
        onTick();
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, onTick, speed]);
};
