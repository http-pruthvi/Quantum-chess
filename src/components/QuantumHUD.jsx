// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import useQuantumStore from '../store/quantumStore';

export default function QuantumHUD() {
  const currentTurn = useQuantumStore((s) => s.currentTurn);
  const superpositions = useQuantumStore((s) => s.superpositions);
  const superpositionMode = useQuantumStore((s) => s.superpositionMode);
  const superpositionsUsed = useQuantumStore((s) => s.superpositionsUsed);
  const splitSourceSquare = useQuantumStore((s) => s.splitSourceSquare);
  const activateSuperposition = useQuantumStore((s) => s.activateSuperposition);
  const cancelSuperposition = useQuantumStore((s) => s.cancelSuperposition);

  const superpositionLimit = 2;
  const quantumMoves = {
    w: Math.max(0, superpositionLimit - (superpositionsUsed?.w || 0)),
    b: Math.max(0, superpositionLimit - (superpositionsUsed?.b || 0)),
  };

  const remainingSplits = quantumMoves[currentTurn];
  const canActivate = remainingSplits > 0 && !superpositionMode;

  const PIECE_NAME_MAP = {
    p: 'Pawn',
    r: 'Rook',
    n: 'Knight',
    b: 'Bishop',
    q: 'Queen',
    k: 'King',
  };

  return (
    <motion.div
      initial={{ x: -220, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="fixed left-0 top-0 h-screen w-[220px] z-20 flex flex-col p-5 select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(8, 12, 24, 0.85), rgba(15, 20, 35, 0.65))',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(0, 212, 255, 0.15)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.05)',
      }}
    >
      {/* Title Header */}
      <div className="mt-14 mb-8">
        <h1
          className="text-xl font-[var(--font-display)] tracking-wider glow-text uppercase mb-1"
          style={{ color: '#00d4ff' }}
        >
          Quantum Split
        </h1>
        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-[var(--font-mono)]">
          ψ Mode Coordinator
        </p>
      </div>

      {/* Remaining Splits Indicator */}
      <div className="mb-8">
        <h3 className="text-gray-400 text-[10px] font-[var(--font-display)] uppercase tracking-wider mb-2">
          Remaining Splits
        </h3>
        <div className="flex gap-2.5 items-center">
          {Array.from({ length: superpositionLimit }).map((_, i) => {
            const isFilled = i < remainingSplits;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border border-[#00d4ff] transition-all duration-300 ${
                  isFilled
                    ? 'bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]'
                    : 'bg-transparent opacity-25'
                }`}
              />
            );
          })}
          <span className="text-[10px] text-gray-500 font-[var(--font-mono)] ml-1">
            ({remainingSplits} left)
          </span>
        </div>
      </div>

      {/* Split Operations Button */}
      <div className="mb-8">
        {superpositionMode ? (
          <button
            onClick={cancelSuperposition}
            className="w-full py-3.5 rounded-xl border font-[var(--font-display)] text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer animate-pulse"
            style={{
              background: 'rgba(0, 136, 255, 0.15)',
              borderColor: '#00d4ff',
              color: '#00d4ff',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.25)',
            }}
          >
            {!splitSourceSquare ? 'SELECT PIECE' : 'SELECT TARGET'}
          </button>
        ) : (
          <button
            onClick={activateSuperposition}
            disabled={!canActivate}
            className={`w-full py-3.5 rounded-xl border font-[var(--font-display)] text-xs tracking-widest uppercase transition-all duration-300 ${
              canActivate
                ? 'border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10 hover:border-[#00d4ff] cursor-pointer hover:shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                : 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent'
            }`}
            style={{
              background: canActivate ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,136,255,0.03))' : 'transparent',
            }}
          >
            SPLIT PIECE (ψ)
          </button>
        )}

        {/* Instructive notification text */}
        {superpositionMode && (
          <div className="text-[10px] text-center text-[#00d4ff]/80 font-[var(--font-mono)] mt-2.5 tracking-wider uppercase">
            {!splitSourceSquare
              ? '← Click your piece to split'
              : '← Choose ghost target square'}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800/40 my-2" />

      {/* Active Superpositions List */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <h3 className="text-gray-400 text-[10px] font-[var(--font-display)] uppercase tracking-wider mb-3">
          Active wavefunctions
        </h3>
        <div className="flex-grow overflow-y-auto space-y-3.5 scrollbar-thin pr-1">
          {superpositions.length === 0 ? (
            <p className="text-gray-600 text-[10px] uppercase font-[var(--font-mono)] italic tracking-wider">
              No active splits
            </p>
          ) : (
            superpositions.map((sp) => {
              const type = sp.pieceId.split('_')[0];
              const pieceName = PIECE_NAME_MAP[type] || 'Piece';
              const isWhite = sp.owner === 'w';
              return (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-xl border border-gray-850 flex flex-col gap-1.5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(0, 212, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-[var(--font-display)] tracking-wider" style={{ color: isWhite ? '#e8e0d0' : '#b47eff' }}>
                      {isWhite ? 'White' : 'Black'} {pieceName}
                    </span>
                    <span className="text-[9px] font-[var(--font-mono)] text-[#0088ff] uppercase bg-[#0088ff]/10 px-1.5 py-0.5 rounded-md">
                      ψ state
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-[var(--font-mono)] tracking-wider">
                    {sp.realSquare.toUpperCase()} ⟷ {sp.ghostSquare.toUpperCase()}
                  </div>
                  <div className="text-[9px] text-amber-500/80 font-[var(--font-mono)] flex items-center gap-1 uppercase tracking-wide">
                    <span>⚡</span> Will collapse on attack
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
