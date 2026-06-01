import { WORMHOLE_PAIR_COUNT, WORMHOLE_EXCLUDED_RANKS, FILES, RANKS } from '../constants/gameConfig';

/**
 * Generate random wormhole pairs for game start.
 * Returns array of pairs: [{ a: 'c4', b: 'f5' }, ...]
 * Constraints:
 *  - Not on excluded ranks (rows 1, 2, 7, 8)
 *  - No duplicate squares
 *  - Paired portals not on the same square color
 */
export function generateWormholePairs() {
  const validSquares = [];

  for (const file of FILES) {
    for (const rank of RANKS) {
      const rankNum = parseInt(rank);
      if (!WORMHOLE_EXCLUDED_RANKS.includes(rankNum)) {
        validSquares.push(file + rank);
      }
    }
  }

  const pairs = [];
  const usedSquares = new Set();

  for (let i = 0; i < WORMHOLE_PAIR_COUNT; i++) {
    let attempts = 0;
    while (attempts < 100) {
      const idxA = Math.floor(Math.random() * validSquares.length);
      let idxB = Math.floor(Math.random() * validSquares.length);

      const sqA = validSquares[idxA];
      const sqB = validSquares[idxB];

      if (
        sqA !== sqB &&
        !usedSquares.has(sqA) &&
        !usedSquares.has(sqB) &&
        getSquareColor(sqA) !== getSquareColor(sqB)
      ) {
        pairs.push({ a: sqA, b: sqB });
        usedSquares.add(sqA);
        usedSquares.add(sqB);
        break;
      }
      attempts++;
    }
  }

  return pairs;
}

/**
 * Get the color of a chess square ('light' or 'dark').
 */
function getSquareColor(square) {
  const col = square.charCodeAt(0) - 97;
  const row = parseInt(square[1]) - 1;
  return (col + row) % 2 === 0 ? 'dark' : 'light';
}

/**
 * Check if a square is a wormhole entry and return the exit square.
 * Returns exitSquare string or null.
 */
export function getWormholeExit(wormholePairs, square) {
  for (const pair of wormholePairs) {
    if (pair.a === square) return pair.b;
    if (pair.b === square) return pair.a;
  }
  return null;
}

/**
 * Check if teleportation should occur after a piece lands on a portal.
 * Returns { shouldTeleport, exitSquare, captureAtExit } or { shouldTeleport: false }
 */
export function checkWormholeTeleport(wormholePairs, landedSquare, piece, boardGetter) {
  const exitSquare = getWormholeExit(wormholePairs, landedSquare);

  if (!exitSquare) {
    return { shouldTeleport: false };
  }

  // Kings cannot use portals
  if (piece.type === 'k') {
    return { shouldTeleport: false };
  }

  // Check what's at the exit square
  const exitPiece = boardGetter(exitSquare);

  if (exitPiece) {
    if (exitPiece.color === piece.color) {
      // Friendly piece blocks teleportation
      return { shouldTeleport: false };
    } else {
      // Enemy piece — capture and teleport
      return { shouldTeleport: true, exitSquare, captureAtExit: exitPiece };
    }
  }

  // Empty exit — teleport freely
  return { shouldTeleport: true, exitSquare, captureAtExit: null };
}

/**
 * Check if a square is a wormhole square.
 */
export function isWormholeSquare(wormholePairs, square) {
  return wormholePairs.some((p) => p.a === square || p.b === square);
}

/**
 * Get all wormhole squares as a flat array.
 */
export function getAllWormholeSquares(wormholePairs) {
  return wormholePairs.flatMap((p) => [p.a, p.b]);
}

/**
 * Get the pair partner for a wormhole square.
 */
export function getWormholePartner(wormholePairs, square) {
  for (const pair of wormholePairs) {
    if (pair.a === square) return { pair, partner: pair.b };
    if (pair.b === square) return { pair, partner: pair.a };
  }
  return null;
}
