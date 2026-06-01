// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import useQuantumStore from '../store/quantumStore';

// Pre-generate 20 floating dust particles for high visual fidelity once at the module level
const STATIC_PARTICLES = Array.from({ length: 20 }, (_, idx) => {
  const size = Math.random() * 160 + 80;
  return {
    id: idx,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    background: idx % 2 === 0
      ? 'radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(255, 51, 102, 0.08) 0%, transparent 70%)',
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${Math.random() * 15 + 10}s`,
  };
});

// Pre-generate 30 colored confetti items once at the module level
const STATIC_CONFETTI = Array.from({ length: 30 }, (_, idx) => {
  const colors = ['#00d4ff', '#ff3366', '#ff8c00', '#00ff88', '#8b5cf6'];
  const size = Math.random() * 10 + 6;
  return {
    id: idx,
    left: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    animationDelay: `${Math.random() * 2.5}s`,
    animationDuration: `${Math.random() * 3.5 + 2.5}s`,
    borderRadius: idx % 3 === 0 ? '50%' : idx % 3 === 1 ? '4px' : '0px',
  };
});

export default function WinScreen() {
  const winner = useQuantumStore((s) => s.winner);
  const gameStatus = useQuantumStore((s) => s.gameStatus);
  const moveNumber = useQuantumStore((s) => s.moveNumber);
  const superpositionsUsed = useQuantumStore((s) => s.superpositionsUsed);
  const chronosUsed = useQuantumStore((s) => s.chronosUsed);
  const teleportations = useQuantumStore((s) => s.teleportations);
  const resetGame = useQuantumStore((s) => s.resetGame);

  const isGameOver = gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw';

  const particles = STATIC_PARTICLES;
  const confetti = STATIC_CONFETTI;

  // Calculate game stats
  const totalSplits = (superpositionsUsed?.w || 0) + (superpositionsUsed?.b || 0);
  const totalChronos = (chronosUsed?.w ? 1 : 0) + (chronosUsed?.b ? 1 : 0);

  const headingText = gameStatus === 'checkmate' ? 'CHECKMATE' : 'STALEMATE';
  const winnerText = gameStatus === 'checkmate'
    ? winner === 'w' ? 'WHITE WINS' : 'BLACK WINS'
    : 'DRAW';
  const winnerColor = winner === 'w' ? '#ffffff' : winner === 'b' ? '#b47eff' : '#00d4ff';

  return (
    <AnimatePresence>
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm select-none overflow-hidden"
        >
          {/* Internal stylesheets to support keyframe animations standalone */}
          <style>{`
            @keyframes space-float {
              0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.4; }
              50% { transform: translateY(-40px) scale(1.1) rotate(180deg); opacity: 0.8; }
              100% { transform: translateY(0) scale(1) rotate(360deg); opacity: 0.4; }
            }
            @keyframes confetti-drift {
              0% { transform: translateY(110vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
            }
            .glow-win-title {
              text-shadow: 0 0 15px currentColor, 0 0 35px rgba(0, 212, 255, 0.35);
            }
          `}</style>

          {/* Floating Space Dust Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.width,
                  height: p.height,
                  background: p.background,
                  animation: `space-float ${p.animationDuration} infinite ease-in-out`,
                  animationDelay: p.animationDelay,
                }}
              />
            ))}
          </div>

          {/* Confetti Emitters */}
          <div className="absolute inset-0 pointer-events-none">
            {confetti.map((c) => (
              <div
                key={c.id}
                className="absolute bottom-0"
                style={{
                  left: c.left,
                  width: c.width,
                  height: c.height,
                  backgroundColor: c.backgroundColor,
                  borderRadius: c.borderRadius,
                  animation: `confetti-drift ${c.animationDuration} infinite linear`,
                  animationDelay: c.animationDelay,
                  boxShadow: `0 0 8px ${c.backgroundColor}`,
                }}
              />
            ))}
          </div>

          {/* Core Panel Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="relative z-10 w-[420px] p-8 rounded-3xl border text-center flex flex-col items-center gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(8, 12, 24, 0.95), rgba(15, 20, 35, 0.85))',
              borderColor: 'rgba(0, 212, 255, 0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 50px rgba(0, 212, 255, 0.05)',
            }}
          >
            {/* Header Title */}
            <div>
              <h2
                className="text-4xl font-[var(--font-display)] tracking-[0.2em] font-bold text-[#ff3366] mb-1"
                style={{ textShadow: '0 0 12px #ff3366, 0 0 25px rgba(255, 51, 102, 0.4)' }}
              >
                {headingText}
              </h2>
              <h1
                className="text-2xl font-[var(--font-display)] tracking-widest font-bold uppercase glow-win-title"
                style={{ color: winnerColor }}
              >
                {winnerText}
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-gray-400 text-xs font-[var(--font-mono)] uppercase tracking-wider">
              {gameStatus === 'checkmate'
                ? 'Quantum wavefunction collapsed completely.'
                : 'Timeline reached static equilibrium.'}
            </p>

            {/* Scorecard stats matrix */}
            <div className="grid grid-cols-2 gap-3 w-full my-2">
              {/* Card 1: Moves */}
              <div
                className="p-4 rounded-2xl border flex flex-col items-center gap-1.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span className="text-xl font-[var(--font-display)] text-[#00d4ff] font-bold">
                  {moveNumber}
                </span>
                <span className="text-[9px] text-gray-500 font-[var(--font-mono)] uppercase tracking-wider">
                  Total Moves
                </span>
              </div>

              {/* Card 2: Splits */}
              <div
                className="p-4 rounded-2xl border flex flex-col items-center gap-1.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span className="text-xl font-[var(--font-display)] text-[#00ff88] font-bold">
                  {totalSplits}
                </span>
                <span className="text-[9px] text-gray-500 font-[var(--font-mono)] uppercase tracking-wider">
                  Splits Used
                </span>
              </div>

              {/* Card 3: Teleports */}
              <div
                className="p-4 rounded-2xl border flex flex-col items-center gap-1.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span className="text-xl font-[var(--font-display)] text-[#ff8c00] font-bold">
                  {teleportations}
                </span>
                <span className="text-[9px] text-gray-500 font-[var(--font-mono)] uppercase tracking-wider">
                  Teleports
                </span>
              </div>

              {/* Card 4: Chronos rewinds */}
              <div
                className="p-4 rounded-2xl border flex flex-col items-center gap-1.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <span className="text-xl font-[var(--font-display)] text-[#ff3366] font-bold">
                  {totalChronos}
                </span>
                <span className="text-[9px] text-gray-500 font-[var(--font-mono)] uppercase tracking-wider">
                  Rewinds Used
                </span>
              </div>
            </div>

            {/* Triggers */}
            <div className="flex gap-4.5 w-full mt-2">
              <button
                onClick={resetGame}
                className="flex-1 py-4.5 rounded-xl border font-[var(--font-display)] text-xs tracking-widest uppercase cursor-pointer hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15))',
                  borderColor: '#00d4ff',
                  color: '#00d4ff',
                }}
              >
                Play Again
              </button>
              <button
                onClick={resetGame}
                className="flex-1 py-4.5 rounded-xl border border-gray-800 font-[var(--font-display)] text-xs tracking-widest uppercase text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all duration-300 bg-transparent cursor-pointer"
              >
                Main Menu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
