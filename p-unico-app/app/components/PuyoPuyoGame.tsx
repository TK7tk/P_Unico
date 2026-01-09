'use client';

import React, { useCallback } from 'react';
import { GameBoard } from './GameBoard/GameBoard';
import { ScoreBoard } from './UI/ScoreBoard';
import { NextPreview } from './UI/NextPreview';
import { ControlPanel } from './Controls/ControlPanel';
import { GameOver } from './UI/GameOver';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { Direction, GameStatus } from '../types/game';

export const PuyoPuyoGame: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    movePair,
    rotatePair,
    lockPair,
    processChain,
  } = useGameLogic();

  // ゲームループ処理
  const handleTick = useCallback(() => {
    if (!gameState.fallingPair) return;

    // 下に移動を試みる
    const canMoveDown = () => {
      if (!gameState.fallingPair) return false;

      const { main, sub } = gameState.fallingPair;
      const newMainY = main.position.y + 1;
      const newSubY = sub.position.y + 1;

      // 範囲チェック
      if (newMainY >= 12 || newSubY >= 12) return false;

      // 衝突チェック
      if (
        gameState.board[newMainY][main.position.x] !== 0 ||
        gameState.board[newSubY][sub.position.x] !== 0
      ) {
        return false;
      }

      return true;
    };

    if (canMoveDown()) {
      movePair(Direction.DOWN);
    } else {
      // 固定して連鎖処理を実行
      lockPair();
      setTimeout(() => {
        processChain();
      }, 100);
    }
  }, [gameState, movePair, lockPair, processChain]);

  // ゲームループ
  useGameLoop({
    status: gameState.status,
    onTick: handleTick,
  });

  // キーボード操作
  useKeyboardControls({
    onMoveLeft: () => movePair(Direction.LEFT),
    onMoveRight: () => movePair(Direction.RIGHT),
    onMoveDown: () => movePair(Direction.DOWN),
    onRotate: rotatePair,
    onPause: pauseGame,
    enabled: gameState.status === GameStatus.PLAYING,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-8">
      <div className="flex gap-8 items-start">
        {/* 左側: スコアとコントロール */}
        <div className="flex flex-col gap-6">
          <ScoreBoard
            score={gameState.score}
            chain={gameState.chain}
            combo={gameState.combo}
            level={gameState.level}
          />
          <ControlPanel
            status={gameState.status}
            onStart={startGame}
            onPause={pauseGame}
          />
        </div>

        {/* 中央: ゲームボード */}
        <div>
          <h1 className="text-4xl font-bold text-white text-center mb-6">
            ぷよぷよゲーム
          </h1>
          <GameBoard board={gameState.board} fallingPair={gameState.fallingPair} />
        </div>

        {/* 右側: NEXTプレビュー */}
        <NextPreview nextPairs={gameState.nextPairs} />
      </div>

      {/* ゲームオーバー画面 */}
      {gameState.status === GameStatus.GAME_OVER && (
        <GameOver score={gameState.score} onRestart={startGame} />
      )}
    </div>
  );
};
