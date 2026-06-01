import { Chess } from 'chess.js';

/**
 * Quantum Chess AI Engine
 * Uses minimax with alpha-beta pruning.
 * Difficulty levels control search depth and evaluation noise.
 */

// Piece values (centipawns)
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables for positional evaluation
const PST_PAWN = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const PST_QUEEN = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const PST_KING_MID = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

const PST = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING_MID,
};

/**
 * Difficulty presets:
 *  - easy:   depth 1, 30% random noise
 *  - medium: depth 2, 10% noise
 *  - hard:   depth 3, no noise
 */
export const DIFFICULTY = {
  easy:   { depth: 1, noise: 0.30, name: 'Easy' },
  medium: { depth: 2, noise: 0.10, name: 'Medium' },
  hard:   { depth: 3, noise: 0.00, name: 'Hard' },
};

/**
 * Evaluate the board from the perspective of the given color.
 */
function evaluate(chess) {
  const board = chess.board();
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const pstIndex = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;
      const pstVal = (PST[piece.type] || [])[pstIndex] || 0;

      if (piece.color === 'w') {
        score += val + pstVal;
      } else {
        score -= val + pstVal;
      }
    }
  }

  // Mobility bonus
  const moves = chess.moves().length;
  const turn = chess.turn();
  score += (turn === 'w' ? 1 : -1) * moves * 2;

  return score;
}

/**
 * Minimax with alpha-beta pruning.
 */
function minimax(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0) return evaluate(chess);

  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return isMaximizing ? -99999 : 99999;
    return 0; // draw/stalemate
  }

  const moves = chess.moves({ verbose: true });

  // Move ordering: captures first, then checks
  moves.sort((a, b) => {
    const scoreA = (a.captured ? PIECE_VALUES[a.captured] * 10 : 0) + (a.san.includes('+') ? 50 : 0);
    const scoreB = (b.captured ? PIECE_VALUES[b.captured] * 10 : 0) + (b.san.includes('+') ? 50 : 0);
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const eval_ = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const eval_ = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Find the best move for the AI.
 * @param {string} fen - Current board FEN
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {{ from: string, to: string, promotion?: string } | null}
 */
export function findBestMove(fen, difficulty = 'medium') {
  const chess = new Chess(fen);
  const config = DIFFICULTY[difficulty] || DIFFICULTY.medium;
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return null;

  const isMaximizing = chess.turn() === 'w';
  let bestMove = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    let score = minimax(chess, config.depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    // Add noise for lower difficulties
    if (config.noise > 0) {
      score += (Math.random() - 0.5) * 2 * config.noise * 500;
    }

    if (isMaximizing) {
      if (score > bestScore) { bestScore = score; bestMove = move; }
    } else {
      if (score < bestScore) { bestScore = score; bestMove = move; }
    }
  }

  return bestMove ? { from: bestMove.from, to: bestMove.to, promotion: 'q' } : null;
}

/**
 * Check if the AI should make a quantum move (superposition/wormhole awareness).
 * For now, AI doesn't use quantum mechanics — just standard chess moves.
 * This can be expanded later.
 */
export function shouldAIUseSuperposition() {
  return false; // AI plays standard for v1 — quantum moves are player-only
}
