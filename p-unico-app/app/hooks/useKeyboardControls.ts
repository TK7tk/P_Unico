import { useEffect, useCallback } from 'react';
import { Direction } from '../types/game';

interface UseKeyboardControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onPause: () => void;
  enabled: boolean;
}

export const useKeyboardControls = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onPause,
  enabled,
}: UseKeyboardControlsProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          onMoveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          onMoveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          onMoveDown();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          event.preventDefault();
          onRotate();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          onPause();
          break;
      }
    },
    [enabled, onMoveLeft, onMoveRight, onMoveDown, onRotate, onPause]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
