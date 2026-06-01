import { TIME_REVERSAL_PLIES, MAX_HISTORY_LENGTH } from '../constants/gameConfig';

/**
 * Create a deep snapshot of the current game state for history.
 */
export function createSnapshot(state) {
  return {
    fen: state.fen,
    superpositions: JSON.parse(JSON.stringify(state.superpositions)),
    wormholePairs: JSON.parse(JSON.stringify(state.wormholePairs)),
    capturedPieces: JSON.parse(JSON.stringify(state.capturedPieces)),
    moveHistory: [...state.moveHistory],
    chronosUsed: { ...state.chronosUsed },
    currentTurn: state.currentTurn,
    moveNumber: state.moveNumber,
    superpositionsUsed: { ...state.superpositionsUsed },
    teleportations: state.teleportations,
  };
}

/**
 * Push a snapshot onto the history stack.
 * Limits stack to MAX_HISTORY_LENGTH entries.
 */
export function pushSnapshot(stateHistory, snapshot) {
  const newHistory = [...stateHistory, snapshot];
  if (newHistory.length > MAX_HISTORY_LENGTH) {
    return newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
  }
  return newHistory;
}

/**
 * Check if a player can use Time Reversal.
 */
export function canUseTimeReversal(stateHistory, chronosUsed, player) {
  if (chronosUsed[player]) return false;
  // Need at least TIME_REVERSAL_PLIES snapshots to rewind
  return stateHistory.length >= TIME_REVERSAL_PLIES;
}

/**
 * Perform time reversal: rewind by TIME_REVERSAL_PLIES half-moves.
 * Returns { restoredState, newHistory }
 */
export function performTimeReversal(stateHistory) {
  if (stateHistory.length < TIME_REVERSAL_PLIES) {
    return null;
  }

  // Remove the last TIME_REVERSAL_PLIES snapshots
  const rewindIndex = stateHistory.length - TIME_REVERSAL_PLIES;
  const restoredState = stateHistory[rewindIndex];
  const newHistory = stateHistory.slice(0, rewindIndex);

  return {
    restoredState,
    newHistory,
  };
}

/**
 * Check if a Time Reversal was used in the last N plies (to prevent paradoxes).
 */
export function wasTimeReversalRecentlyUsed(stateHistory, plies) {
  const startIndex = Math.max(0, stateHistory.length - plies);
  for (let i = startIndex; i < stateHistory.length; i++) {
    if (stateHistory[i]._wasTimeReversal) return true;
  }
  return false;
}
