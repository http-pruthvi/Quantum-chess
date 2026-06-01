import { Chess } from 'chess.js';

/**
 * Creates a new chess.js instance from an optional FEN string.
 */
export function createChessInstance(fen) {
  return fen ? new Chess(fen) : new Chess();
}

/**
 * Get all legal moves for a piece at a given square.
 * Returns array of target square strings, e.g. ['e4', 'e3']
 */
export function getLegalMoves(chess, square) {
  const moves = chess.moves({ square, verbose: true });
  return moves.map((m) => m.to);
}

/**
 * Make a move on the chess instance. Returns the move object if successful, null otherwise.
 */
export function makeChessMove(chess, from, to, promotion = 'q') {
  try {
    const move = chess.move({ from, to, promotion });
    return move;
  } catch {
    return null;
  }
}

/**
 * Get piece at a given square. Returns { type, color } or null.
 */
export function getPieceAt(chess, square) {
  return chess.get(square);
}

/**
 * Get current board state as a 2D array.
 */
export function getBoardState(chess) {
  return chess.board();
}

/**
 * Check game status.
 */
export function getGameStatus(chess) {
  if (chess.isCheckmate()) return 'checkmate';
  if (chess.isStalemate()) return 'stalemate';
  if (chess.isDraw()) return 'draw';
  if (chess.isCheck()) return 'check';
  return 'playing';
}

/**
 * Get the current turn ('w' or 'b').
 */
export function getCurrentTurn(chess) {
  return chess.turn();
}

/**
 * Get FEN string from the chess instance.
 */
export function getFen(chess) {
  return chess.fen();
}

/**
 * Load a FEN string into a chess instance.
 */
export function loadFen(chess, fen) {
  chess.load(fen);
}

/**
 * Get move history.
 */
export function getMoveHistory(chess) {
  return chess.history({ verbose: true });
}

/**
 * Undo the last move.
 */
export function undoMove(chess) {
  return chess.undo();
}

/**
 * Convert algebraic square (e.g. 'e4') to board coordinates (col, row) 0-indexed.
 */
export function squareToCoords(square) {
  const col = square.charCodeAt(0) - 97; // 'a' = 0
  const row = parseInt(square[1]) - 1;    // '1' = 0
  return { col, row };
}

/**
 * Convert board coordinates (col, row) to algebraic square.
 */
export function coordsToSquare(col, row) {
  return String.fromCharCode(97 + col) + (row + 1);
}
