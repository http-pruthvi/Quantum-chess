import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import useQuantumStore from '../store/quantumStore';

// Pre-generate 60 star coordinates at module level to make rendering pure
const START_STAR_POSITIONS = Array.from({ length: 60 }, (_, idx) => ({
  id: idx,
  x: Math.random() * 100,
  y: Math.random() * 100,
  opacity: Math.random() * 0.6 + 0.1,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 2,
}));

export default function StartScreen() {
  const initGame = useQuantumStore((s) => s.initGame);
  const setGameMode = useQuantumStore((s) => s.setGameMode);
  const setAIDifficulty = useQuantumStore((s) => s.setAIDifficulty);

  const [mode, setMode] = useState('local');
  const [difficulty, setDifficulty] = useState('medium');

  const handleStart = () => {
    setGameMode(mode);
    setAIDifficulty(difficulty);
    initGame();
  };

  const stars = START_STAR_POSITIONS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at center, #0f1428 0%, #050810 80%)' }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-[2px] h-[2px] bg-white rounded-full transition-all duration-1000"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl px-6 flex flex-col items-center gap-7">
        {/* Glowing Title banner */}
        <motion.div
          initial={{ y: -45, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <h1
            className="text-6xl md:text-7xl font-[var(--font-display)] tracking-[0.2em] mb-1 font-extrabold"
            style={{ color: '#00d4ff', textShadow: '0 0 20px rgba(0, 212, 255, 0.45)' }}
          >
            QUANTUM
          </h1>
          <h1
            className="text-5xl md:text-6xl font-[var(--font-display)] tracking-[0.35em] font-extrabold"
            style={{ color: '#8b5cf6', textShadow: '0 0 20px rgba(139, 92, 246, 0.45)' }}
          >
            CHESS
          </h1>
          <p className="text-gray-500 text-xs font-[var(--font-mono)] mt-4 uppercase tracking-[0.25em]">
            Chess. But the universe is broken.
          </p>
        </motion.div>

        {/* Mode & Options Selectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md flex flex-col gap-5 bg-gray-950/40 border border-gray-900/60 p-6 rounded-2xl backdrop-blur-md"
        >
          {/* Mode selections */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setMode('local')}
              className={`flex-1 py-3.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                mode === 'local'
                  ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.15)] font-bold'
                  : 'border-gray-800 text-gray-500 hover:border-gray-700 bg-transparent'
              }`}
            >
              <div className="font-[var(--font-display)] text-xs tracking-widest uppercase">👥 2-Player</div>
              <div className="text-[9px] font-[var(--font-mono)] opacity-55 uppercase tracking-wider mt-0.5">Same screen</div>
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`flex-1 py-3.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                mode === 'ai'
                  ? 'border-[#b47eff] bg-[#b47eff]/10 text-[#b47eff] shadow-[0_0_12px_rgba(180,126,255,0.15)] font-bold'
                  : 'border-gray-800 text-gray-500 hover:border-gray-700 bg-transparent'
              }`}
            >
              <div className="font-[var(--font-display)] text-xs tracking-widest uppercase">🤖 vs AI</div>
              <div className="text-[9px] font-[var(--font-mono)] opacity-55 uppercase tracking-wider mt-0.5">Minimax engine</div>
            </button>
          </div>

          {/* AI Difficulty dropdown */}
          <AnimatePresence>
            {mode === 'ai' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2 overflow-hidden border-t border-gray-900/60 pt-4"
              >
                <div className="text-[10px] text-gray-500 font-[var(--font-mono)] uppercase tracking-widest text-left pl-1">
                  Difficulty Level
                </div>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => {
                    const diffColors = {
                      easy: 'border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.1)]',
                      medium: 'border-[#ff8c00]/50 bg-[#ff8c00]/10 text-[#ff8c00] shadow-[0_0_8px_rgba(255,140,0,0.1)]',
                      hard: 'border-[#ff3366]/50 bg-[#ff3366]/10 text-[#ff3366] shadow-[0_0_8px_rgba(255,51,102,0.1)]',
                    };
                    return (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`flex-1 py-2 rounded-lg border text-[10px] font-[var(--font-display)] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                          difficulty === diff
                            ? diffColors[diff] + ' font-bold'
                            : 'border-gray-800 text-gray-600 hover:border-gray-700 bg-transparent'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Rules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4.5 w-full text-left"
        >
          {/* Card 1: Superposition */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: 'rgba(255,255,255,0.01)',
              borderColor: 'rgba(0, 212, 255, 0.08)',
            }}
          >
            <div className="text-[#00d4ff] font-[var(--font-display)] text-sm tracking-widest uppercase mb-2 font-bold">
              ψ Superposition
            </div>
            <ul className="text-gray-400 text-[10px] font-[var(--font-mono)] space-y-1 uppercase tracking-wide">
              <li>• Split your pieces into 2 states</li>
              <li>• Ghosts spawn at target squares</li>
              <li>• Wave collapses during attacks</li>
            </ul>
          </div>

          {/* Card 2: Time Travel */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: 'rgba(255,255,255,0.01)',
              borderColor: 'rgba(255, 51, 102, 0.08)',
            }}
          >
            <div className="text-[#ff3366] font-[var(--font-display)] text-sm tracking-widest uppercase mb-2 font-bold">
              ⏮ Chronos Drive
            </div>
            <ul className="text-gray-400 text-[10px] font-[var(--font-mono)] space-y-1 uppercase tracking-wide">
              <li>• Undo the timeline by 3 plies</li>
              <li>• Erase opponent tactical shifts</li>
              <li>• One rewinding charge per game</li>
            </ul>
          </div>

          {/* Card 3: Portals */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background: 'rgba(255,255,255,0.01)',
              borderColor: 'rgba(255, 140, 0, 0.08)',
            }}
          >
            <div className="text-[#ff8c00] font-[var(--font-display)] text-sm tracking-widest uppercase mb-2 font-bold">
              🌀 Wormholes
            </div>
            <ul className="text-gray-400 text-[10px] font-[var(--font-mono)] space-y-1 uppercase tracking-wide">
              <li>• Four connected portal tiles</li>
              <li>• Exit the linked coordinates</li>
              <li>• Kings are blocked from entry</li>
            </ul>
          </div>
        </motion.div>

        {/* Start Game Trigger Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="px-12 py-4.5 text-xs font-[var(--font-display)] tracking-[0.25em] rounded-xl cursor-pointer border"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15))',
            borderColor: '#00d4ff',
            color: '#00d4ff',
            boxShadow: '0 0 35px rgba(0, 212, 255, 0.25)',
          }}
        >
          START GAME
        </motion.button>
      </div>
    </motion.div>
  );
}
