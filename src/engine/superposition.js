import { MAX_SUPERPOSITIONS_PER_PLAYER } from '../constants/gameConfig';

/**
 * Check if a player can activate superposition.
 */
export function canActivateSuperposition(superpositions, currentTurn) {
  const playerSuperpositions = superpositions.filter(
    (s) => s.owner === currentTurn
  );
  return playerSuperpositions.length < MAX_SUPERPOSITIONS_PER_PLAYER;
}

/**
 * Create a superposition entry.
 */
export function createSuperposition(pieceId, owner, realSquare, ghostSquare) {
  return {
    id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    pieceId,
    owner,
    realSquare,
    ghostSquare,
  };
}

/**
 * Check if a square has a superposition ghost or real piece.
 * Returns the superposition object if found, null otherwise.
 */
export function findSuperpositionAtSquare(superpositions, square) {
  return superpositions.find(
    (s) => s.realSquare === square || s.ghostSquare === square
  ) || null;
}

/**
 * Collapse a superposition when a square is attacked.
 * Returns { captured: boolean, revealSquare: string, removeSuper: superposition }
 */
export function collapseSuperposition(superposition, targetSquare) {
  if (targetSquare === superposition.realSquare) {
    // Attacker hit the real piece — capture succeeds
    return {
      captured: true,
      revealSquare: null,
      removeSuper: superposition,
    };
  } else if (targetSquare === superposition.ghostSquare) {
    // Attacker hit the ghost — capture fails, reveal real piece
    return {
      captured: false,
      revealSquare: superposition.realSquare,
      removeSuper: superposition,
    };
  }
  return null;
}

/**
 * Check if a piece at a given square is in superposition.
 */
export function isInSuperposition(superpositions, square) {
  return superpositions.some(
    (s) => s.realSquare === square || s.ghostSquare === square
  );
}

/**
 * Get all superposition squares for display (both real and ghost).
 */
export function getSuperpositionSquares(superpositions) {
  const squares = {};
  superpositions.forEach((s) => {
    squares[s.realSquare] = { type: 'superposition', superposition: s };
    squares[s.ghostSquare] = { type: 'superposition', superposition: s };
  });
  return squares;
}
