import { useState, useEffect } from 'react';

const BOARD_SIZE = 6;
const EMPTY = null;
const SYMBOLS = ['X', 'O'];

const getAllLines = (len) => {
  const lines = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c + len - 1 < BOARD_SIZE) lines.push(Array.from({length: len}, (_, i) => [r, c + i]));
      if (r + len - 1 < BOARD_SIZE) lines.push(Array.from({length: len}, (_, i) => [r + i, c]));
      if (r + len - 1 < BOARD_SIZE && c + len - 1 < BOARD_SIZE) lines.push(Array.from({length: len}, (_, i) => [r + i, c + i]));
      if (r + len - 1 < BOARD_SIZE && c - len + 1 >= 0) lines.push(Array.from({length: len}, (_, i) => [r + i, c - i]));
    }
  }
  return lines;
};

const LINES_5 = getAllLines(5);
const LINES_4 = getAllLines(4);

const evaluateBoardState = (board) => {
  let orderAchieved5 = false;
  let straight4Count = 0;

  for (const line of LINES_5) {
    const vals = line.map(([r, c]) => board[r][c]);
    if (vals[0] && vals.every(v => v === vals[0])) { orderAchieved5 = true; break; }
  }
  for (const line of LINES_4) {
    const vals = line.map(([r, c]) => board[r][c]);
    if (vals[0] && vals.every(v => v === vals[0])) straight4Count++;
  }

  const isFull = board.every(r => r.every(c => c !== EMPTY));
  return { orderAchieved5, isFull, straight4Count };
};

const heuristicScore = (board) => {
  let score = 0;
  for (const line of LINES_5) {
    const vals = line.map(([r, c]) => board[r][c]);
    let x = 0, o = 0;
    vals.forEach(v => { if (v === 'X') x++; else if (v === 'O') o++; });
    if (x > 0 && o > 0) continue; 
    
    if (x + o === 2) score += 10;
    if (x + o === 3) score += 100;
    if (x + o === 4) score += 1000;
  }
  return score;
};

const minimax = (board, depth, alpha, beta, isMaximizing) => {
  const { orderAchieved5, isFull } = evaluateBoardState(board);
  if (orderAchieved5) return isMaximizing ? 10000 + depth : -10000 - depth;
  if (isFull) return isMaximizing ? -10000 : 10000; 
  if (depth === 0) return heuristicScore(board);

  let bestEval = isMaximizing ? -Infinity : Infinity;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY) continue;
      
      for (const sym of SYMBOLS) {
        board[r][c] = sym; 
        const evalScore = minimax(board, depth - 1, alpha, beta, !isMaximizing);
        board[r][c] = EMPTY; 
        
        if (isMaximizing) {
          bestEval = Math.max(bestEval, evalScore);
          alpha = Math.max(alpha, evalScore);
        } else {
          bestEval = Math.min(bestEval, evalScore);
          beta = Math.min(beta, evalScore);
        }
        if (beta <= alpha) return bestEval; 
      }
    }
  }
  return bestEval;
};

const getBestMove = (board, isMaximizing, depth = 3) => {
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let move = null;
  const tempBoard = board.map(r => [...r]);
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (tempBoard[r][c] !== EMPTY) continue;
      for (const sym of SYMBOLS) {
        tempBoard[r][c] = sym;
        const score = minimax(tempBoard, depth - 1, -Infinity, Infinity, !isMaximizing);
        tempBoard[r][c] = EMPTY;
        
        if (isMaximizing && score > bestScore) {
          bestScore = score; move = { row: r, col: c, symbol: sym };
        } else if (!isMaximizing && score < bestScore) {
          bestScore = score; move = { row: r, col: c, symbol: sym };
        }
      }
    }
  }
  return move || { row: 2, col: 2, symbol: 'X' };
};

const newBoard = () => Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));

export function useGameState() {
  const [board, setBoard] = useState(newBoard());
  const [round, setRound] = useState(1);
  const [moveCount, setMoveCount] = useState(0);
  const [round1Stats, setRound1Stats] = useState(null);
  const [winner, setWinner] = useState(null);

  const isHumanTurn = round === 1 ? (moveCount % 2 === 0) : (moveCount % 2 !== 0);

  const applyMove = (r, c, sym) => {
    if (winner || (round === 1 && round1Stats) || board[r][c]) return;
    const nextBoard = board.map(row => [...row]);
    nextBoard[r][c] = sym;
    setBoard(nextBoard);
    setMoveCount(m => m + 1);

    const { orderAchieved5, isFull, straight4Count } = evaluateBoardState(nextBoard);
    
    if (orderAchieved5 || isFull) {
      const stats = { orderWon: orderAchieved5, moves: moveCount + 1, straight4s: straight4Count };
      if (round === 1) setRound1Stats(stats);
      else {
        const r1 = round1Stats, r2 = stats;
        let w = "Draw";
        if (r1.orderWon) {
          if (r2.orderWon && r2.moves < r1.moves) w = "AI";
          else if (r2.orderWon && r2.moves === r1.moves) {
            if (r2.straight4s > r1.straight4s) w = "AI";
            else if (r1.straight4s > r2.straight4s) w = "Player 1";
          } else {
            w = "Player 1";
          }
        } else {
          if (r2.orderWon) w = "AI";
          else {
            if (r2.straight4s > r1.straight4s) w = "AI";
            else if (r1.straight4s > r2.straight4s) w = "Player 1";
          }
        }
        setWinner(w);
      }
    }
  };

  useEffect(() => {
    if (winner || (round === 1 && round1Stats) || isHumanTurn) return;
    const timer = setTimeout(() => {
      const bestMove = getBestMove(board, round === 2, 3);
      if (bestMove) applyMove(bestMove.row, bestMove.col, bestMove.symbol);
    }, 50);
    return () => clearTimeout(timer);
  }, [board, round, moveCount, winner, round1Stats, isHumanTurn]);

  return {
    board, round, moveCount, round1Stats, overallWinner: winner, isHumanTurn, applyMove,
    startRound2: () => { setBoard(newBoard()); setMoveCount(0); setRound(2); },
    resetGame: () => { setBoard(newBoard()); setMoveCount(0); setRound(1); setRound1Stats(null); setWinner(null); }
  };
}