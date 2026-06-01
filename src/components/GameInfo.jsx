import { useMemo } from 'react';
import useQuantumStore from '../store/quantumStore';

// Unicode chess symbols maps
const WHITE_SYMBOLS = {
  p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔'
};

const BLACK_SYMBOLS = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚'
};

export default function GameInfo() {
  const currentTurn = useQuantumStore((s) => s.currentTurn);
  const gameStatus = useQuantumStore((s) => s.gameStatus);
  const capturedPieces = useQuantumStore((s) => s.capturedPieces);
  const wormholePairs = useQuantumStore((s) => s.wormholePairs);

  // White captured pile: black pieces captured by white
  const whiteCaptures = useMemo(() => {
    return (capturedPieces?.b || []).map((p) => BLACK_SYMBOLS[p] || p).join(' ');
  }, [capturedPieces]);

  // Black captured pile: white pieces captured by black
  const blackCaptures = useMemo(() => {
    return (capturedPieces?.w || []).map((p) => WHITE_SYMBOLS[p] || p).join(' ');
  }, [capturedPieces]);

  const turnName = currentTurn === 'w' ? "WHITE'S TURN" : "BLACK'S TURN";
  const turnColor = currentTurn === 'w' ? '#ffffff' : '#b47eff';
  const turnGlow = currentTurn === 'w' ? 'rgba(255,255,255,0.4)' : 'rgba(180,126,255,0.5)';

  return (
    <div
      className="fixed bottom-0 left-0 w-screen h-[80px] z-10 flex items-center justify-between px-8 select-none"
      style={{
        background: 'linear-gradient(180deg, rgba(8, 12, 24, 0.75), rgba(4, 6, 12, 0.9))',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(0, 212, 255, 0.12)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Left Column: Turn Indicator */}
      <div className="w-[30%] flex items-center gap-3.5">
        <div
          className="w-3.5 h-3.5 rounded-full animate-pulse transition-all duration-300"
          style={{
            backgroundColor: turnColor,
            boxShadow: `0 0 12px ${turnColor}, 0 0 20px ${turnGlow}`,
          }}
        />
        <div className="flex flex-col">
          <span
            className="font-[var(--font-display)] text-sm tracking-widest uppercase transition-all duration-300 font-bold"
            style={{
              color: turnColor,
              textShadow: `0 0 8px ${turnGlow}`,
            }}
          >
            {turnName}
          </span>
          <span className="text-[9px] text-gray-500 font-[var(--font-mono)] uppercase tracking-wider">
            Quantum Clock Running
          </span>
        </div>
      </div>

      {/* Center Column: Wormholes & Check Status */}
      <div className="w-[40%] flex flex-col items-center justify-center text-center gap-1.5">
        {/* Check Alert */}
        {gameStatus === 'check' && (
          <div
            className="text-xs font-[var(--font-display)] tracking-wider text-amber-500 animate-pulse bg-amber-500/10 px-4 py-0.5 rounded-full border border-amber-500/25 uppercase font-bold"
            style={{
              textShadow: '0 0 8px rgba(245,158,11,0.5)',
            }}
          >
            ⚠️ Check
          </div>
        )}

        {/* Wormholes List */}
        <div className="flex gap-4 items-center justify-center text-[10px] text-gray-400 font-[var(--font-mono)] uppercase tracking-wider">
          <span className="text-[#ff8c00] font-bold">🌀 Portals:</span>
          {wormholePairs.length === 0 ? (
            <span className="text-gray-600 italic">Inactive</span>
          ) : (
            wormholePairs.map((pair, idx) => (
              <span key={idx} className="bg-gray-900/40 border border-gray-800 px-2 py-0.5 rounded-md text-amber-500/90">
                {pair.a.toUpperCase()} ↔ {pair.b.toUpperCase()}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Captured Pieces */}
      <div className="w-[30%] flex flex-col items-end gap-1 font-[var(--font-mono)]">
        <div className="flex items-center gap-2.5 text-[10px]">
          <span className="text-gray-500 uppercase tracking-widest">White Captured:</span>
          <span className="text-sm tracking-wide text-gray-300 font-normal">
            {whiteCaptures || '—'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[10px]">
          <span className="text-gray-500 uppercase tracking-widest">Black Captured:</span>
          <span className="text-sm tracking-wide text-gray-300 font-normal">
            {blackCaptures || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
