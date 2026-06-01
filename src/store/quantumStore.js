import { create } from 'zustand';
import { Chess } from 'chess.js';
import { getLegalMoves, getPieceAt, getGameStatus, getFen } from '../engine/chessEngine';
import { canActivateSuperposition, createSuperposition, findSuperpositionAtSquare, collapseSuperposition } from '../engine/superposition';
import { createSnapshot, pushSnapshot, canUseTimeReversal, performTimeReversal } from '../engine/timeReversal';
import { generateWormholePairs, checkWormholeTeleport } from '../engine/wormhole';
import { findBestMove } from '../engine/aiEngine';

const useQuantumStore = create((set, get) => ({
  // Chess core
  chess: new Chess(),
  fen: new Chess().fen(),
  currentTurn: 'w',
  selectedSquare: null,
  validMoves: [],
  gameStatus: 'playing',
  winner: null,
  moveHistory: [],
  capturedPieces: { w: [], b: [] },
  moveNumber: 0,

  // Superposition
  superpositions: [],
  superpositionMode: false,
  splitSourceSquare: null,
  superpositionsUsed: { w: 0, b: 0 },

  // Time reversal
  stateHistory: [],
  chronosUsed: { w: false, b: false },
  isRewinding: false,

  // Wormholes
  wormholePairs: [],
  lastTeleport: null,

  // Stats
  teleportations: 0,

  // Game screens
  gamePhase: 'start',

  // Animations & notifications
  animatingMove: null,
  notifications: [],

  // AI
  gameMode: 'local',      // 'local' | 'ai'
  aiDifficulty: 'medium', // 'easy' | 'medium' | 'hard'
  aiColor: 'b',           // AI plays black by default
  aiThinking: false,

  // ─── Configure game mode ────────────────────────────────
  setGameMode: (mode) => set({ gameMode: mode }),
  setAIDifficulty: (diff) => set({ aiDifficulty: diff }),

  // ─── Initialize ───────────────────────────────────────────
  initGame: () => {
    const chess = new Chess();
    const wormholePairs = generateWormholePairs();
    set({
      chess,
      fen: chess.fen(),
      currentTurn: 'w',
      selectedSquare: null,
      validMoves: [],
      gameStatus: 'playing',
      winner: null,
      moveHistory: [],
      capturedPieces: { w: [], b: [] },
      moveNumber: 0,
      superpositions: [],
      superpositionMode: false,
      splitSourceSquare: null,
      superpositionsUsed: { w: 0, b: 0 },
      stateHistory: [],
      chronosUsed: { w: false, b: false },
      isRewinding: false,
      wormholePairs,
      lastTeleport: null,
      teleportations: 0,
      gamePhase: 'playing',
      animatingMove: null,
      notifications: [],
      aiThinking: false,
    });
  },

  // ─── AI move ──────────────────────────────────────────────
  triggerAIMove: () => {
    const state = get();
    if (state.gameMode !== 'ai') return;
    if (state.currentTurn !== state.aiColor) return;
    if (state.gamePhase !== 'playing') return;
    if (state.aiThinking) return;
    if (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate' || state.gameStatus === 'draw') return;

    set({ aiThinking: true });

    // Use setTimeout to let UI update and show "thinking" state
    setTimeout(() => {
      const s = get();
      const bestMove = findBestMove(s.fen, s.aiDifficulty);
      if (bestMove) {
        set({ aiThinking: false });
        get().makeMove(bestMove.from, bestMove.to);
      } else {
        set({ aiThinking: false });
      }
    }, 400 + Math.random() * 300); // 400-700ms "thinking" delay for natural feel
  },

  // ─── Notification system ──────────────────────────────────
  addNotification: (message, type = 'info') => {
    const id = Date.now() + Math.random();
    set((s) => ({
      notifications: [...s.notifications.slice(-4), { id, message, type, timestamp: Date.now() }],
    }));
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      }));
    }, 3000);
  },

  // ─── Square selection ─────────────────────────────────────
  selectSquare: (square) => {
    const state = get();
    const { gameStatus, isRewinding } = state;
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw') return;
    if (isRewinding) return;

    const { chess, selectedSquare, validMoves, currentTurn, superpositionMode, splitSourceSquare } = state;

    // ── Superposition mode ──
    if (superpositionMode) {
      if (!splitSourceSquare) {
        const piece = getPieceAt(chess, square);
        if (piece && piece.color === currentTurn) {
          const alreadySuperposed = state.superpositions.some(
            (s) => s.realSquare === square || s.ghostSquare === square
          );
          if (alreadySuperposed) {
            get().addNotification('This piece is already in superposition', 'warn');
            return;
          }
          const moves = getLegalMoves(chess, square);
          if (moves.length > 0) {
            set({ splitSourceSquare: square, validMoves: moves });
          }
        }
        return;
      } else {
        if (validMoves.includes(square)) {
          get().confirmSplit(square);
        } else {
          set({ superpositionMode: false, splitSourceSquare: null, validMoves: [] });
        }
        return;
      }
    }

    // ── Normal mode ──
    if (selectedSquare) {
      if (validMoves.includes(square)) {
        get().makeMove(selectedSquare, square);
      } else {
        let piece = getPieceAt(chess, square);
        if (!piece) {
          const activeSuper = state.superpositions.find((s) => s.ghostSquare === square);
          if (activeSuper) {
            piece = getPieceAt(chess, activeSuper.realSquare);
          }
        }
        if (piece && piece.color === currentTurn) {
          const moves = computeValidMovesWithSuperposition(chess, square, state.superpositions);
          set({ selectedSquare: square, validMoves: moves });
        } else {
          set({ selectedSquare: null, validMoves: [] });
        }
      }
    } else {
      let piece = getPieceAt(chess, square);
      if (!piece) {
        const activeSuper = state.superpositions.find((s) => s.ghostSquare === square);
        if (activeSuper) {
          piece = getPieceAt(chess, activeSuper.realSquare);
        }
      }
      if (piece && piece.color === currentTurn) {
        const moves = computeValidMovesWithSuperposition(chess, square, state.superpositions);
        set({ selectedSquare: square, validMoves: moves });
      }
    }
  },

  // ─── Make a move ──────────────────────────────────────────
  makeMove: (from, to) => {
    const state = get();
    const { chess, superpositions, wormholePairs } = state;

    // Snapshot BEFORE the move
    const snapshot = createSnapshot({
      fen: getFen(chess),
      superpositions: state.superpositions,
      wormholePairs: state.wormholePairs,
      capturedPieces: state.capturedPieces,
      moveHistory: state.moveHistory,
      chronosUsed: state.chronosUsed,
      currentTurn: state.currentTurn,
      moveNumber: state.moveNumber,
      superpositionsUsed: state.superpositionsUsed,
      teleportations: state.teleportations,
    });

    let newSuperpositions = [...superpositions];
    let newCaptured = {
      w: [...state.capturedPieces.w],
      b: [...state.capturedPieces.b],
    };
    let extraNotifications = [];

    // ── Check if target square is a superposition ghost ──
    const superAtTarget = findSuperpositionAtSquare(superpositions, to);
    if (superAtTarget && superAtTarget.owner !== state.currentTurn) {
      const collapseResult = collapseSuperposition(superAtTarget, to);
      if (collapseResult) {
        newSuperpositions = newSuperpositions.filter((s) => s.id !== collapseResult.removeSuper.id);

        if (!collapseResult.captured) {
          // Hit the GHOST — move "fails" conceptually, but chess.js doesn't know
          // about ghosts, so we just move the piece there (nothing to capture in chess.js)
          // The real piece is revealed at its actual square
          extraNotifications.push({
            message: '👻 Ghost collapsed! The real piece was elsewhere.',
            type: 'quantum',
          });
        } else {
          // Hit the REAL square — normal capture
          extraNotifications.push({
            message: '⚛ Superposition collapsed — piece captured!',
            type: 'quantum',
          });
        }
      }
    }

    // ── Collapse any superposition on the MOVING piece ──
    const superAtSource = findSuperpositionAtSquare(superpositions, from);
    if (superAtSource) {
      newSuperpositions = newSuperpositions.filter((s) => s.id !== superAtSource.id);
      
      // If moving from the ghost square, teleport the piece to the ghost square first
      if (superAtSource.ghostSquare === from) {
        const currentFen = getFen(chess);
        const teleportedFen = teleportPieceInFen(currentFen, superAtSource.realSquare, from);
        chess.load(teleportedFen);
      }

      extraNotifications.push({
        message: '⚛ Moving piece exited superposition',
        type: 'info',
      });
    }

    // ── Execute chess.js move ──
    const movingPiece = getPieceAt(chess, from);
    let move;
    try {
      move = chess.move({ from, to, promotion: 'q' });
    } catch {
      move = null;
    }
    if (!move) {
      set({ selectedSquare: null, validMoves: [] });
      return;
    }

    // Track captured piece
    if (move.captured) {
      const capturedColor = move.color === 'w' ? 'b' : 'w';
      newCaptured[capturedColor] = [...newCaptured[capturedColor], move.captured];
    }

    // ── Wormhole teleportation ──
    let teleportOccurred = false;
    let teleportations = state.teleportations;
    let lastTeleport = null;

    if (movingPiece) {
      const teleportResult = checkWormholeTeleport(
        wormholePairs,
        to,
        movingPiece,
        (sq) => getPieceAt(chess, sq)
      );

      if (teleportResult.shouldTeleport) {
        // Capture at exit if enemy present
        if (teleportResult.captureAtExit) {
          const capturedColor = teleportResult.captureAtExit.color;
          newCaptured[capturedColor] = [...newCaptured[capturedColor], teleportResult.captureAtExit.type];
        }

        // Teleport: manipulate board state preserving turn/castling/en-passant
        const currentFen = getFen(chess);
        const newFen = teleportPieceInFen(currentFen, to, teleportResult.exitSquare);
        chess.load(newFen);

        teleportOccurred = true;
        teleportations++;
        lastTeleport = { from: to, to: teleportResult.exitSquare };

        extraNotifications.push({
          message: `🌀 Wormhole teleport: ${to} → ${teleportResult.exitSquare}`,
          type: 'wormhole',
        });
      }
    }

    // ── Update game status ──
    const status = getGameStatus(chess);
    let winner = null;
    let gamePhase = 'playing';

    if (status === 'checkmate') {
      winner = state.currentTurn;
      gamePhase = 'ended';
    } else if (status === 'stalemate' || status === 'draw') {
      gamePhase = 'ended';
    }

    if (status === 'check') {
      extraNotifications.push({
        message: `⚠ ${chess.turn() === 'w' ? 'White' : 'Black'} is in CHECK!`,
        type: 'warn',
      });
    }

    const newHistory = pushSnapshot(state.stateHistory, snapshot);

    set({
      fen: getFen(chess),
      currentTurn: chess.turn(),
      selectedSquare: null,
      validMoves: [],
      gameStatus: status,
      winner,
      moveHistory: [...state.moveHistory, move.san],
      capturedPieces: newCaptured,
      moveNumber: state.moveNumber + 1,
      superpositions: newSuperpositions,
      stateHistory: newHistory,
      lastTeleport: teleportOccurred ? lastTeleport : null,
      teleportations,
      gamePhase,
    });

    // Fire notifications after state update
    extraNotifications.forEach((n) => {
      get().addNotification(n.message, n.type);
    });
  },

  // ─── Superposition mode ───────────────────────────────────
  activateSuperposition: () => {
    const state = get();
    // Can't split while in check
    if (state.gameStatus === 'check') {
      get().addNotification("Can't use superposition while in check!", 'warn');
      return;
    }
    if (!canActivateSuperposition(state.superpositions, state.currentTurn)) {
      get().addNotification('Maximum superpositions reached', 'warn');
      return;
    }
    set({ superpositionMode: true, splitSourceSquare: null, validMoves: [], selectedSquare: null });
  },

  cancelSuperposition: () => {
    set({ superpositionMode: false, splitSourceSquare: null, validMoves: [], selectedSquare: null });
  },

  // ─── Confirm superposition split ─────────────────────────
  confirmSplit: (ghostSquare) => {
    const state = get();
    const { chess, splitSourceSquare, currentTurn } = state;
    if (!splitSourceSquare) return;

    const piece = getPieceAt(chess, splitSourceSquare);
    if (!piece) return;

    // Snapshot before split
    const snapshot = createSnapshot({
      fen: getFen(chess),
      superpositions: state.superpositions,
      wormholePairs: state.wormholePairs,
      capturedPieces: state.capturedPieces,
      moveHistory: state.moveHistory,
      chronosUsed: state.chronosUsed,
      currentTurn: state.currentTurn,
      moveNumber: state.moveNumber,
      superpositionsUsed: state.superpositionsUsed,
      teleportations: state.teleportations,
    });

    const superposition = createSuperposition(
      `${piece.type}_${splitSourceSquare}`,
      currentTurn,
      splitSourceSquare,
      ghostSquare
    );

    const newHistory = pushSnapshot(state.stateHistory, snapshot);

    // In chess.js, the piece stays at its original square (realSquare).
    // The ghost is purely visual — chess.js knows nothing about it.
    // We manually switch the turn using a null-move approach:
    // Load a FEN with the opposite turn.
    const currentFen = getFen(chess);
    const newTurn = currentTurn === 'w' ? 'b' : 'w';
    const flippedFen = switchFenTurn(currentFen, newTurn);
    chess.load(flippedFen);

    set({
      fen: getFen(chess),
      superpositions: [...state.superpositions, superposition],
      superpositionMode: false,
      splitSourceSquare: null,
      validMoves: [],
      selectedSquare: null,
      currentTurn: newTurn,
      moveNumber: state.moveNumber + 1,
      moveHistory: [...state.moveHistory, `ψ ${splitSourceSquare}⇌${ghostSquare}`],
      superpositionsUsed: {
        ...state.superpositionsUsed,
        [currentTurn]: state.superpositionsUsed[currentTurn] + 1,
      },
      stateHistory: newHistory,
    });

    get().addNotification(
      `ψ ${piece.type.toUpperCase()} split: ${splitSourceSquare} ⇌ ${ghostSquare}`,
      'quantum'
    );
  },

  // ─── Time reversal ────────────────────────────────────────
  activateTimeReversal: () => {
    const state = get();
    const player = state.currentTurn;

    if (!canUseTimeReversal(state.stateHistory, state.chronosUsed, player)) {
      get().addNotification('Chronos not available', 'warn');
      return;
    }

    const result = performTimeReversal(state.stateHistory);
    if (!result) return;

    set({ isRewinding: true });
    get().addNotification('⏮ CHRONOS ACTIVATED — Rewinding timeline...', 'chronos');

    setTimeout(() => {
      const { restoredState, newHistory } = result;
      const chess = new Chess(restoredState.fen);

      set({
        chess,
        fen: restoredState.fen,
        currentTurn: player,
        selectedSquare: null,
        validMoves: [],
        gameStatus: getGameStatus(chess),
        winner: null,
        moveHistory: restoredState.moveHistory,
        capturedPieces: restoredState.capturedPieces,
        moveNumber: restoredState.moveNumber,
        superpositions: restoredState.superpositions,
        stateHistory: newHistory,
        chronosUsed: { ...state.chronosUsed, [player]: true },
        superpositionsUsed: restoredState.superpositionsUsed,
        teleportations: restoredState.teleportations,
        isRewinding: false,
        lastTeleport: null,
        gamePhase: 'playing',
      });
      get().addNotification('Timeline restored. Your move.', 'info');
    }, 900);
  },

  // ─── Reset ────────────────────────────────────────────────
  resetGame: () => {
    const chess = new Chess();
    set({
      chess,
      fen: chess.fen(),
      currentTurn: 'w',
      selectedSquare: null,
      validMoves: [],
      gameStatus: 'playing',
      winner: null,
      moveHistory: [],
      capturedPieces: { w: [], b: [] },
      moveNumber: 0,
      superpositions: [],
      superpositionMode: false,
      splitSourceSquare: null,
      superpositionsUsed: { w: 0, b: 0 },
      stateHistory: [],
      chronosUsed: { w: false, b: false },
      isRewinding: false,
      wormholePairs: [],
      lastTeleport: null,
      teleportations: 0,
      gamePhase: 'start',
      animatingMove: null,
      notifications: [],
    });
  },
}));

