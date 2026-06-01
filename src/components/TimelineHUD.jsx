import { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import useQuantumStore from '../store/quantumStore';

export default function TimelineHUD() {
  const currentTurn = useQuantumStore((s) => s.currentTurn);
  const chronosUsed = useQuantumStore((s) => s.chronosUsed);
  const moveHistory = useQuantumStore((s) => s.moveHistory);
  const isRewinding = useQuantumStore((s) => s.isRewinding);
  const activateTimeReversal = useQuantumStore((s) => s.activateTimeReversal);
  const stateHistory = useQuantumStore((s) => s.stateHistory);

  const currentChronosUsed = chronosUsed[currentTurn];
  const remainingCharges = currentChronosUsed ? 0 : 3;

  // Check if rewind is possible: need Chronos ready and at least 3 plies (snapshots) in history
  const canRewind = !currentChronosUsed && stateHistory.length >= 3 && !isRewinding;

  // Retrieve last 5 moves
  const lastMoves = useMemo(() => {
    const list = [];
    const histLen = moveHistory.length;
    const maxMoves = Math.min(5, histLen);

    for (let i = 0; i < maxMoves; i++) {
      const idx = histLen - maxMoves + i;
      const move = moveHistory[idx];
      const turnNum = Math.floor(idx / 2) + 1;
      const turnColor = idx % 2 === 0 ? 'w' : 'b';

      // Parse piece icon from move notation
      let pieceIcon = '♟'; // default pawn
      if (move.includes('N')) pieceIcon = '♞';
      else if (move.includes('B')) pieceIcon = '♝';
      else if (move.includes('R')) pieceIcon = '♜';
      else if (move.includes('Q')) pieceIcon = '♛';
      else if (move.includes('K')) pieceIcon = '♚';
      else if (move.includes('ψ')) pieceIcon = 'ψ';

      list.push({
        move,
        turnNum,
        turnColor,
        pieceIcon,
        index: idx + 1,
      });
    }
    return list;
  }, [moveHistory]);

  return (
    <motion.div
      initial={{ x: 220, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="fixed right-0 top-0 h-screen w-[220px] z-20 flex flex-col p-5 select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(8, 12, 24, 0.85), rgba(15, 20, 35, 0.65))',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255, 51, 102, 0.15)',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 51, 102, 0.05)',
      }}
    >
      {/* Title Header */}
      <div className="mt-14 mb-8">
        <h1
          className="text-xl font-[var(--font-display)] tracking-wider glow-text uppercase mb-1"
          style={{ color: '#ff3366', textShadow: '0 0 10px #ff3366, 0 0 20px rgba(255, 51, 102, 0.4)' }}
        >
          Chronos Drive
        </h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-[var(--font-mono)]">
          Timeline Regulator
        </p>
      </div>

      {/* Hourglass Charges */}
      <div className="mb-8">
        <h3 className="text-gray-400 text-[10px] font-[var(--font-display)] uppercase tracking-wider mb-2.5">
          Chronos Charges
        </h3>
        <div className="flex gap-3.5 items-center">
          {Array.from({ length: 3 }).map((_, i) => {
            const isFilled = i < remainingCharges;
            return (
              <div
                key={i}
                className="text-lg transition-all duration-300"
                style={{
                  color: isFilled ? '#ff3366' : '#22263b',
                  textShadow: isFilled ? '0 0 8px #ff3366' : 'none',
                }}
              >
                ⌛
              </div>
            );
          })}
          <span className="text-[10px] text-gray-500 font-[var(--font-mono)] ml-1">
            ({remainingCharges}/3)
          </span>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="mb-8">
        <button
          onClick={activateTimeReversal}
          disabled={!canRewind}
          className={`w-full py-3.5 rounded-xl border font-[var(--font-display)] text-xs tracking-widest uppercase transition-all duration-300 ${
            canRewind
              ? 'border-[#ff3366]/40 text-[#ff3366] hover:bg-[#ff3366]/10 hover:border-[#ff3366] cursor-pointer hover:shadow-[0_0_15px_rgba(255,51,102,0.15)]'
              : 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent'
          }`}
          style={{
            background: canRewind ? 'linear-gradient(135deg, rgba(255,51,102,0.08), rgba(255,51,102,0.03))' : 'transparent',
          }}
        >
          REWIND 3 PLIES
        </button>

        {/* History safety diagnostics check */}
        {!currentChronosUsed && stateHistory.length < 3 && (
          <div className="text-[9px] text-center text-gray-600 font-[var(--font-mono)] mt-2 uppercase tracking-wide">
            Need at least 3 plies of history ({stateHistory.length}/3)
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800/40 my-2" />

      {/* Moves timeline */}
      <div className="flex-grow flex flex-col overflow-hidden min-h-0">
        <h3 className="text-gray-400 text-[10px] font-[var(--font-display)] uppercase tracking-wider mb-4">
          History Timeline
        </h3>
        <div className="flex-grow overflow-y-auto space-y-4.5 pl-1.5 scrollbar-thin">
          {lastMoves.length === 0 ? (
            <p className="text-gray-600 text-[10px] uppercase font-[var(--font-mono)] italic tracking-wider">
              No timeline history
            </p>
          ) : (
            lastMoves.map((m) => (
              <div key={m.index} className="flex gap-4.5 items-start relative">
                {/* Vertical Line Anchor */}
                <div className="absolute left-[9px] top-[18px] bottom-[-18px] w-0.5 bg-gray-800/40" />

                {/* Turn color indicator */}
                <div
                  className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] z-10 font-[var(--font-mono)] transition-all duration-300"
                  style={{
                    backgroundColor: m.turnColor === 'w' ? '#e8e0d0' : '#1a1a2e',
                    borderColor: m.turnColor === 'w' ? '#ffffff' : '#b47eff',
                    color: m.turnColor === 'w' ? '#000000' : '#ffffff',
                    boxShadow: m.turnColor === 'w' ? '0 0 6px rgba(255,255,255,0.2)' : '0 0 6px rgba(180,126,255,0.3)',
                  }}
                >
                  {m.pieceIcon}
                </div>

                {/* Move log */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-[var(--font-display)] tracking-wider text-gray-300 uppercase">
                    Move {m.index}: {m.move}
                  </span>
                  <span className="text-[9px] text-gray-500 font-[var(--font-mono)] uppercase tracking-wider">
                    Turn {m.turnNum} — {m.turnColor === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

