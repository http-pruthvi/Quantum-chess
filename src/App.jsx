import { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import useQuantumStore from './store/quantumStore';
import StartScreen from './components/StartScreen';
import Board3D from './components/Board3D';
import QuantumHUD from './components/QuantumHUD';
import TimelineHUD from './components/TimelineHUD';
import GameInfo from './components/GameInfo';
import WinScreen from './components/WinScreen';

export default function App() {
  const initGame = useQuantumStore((s) => s.initGame);
  const cancelSuperposition = useQuantumStore((s) => s.cancelSuperposition);

  const gameMode = useQuantumStore((s) => s.gameMode);
  const setGameMode = useQuantumStore((s) => s.setGameMode);
  const currentTurn = useQuantumStore((s) => s.currentTurn);
  const aiColor = useQuantumStore((s) => s.aiColor);
  const gamePhase = useQuantumStore((s) => s.gamePhase);
  const triggerAIMove = useQuantumStore((s) => s.triggerAIMove);

  // Trigger AI move automatically when it is the AI opponent's turn
  useEffect(() => {
    if (gameMode === 'ai' && currentTurn === aiColor && gamePhase === 'playing') {
      const timeout = setTimeout(() => {
        triggerAIMove();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [currentTurn, gameMode, aiColor, gamePhase, triggerAIMove]);

  // Bind Escape keyboard shortcut to cancel active split coordinates selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cancelSuperposition();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cancelSuperposition]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#080c18] font-[var(--font-body)] text-white select-none">
      <AnimatePresence mode="wait">
        {gamePhase === 'start' ? (
          <StartScreen key="start-screen" />
        ) : (
          <motion.div
            key="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* 3D WebGL Base Canvas */}
            <Board3D />

            {/* Left Column Controls */}
            <QuantumHUD />

            {/* Right Column Controls */}
            <TimelineHUD />

            {/* Top Center Title Header */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              <div
                className="w-[280px] py-3 rounded-2xl border text-center flex flex-col gap-1 items-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(8, 12, 24, 0.8), rgba(15, 20, 35, 0.5))',
                  backdropFilter: 'blur(12px)',
                  borderColor: 'rgba(0, 212, 255, 0.15)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 212, 255, 0.05)',
                }}
              >
                <h1
                  className="text-lg font-[var(--font-display)] font-bold tracking-[0.25em] glow-text text-[#00d4ff]"
                  style={{ textShadow: '0 0 10px rgba(0, 212, 255, 0.35)' }}
                >
                  QUANTUM CHESS
                </h1>
                <span className="text-[9px] font-[var(--font-mono)] text-gray-500 uppercase tracking-widest">
                  3D Edition
                </span>

                {/* Mode Selector Panel */}
                <div className="border-t border-gray-800/40 w-[90%] my-1.5" />
                <div className="flex justify-center gap-2.5 px-3 pb-0.5">
                  <button
                    onClick={() => {
                      setGameMode('local');
                      initGame();
                    }}
                    className={`px-3 py-1 rounded-md text-[9px] font-[var(--font-display)] tracking-wider border transition-all cursor-pointer ${
                      gameMode === 'local'
                        ? 'border-[#00d4ff]/60 bg-[#00d4ff]/10 text-[#00d4ff]'
                        : 'border-gray-800 text-gray-500 hover:border-gray-700 bg-transparent'
                    }`}
                  >
                    👥 LOCAL
                  </button>
                  <button
                    onClick={() => {
                      setGameMode('ai');
                      initGame();
                    }}
                    className={`px-3 py-1 rounded-md text-[9px] font-[var(--font-display)] tracking-wider border transition-all cursor-pointer ${
                      gameMode === 'ai'
                        ? 'border-[#b47eff]/60 bg-[#b47eff]/10 text-[#b47eff]'
                        : 'border-gray-800 text-gray-500 hover:border-gray-700 bg-transparent'
                    }`}
                  >
                    🤖 VS AI
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Status bar */}
            <GameInfo />

            {/* Endgame scorecard Win/Stalemate screen overlay */}
            <WinScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