// ─── Helpers ──────────────────────────────────────────────

/**
 * Compute valid moves for a piece, including ghost squares as valid targets.
 * Ghost squares that belong to the OPPONENT's superpositions are valid attack targets.
 */
function computeValidMovesWithSuperposition(chess, square, superpositions) {
  // Check if the selected square is a ghost square in an active superposition
  if (superpositions) {
    const activeSuper = superpositions.find((s) => s.ghostSquare === square);
    if (activeSuper) {
      const tempChess = new Chess(chess.fen());
      const currentFen = tempChess.fen();
      const tempFen = teleportPieceInFen(currentFen, activeSuper.realSquare, square);
      try {
        tempChess.load(tempFen);
        return getLegalMoves(tempChess, square);
      } catch (e) {
        console.error("Error loading FEN for ghost moves:", e);
        return [];
      }
    }
  }

  // If it's a real square, return normal moves
  return getLegalMoves(chess, square);
}

/**
 * Teleport a piece in FEN. Preserves turn, castling rights, en passant, clocks.
 */
function teleportPieceInFen(fen, fromSquare, toSquare) {
  const parts = fen.split(' ');
  const boardPart = parts[0];
  const turn = parts[1];
  const castling = parts[2];
  const enPassant = parts[3];
  const halfMove = parts[4];
  const fullMove = parts[5];

  // Parse board into 8x8 array
  const rows = boardPart.split('/');
  const board = rows.map((row) => {
    const cells = [];
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) cells.push(null);
      } else {
        cells.push(ch);
      }
    }
    return cells;
  });

  // Convert square notation to [row, col]
  const fromRC = squareToRC(fromSquare);
  const toRC = squareToRC(toSquare);

  // Move the piece
  const piece = board[fromRC[0]][fromRC[1]];
  board[fromRC[0]][fromRC[1]] = null;
  board[toRC[0]][toRC[1]] = piece;

  // Rebuild FEN board string
  const newBoardPart = board
    .map((row) => {
      let str = '';
      let emptyCount = 0;
      for (const cell of row) {
        if (cell === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            str += emptyCount;
            emptyCount = 0;
          }
          str += cell;
        }
      }
      if (emptyCount > 0) str += emptyCount;
      return str;
    })
    .join('/');

  return `${newBoardPart} ${turn} ${castling} ${enPassant} ${halfMove} ${fullMove}`;
}

/**
 * Switch the active turn in a FEN string without changing anything else.
 */
function switchFenTurn(fen, newTurn) {
  const parts = fen.split(' ');
  parts[1] = newTurn;
  // Reset en passant on turn switch (no move was made)
  parts[3] = '-';
  return parts.join(' ');
}

/**
 * Convert algebraic square to [row, col] for FEN manipulation. Row 0 = rank 8.
 */
function squareToRC(sq) {
  const col = sq.charCodeAt(0) - 97;
  const row = 8 - parseInt(sq[1]);
  return [row, col];
}

export default useQuantumStore;
