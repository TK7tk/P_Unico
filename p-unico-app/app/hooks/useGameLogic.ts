import { useState, useCallback } from 'react';
import {
  Board,
  GameState,
  GameStatus,
  PuyoColor,
  FallingPair,
  Direction,
  Position,
} from '../types/game';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  AVAILABLE_COLORS,
  NEXT_PREVIEW_COUNT,
  MATCH_COUNT,
  BASE_SCORE,
  CHAIN_MULTIPLIER,
} from '../constants/game';

// 空のボードを作成
const createEmptyBoard = (): Board => {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(PuyoColor.EMPTY));
};

// ランダムなぷよペアを生成
const generateRandomPair = (): FallingPair => {
  const randomColor = () =>
    AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)];

  return {
    main: {
      color: randomColor(),
      position: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
    },
    sub: {
      color: randomColor(),
      position: { x: Math.floor(BOARD_WIDTH / 2), y: 1 },
    },
    rotation: 0,
  };
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    fallingPair: null,
    nextPairs: Array(NEXT_PREVIEW_COUNT)
      .fill(null)
      .map(() => generateRandomPair()),
    score: 0,
    chain: 0,
    combo: 0,
    status: GameStatus.IDLE,
    level: 1,
  });

  // ゲームを開始
  const startGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      fallingPair: generateRandomPair(),
      nextPairs: Array(NEXT_PREVIEW_COUNT)
        .fill(null)
        .map(() => generateRandomPair()),
      score: 0,
      chain: 0,
      combo: 0,
      status: GameStatus.PLAYING,
      level: 1,
    });
  }, []);

  // ゲームを一時停止
  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status:
        prev.status === GameStatus.PLAYING
          ? GameStatus.PAUSED
          : GameStatus.PLAYING,
    }));
  }, []);

  // 衝突判定
  const checkCollision = useCallback(
    (board: Board, position: Position): boolean => {
      if (position.x < 0 || position.x >= BOARD_WIDTH) return true;
      if (position.y < 0 || position.y >= BOARD_HEIGHT) return true;
      return board[position.y][position.x] !== PuyoColor.EMPTY;
    },
    []
  );

  // ぷよを移動
  const movePair = useCallback(
    (direction: Direction) => {
      setGameState((prev) => {
        if (!prev.fallingPair || prev.status !== GameStatus.PLAYING)
          return prev;

        const { main, sub, rotation } = prev.fallingPair;
        let newMain = { ...main };
        let newSub = { ...sub };

        switch (direction) {
          case Direction.LEFT:
            newMain.position = { ...main.position, x: main.position.x - 1 };
            newSub.position = { ...sub.position, x: sub.position.x - 1 };
            break;
          case Direction.RIGHT:
            newMain.position = { ...main.position, x: main.position.x + 1 };
            newSub.position = { ...sub.position, x: sub.position.x + 1 };
            break;
          case Direction.DOWN:
            newMain.position = { ...main.position, y: main.position.y + 1 };
            newSub.position = { ...sub.position, y: sub.position.y + 1 };
            break;
        }

        // 衝突チェック
        if (
          checkCollision(prev.board, newMain.position) ||
          checkCollision(prev.board, newSub.position)
        ) {
          return prev;
        }

        return {
          ...prev,
          fallingPair: {
            main: newMain,
            sub: newSub,
            rotation,
          },
        };
      });
    },
    [checkCollision]
  );

  // ぷよを回転
  const rotatePair = useCallback(() => {
    setGameState((prev) => {
      if (!prev.fallingPair || prev.status !== GameStatus.PLAYING)
        return prev;

      const { main, sub, rotation } = prev.fallingPair;
      const newRotation = (rotation + 90) % 360;

      // 回転後の位置を計算
      let newSubPosition = { ...sub.position };
      switch (newRotation) {
        case 0: // 上
          newSubPosition = { x: main.position.x, y: main.position.y - 1 };
          break;
        case 90: // 右
          newSubPosition = { x: main.position.x + 1, y: main.position.y };
          break;
        case 180: // 下
          newSubPosition = { x: main.position.x, y: main.position.y + 1 };
          break;
        case 270: // 左
          newSubPosition = { x: main.position.x - 1, y: main.position.y };
          break;
      }

      // 衝突チェック
      if (checkCollision(prev.board, newSubPosition)) {
        return prev;
      }

      return {
        ...prev,
        fallingPair: {
          main,
          sub: { ...sub, position: newSubPosition },
          rotation: newRotation,
        },
      };
    });
  }, [checkCollision]);

  // ぷよを固定
  const lockPair = useCallback(() => {
    setGameState((prev) => {
      if (!prev.fallingPair) return prev;

      const newBoard = prev.board.map((row) => [...row]);
      const { main, sub } = prev.fallingPair;

      // ぷよをボードに配置
      newBoard[main.position.y][main.position.x] = main.color;
      newBoard[sub.position.y][sub.position.x] = sub.color;

      // ゲームオーバー判定
      if (main.position.y <= 1 || sub.position.y <= 1) {
        return {
          ...prev,
          board: newBoard,
          fallingPair: null,
          status: GameStatus.GAME_OVER,
        };
      }

      // 次のペアを生成
      const [nextPair, ...remainingPairs] = prev.nextPairs;
      const newNextPairs = [...remainingPairs, generateRandomPair()];

      return {
        ...prev,
        board: newBoard,
        fallingPair: nextPair,
        nextPairs: newNextPairs,
      };
    });
  }, []);

  // 重力を適用（ぷよを落下させる）
  const applyGravity = useCallback(() => {
    setGameState((prev) => {
      const newBoard = prev.board.map((row) => [...row]);
      let moved = false;

      // 下から上へスキャン
      for (let y = BOARD_HEIGHT - 2; y >= 0; y--) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (newBoard[y][x] !== PuyoColor.EMPTY) {
            // 下に空きスペースがあるか確認
            let newY = y;
            while (
              newY + 1 < BOARD_HEIGHT &&
              newBoard[newY + 1][x] === PuyoColor.EMPTY
            ) {
              newY++;
              moved = true;
            }

            if (newY !== y) {
              newBoard[newY][x] = newBoard[y][x];
              newBoard[y][x] = PuyoColor.EMPTY;
            }
          }
        }
      }

      return moved ? { ...prev, board: newBoard } : prev;
    });
  }, []);

  // マッチしたぷよを検出
  const findMatches = useCallback((board: Board): Position[] => {
    const visited = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(false));
    const matches: Position[] = [];

    const dfs = (x: number, y: number, color: PuyoColor): Position[] => {
      if (
        x < 0 ||
        x >= BOARD_WIDTH ||
        y < 0 ||
        y >= BOARD_HEIGHT ||
        visited[y][x] ||
        board[y][x] !== color ||
        color === PuyoColor.EMPTY
      ) {
        return [];
      }

      visited[y][x] = true;
      const group: Position[] = [{ x, y }];

      // 4方向を探索
      group.push(...dfs(x + 1, y, color));
      group.push(...dfs(x - 1, y, color));
      group.push(...dfs(x, y + 1, color));
      group.push(...dfs(x, y - 1, color));

      return group;
    };

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (!visited[y][x] && board[y][x] !== PuyoColor.EMPTY) {
          const group = dfs(x, y, board[y][x]);
          if (group.length >= MATCH_COUNT) {
            matches.push(...group);
          }
        }
      }
    }

    return matches;
  }, []);

  // マッチしたぷよを消去
  const clearMatches = useCallback(() => {
    setGameState((prev) => {
      const matches = findMatches(prev.board);

      if (matches.length === 0) {
        return { ...prev, chain: 0, combo: 0 };
      }

      const newBoard = prev.board.map((row) => [...row]);
      matches.forEach(({ x, y }) => {
        newBoard[y][x] = PuyoColor.EMPTY;
      });

      const newChain = prev.chain + 1;
      const newScore =
        prev.score + matches.length * BASE_SCORE * newChain * CHAIN_MULTIPLIER;

      return {
        ...prev,
        board: newBoard,
        chain: newChain,
        combo: prev.combo + 1,
        score: newScore,
      };
    });
  }, [findMatches]);

  // 重力とマッチング処理を連鎖的に実行
  const processChain = useCallback(() => {
    setGameState((prev) => {
      let currentBoard = prev.board.map((row) => [...row]);
      let totalChain = 0;
      let totalScore = prev.score;
      let hasChanges = true;

      // 重力処理を完全に適用
      while (hasChanges) {
        hasChanges = false;
        const tempBoard = currentBoard.map((row) => [...row]);

        // 下から上へスキャンして落下
        for (let y = BOARD_HEIGHT - 2; y >= 0; y--) {
          for (let x = 0; x < BOARD_WIDTH; x++) {
            if (tempBoard[y][x] !== PuyoColor.EMPTY) {
              let newY = y;
              while (
                newY + 1 < BOARD_HEIGHT &&
                tempBoard[newY + 1][x] === PuyoColor.EMPTY
              ) {
                newY++;
                hasChanges = true;
              }

              if (newY !== y) {
                tempBoard[newY][x] = tempBoard[y][x];
                tempBoard[y][x] = PuyoColor.EMPTY;
              }
            }
          }
        }

        currentBoard = tempBoard;
      }

      // マッチング処理を繰り返し実行
      let continueChain = true;
      while (continueChain) {
        const matches = findMatches(currentBoard);

        if (matches.length === 0) {
          continueChain = false;
          break;
        }

        // マッチしたぷよを消去
        matches.forEach(({ x, y }) => {
          currentBoard[y][x] = PuyoColor.EMPTY;
        });

        totalChain++;
        totalScore += matches.length * BASE_SCORE * totalChain * CHAIN_MULTIPLIER;

        // 再度重力を適用
        hasChanges = true;
        while (hasChanges) {
          hasChanges = false;
          const tempBoard = currentBoard.map((row) => [...row]);

          for (let y = BOARD_HEIGHT - 2; y >= 0; y--) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
              if (tempBoard[y][x] !== PuyoColor.EMPTY) {
                let newY = y;
                while (
                  newY + 1 < BOARD_HEIGHT &&
                  tempBoard[newY + 1][x] === PuyoColor.EMPTY
                ) {
                  newY++;
                  hasChanges = true;
                }

                if (newY !== y) {
                  tempBoard[newY][x] = tempBoard[y][x];
                  tempBoard[y][x] = PuyoColor.EMPTY;
                }
              }
            }
          }

          currentBoard = tempBoard;
        }
      }

      return {
        ...prev,
        board: currentBoard,
        chain: totalChain,
        combo: totalChain > 0 ? prev.combo + 1 : 0,
        score: totalScore,
      };
    });
  }, [findMatches]);

  return {
    gameState,
    startGame,
    pauseGame,
    movePair,
    rotatePair,
    lockPair,
    applyGravity,
    clearMatches,
    processChain,
  };
};
