import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import useQuantumStore from '../store/quantumStore';

// Pre-generate 80 star coordinates at module level to make rendering pure
const START_STAR_POSITIONS = Array.from({ length: 80 }, (_, idx) => ({
  id: idx,
  x: Math.random() * 100,
  y: Math.random() * 100,
  opacity: Math.random() * 0.7 + 0.1,
  size: Math.random() * 2 + 1,
}));

export default function StartScreen() {
  const initGame = useQuantumStore((s) => s.initGame);
  const setGameMode = useQuantumStore((s) => s.setGameMode);
  const setAIDifficulty = useQuantumStore((s) => s.setAIDifficulty);

  const [mode, setMode] = useState('local');
  const [difficulty, setDifficulty] = useState('medium');
  const [activeTab, setActiveTab] = useState('superposition');

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
      className="fixed inset-0 z-50 min-h-screen w-screen overflow-hidden select-none grid grid-cols-1 lg:grid-cols-12"
      style={{ background: 'radial-gradient(ellipse at center, #0b0f1d 0%, #04060c 90%)' }}
    >
      {/* Cosmic ambient nebula glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 pointer-events-none filter blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-25 pointer-events-none filter blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)' }}
      />

      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full transition-all duration-1000"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              opacity: star.opacity,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
          />
        ))}
      </div>

      {/* ─── LEFT COLUMN: BRANDING & LORE (Col span 5) ─── */}
      <div className="relative lg:col-span-5 flex flex-col justify-between p-10 lg:p-16 border-r border-gray-900/60 bg-[#060914]/50 z-10 backdrop-blur-[2px] overflow-hidden">
        {/* Futuristic Wireframe Grid Background (Left Side Only) */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.2) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Top: Branding Badge */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-ping" />
          <span className="text-[10px] font-[var(--font-mono)] text-[#00d4ff] tracking-[0.3em] uppercase">
            Simulation Ready v1.2.0
          </span>
        </div>

        {/* Middle: Cinematic Titles */}
        <div className="my-auto py-10 relative z-10">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          >
            <h1
              className="text-7xl xl:text-8xl font-[var(--font-display)] tracking-[0.22em] font-extrabold leading-none mb-1"
              style={{ color: '#00d4ff', textShadow: '0 0 30px rgba(0, 212, 255, 0.35)' }}
            >
              QUANTUM
            </h1>
            <h1
              className="text-6xl xl:text-7xl font-[var(--font-display)] tracking-[0.38em] font-extrabold leading-none mb-6"
              style={{ color: '#8b5cf6', textShadow: '0 0 35px rgba(139, 92, 246, 0.35)' }}
            >
              CHESS
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="font-[var(--font-body)] max-w-md"
            style={{
              color: 'rgba(180, 200, 255, 0.85)',
              fontSize: '14px',
              lineHeight: '1.7',
            }}
          >
            A high-dimensional battlefield where classical rules collide with quantum physics. Place pieces in superposition, warp coordinates through portals, and rewrite history using temporal rollback maneuvers.
          </motion.p>
        </div>

        {/* Bottom: Sci-Fi Diagnostic Logs */}
        <div className="relative z-10 border-t border-gray-900/60 pt-6 font-[var(--font-mono)] text-[9px] tracking-wider text-gray-500 uppercase flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-gray-400 mb-1">
            <span>⚙️ Core Diagnostics</span>
            <span className="text-[#00ff88]">System Online</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[#00ff88]">▶</span> <span>Wave Function:</span>
            <span className="text-gray-300 ml-auto font-bold">ψ_Active (2/2)</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[#ff3366]">▶</span> <span>Chronos Drive:</span>
            <span className="text-gray-300 ml-auto font-bold">Timeline_Synced</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[#ff8c00]">▶</span> <span>Spatial Portals:</span>
            <span className="text-gray-300 ml-auto font-bold">Wormholes_Stable</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[#8b5cf6]">▶</span> <span>AI Engine:</span>
            <span className="text-gray-300 ml-auto font-bold">Minimax_Ready</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: INTERACTIVE SETUP & CONFIG (Col span 7) ─── */}
      <div className="relative lg:col-span-7 flex flex-col justify-center p-8 lg:p-20 z-10 bg-[#080d19]/25 backdrop-blur-[10px] overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-xl mx-auto flex flex-col gap-8 bg-[#0a0f21]/70 border border-white/[0.05] p-8 lg:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {/* Header */}
          <div>
            <h2 
              className="text-xs font-[var(--font-display)] uppercase mb-1"
              style={{
                color: 'rgba(200, 220, 255, 0.95)',
                fontWeight: 600,
                letterSpacing: '0.08em'
              }}
            >
              Battle Setup Protocol
            </h2>
            <p 
              className="font-[var(--font-mono)] uppercase"
              style={{
                color: 'rgba(140, 160, 210, 0.7)',
                fontSize: '12px'
              }}
            >
              Select game parameters below to ignite the simulation
            </p>
          </div>

          {/* Mode Selector Cards */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Local Card */}
            <button
              onClick={() => setMode('local')}
              className="flex-1 p-5 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group cursor-pointer border"
              style={{
                border: mode === 'local' 
                  ? '1px solid rgba(0, 204, 255, 0.6)' 
                  : '1px solid rgba(0, 204, 255, 0.25)',
                background: mode === 'local' 
                  ? 'rgba(0, 136, 255, 0.18)' 
                  : 'rgba(255, 255, 255, 0.06)',
                boxShadow: mode === 'local'
                  ? '0 0 20px rgba(0, 212, 255, 0.35)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (mode !== 'local') {
                  e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.6)';
                  e.currentTarget.style.background = 'rgba(0, 136, 255, 0.12)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 204, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== 'local') {
                  e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.25)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Highlight bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 bg-[#00d4ff]" 
                style={{ display: mode === 'local' ? 'block' : 'none' }}
              />
              <div className="text-xl mb-1.5">👥</div>
              <div 
                className="font-[var(--font-display)] text-xs tracking-wider uppercase font-bold"
                style={{ color: 'rgba(220, 235, 255, 0.95)' }}
              >
                Local Pass & Play
              </div>
              <div 
                className="font-[var(--font-body)] mt-1 uppercase tracking-wide"
                style={{ color: 'rgba(150, 170, 220, 0.75)', fontSize: '12px' }}
              >
                Two players share standard screen and controls.
              </div>
            </button>

            {/* VS AI Card */}
            <button
              onClick={() => setMode('ai')}
              className="flex-1 p-5 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group cursor-pointer border"
              style={{
                border: mode === 'ai' 
                  ? '1px solid rgba(0, 204, 255, 0.6)' 
                  : '1px solid rgba(0, 204, 255, 0.25)',
                background: mode === 'ai' 
                  ? 'rgba(0, 136, 255, 0.18)' 
                  : 'rgba(255, 255, 255, 0.06)',
                boxShadow: mode === 'ai'
                  ? '0 0 20px rgba(0, 212, 255, 0.35)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (mode !== 'ai') {
                  e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.6)';
                  e.currentTarget.style.background = 'rgba(0, 136, 255, 0.12)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 204, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== 'ai') {
                  e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.25)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Highlight bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 bg-[#8b5cf6]" 
                style={{ display: mode === 'ai' ? 'block' : 'none' }}
              />
              <div className="text-xl mb-1.5">🤖</div>
              <div 
                className="font-[var(--font-display)] text-xs tracking-wider uppercase font-bold"
                style={{ color: 'rgba(220, 235, 255, 0.95)' }}
              >
                Vs Artificial Mind
              </div>
              <div 
                className="font-[var(--font-body)] mt-1 uppercase tracking-wide"
                style={{ color: 'rgba(150, 170, 220, 0.75)', fontSize: '12px' }}
              >
                Engage the quantum Minimax decision AI.
              </div>
            </button>
          </div>

          {/* AI Difficulty dropdown */}
          <AnimatePresence>
            {mode === 'ai' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-2.5 overflow-hidden"
              >
                <div className="text-[10px] text-gray-500 font-[var(--font-mono)] uppercase tracking-widest text-left">
                  Artificial Intelligence Threat Level
                </div>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => {
                    const diffColors = {
                      easy: 'border-[#00ff88]/40 bg-[#00ff88]/[0.05] text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.08)]',
                      medium: 'border-[#ff8c00]/40 bg-[#ff8c00]/[0.05] text-[#ff8c00] shadow-[0_0_10px_rgba(255,140,0,0.08)]',
                      hard: 'border-[#ff3366]/40 bg-[#ff3366]/[0.05] text-[#ff3366] shadow-[0_0_10px_rgba(255,51,102,0.08)]',
                    };
                    return (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`flex-1 py-3 rounded-xl border text-[10px] font-[var(--font-display)] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                          difficulty === diff
                            ? diffColors[diff] + ' font-bold'
                            : 'border-white/[0.04] text-gray-500 hover:border-white/[0.1] bg-transparent'
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

          {/* Rulebook Interactive Database Section */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] text-gray-500 font-[var(--font-mono)] uppercase tracking-widest text-left">
              Quantum Mechanic Database
            </div>
            
            {/* Rule Tabs */}
            <div className="flex border-b border-white/[0.05] gap-2 pb-0.5">
              {[
                { id: 'superposition', label: '⚛️ ψ Superposition' },
                { id: 'chronos', label: '⏳ Chronos Reversion' },
                { id: 'wormholes', label: '🌀 ER Wormholes' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-4 py-2 text-[10px] font-[var(--font-display)] tracking-wider uppercase rounded-lg transition-all cursor-pointer border"
                    style={{
                      background: isActive ? 'rgba(0, 136, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isActive ? '1px solid rgba(0, 204, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                      color: isActive ? '#00ccff' : 'rgba(160, 175, 210, 0.6)',
                      boxShadow: isActive ? '0 0 8px rgba(0, 204, 255, 0.3)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Rule Content Box */}
            <div className="bg-white/[0.01] border border-white/[0.03] p-4.5 rounded-2xl min-h-[110px] flex flex-col justify-between">
              {activeTab === 'superposition' && (
                <div>
                  <div className="font-[var(--font-display)] text-xs text-[#00d4ff] uppercase tracking-widest font-bold mb-1.5">
                    ψ Quantum Split
                  </div>
                  <p 
                    className="font-[var(--font-body)] leading-relaxed uppercase tracking-wide"
                    style={{
                      color: 'rgba(160, 185, 255, 0.75)',
                      borderLeft: '2px solid rgba(0, 204, 255, 0.4)',
                      paddingLeft: '10px',
                      fontSize: '13px',
                    }}
                  >
                    Place a piece into superposition. The piece splits into two states—a physical entity and a ghost shadow—across two squares. Wave functions collapse upon contact, prompting coordinates resolution.
                  </p>
                  <div className="text-[8px] font-[var(--font-mono)] text-[#00d4ff]/70 mt-3 tracking-widest uppercase">
                    Charge limit: 2 split attempts per game.
                  </div>
                </div>
              )}
              {activeTab === 'chronos' && (
                <div>
                  <div className="font-[var(--font-display)] text-xs text-[#ff3366] uppercase tracking-widest font-bold mb-1.5">
                    Temporal Rollback
                  </div>
                  <p 
                    className="font-[var(--font-body)] leading-relaxed uppercase tracking-wide"
                    style={{
                      color: 'rgba(160, 185, 255, 0.75)',
                      borderLeft: '2px solid rgba(0, 204, 255, 0.4)',
                      paddingLeft: '10px',
                      fontSize: '13px',
                    }}
                  >
                    Trigger chronos drive to roll the universe back in time by 3 full plies. Reverses tactical errors, clears board changes, and restores capturing states instantly to prior history marks.
                  </p>
                  <div className="text-[8px] font-[var(--font-mono)] text-[#ff3366]/70 mt-3 tracking-widest uppercase">
                    Charge limit: 1 time-travel charge per player.
                  </div>
                </div>
              )}
              {activeTab === 'wormholes' && (
                <div>
                  <div className="font-[var(--font-display)] text-xs text-[#ff8c00] uppercase tracking-widest font-bold mb-1.5">
                    ER Portal warp
                  </div>
                  <p 
                    className="font-[var(--font-body)] leading-relaxed uppercase tracking-wide"
                    style={{
                      color: 'rgba(160, 185, 255, 0.75)',
                      borderLeft: '2px solid rgba(0, 204, 255, 0.4)',
                      paddingLeft: '10px',
                      fontSize: '13px',
                    }}
                  >
                    Entering one of the four wormhole tiles immediately warps your piece to the linked coordinate elsewhere on the board. Kings are structurally barred to preserve gravity sync.
                  </p>
                  <div className="text-[8px] font-[var(--font-mono)] text-[#ff8c00]/70 mt-3 tracking-widest uppercase">
                    Charge limit: Infinite portal passives.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ignition Start Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-4.5 rounded-2xl font-[var(--font-display)] text-xs tracking-[0.25em] font-bold text-center border cursor-pointer select-none transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(139, 92, 246, 0.18))',
              borderColor: '#00d4ff',
              color: '#00d4ff',
              boxShadow: '0 0 35px rgba(0, 212, 255, 0.22)',
            }}
          >
            LAUNCH BATTLE SIMULATION
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

