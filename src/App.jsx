import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useQuantumStore from './store/quantumStore';
import StartScreen from './components/StartScreen';
import Board3D from './components/Board3D';
import QuantumHUD from './components/QuantumHUD';
import TimelineHUD from './components/TimelineHUD';
import GameInfo from './components/GameInfo';
import WinScreen from './components/WinScreen';

const MenuScreen = StartScreen;

export default function App() {
  const { gameStatus, initGame, gamePhase } = useQuantumStore();
  const gameScreen = gamePhase === 'start' ? 'menu' : 'playing';

  const gameMode = useQuantumStore((s) => s.gameMode);
  const currentTurn = useQuantumStore((s) => s.currentTurn);
  const aiColor = useQuantumStore((s) => s.aiColor);
  const triggerAIMove = useQuantumStore((s) => s.triggerAIMove);

  // Initialize board parameters on mount, but reset phase to start to keep menu active
  useEffect(() => {
    initGame();
    useQuantumStore.setState({ gamePhase: 'start' });
  }, [initGame]);

  // Handle Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        const state = useQuantumStore.getState();
        if (state.cancelActiveMode) {
          state.cancelActiveMode();
        } else if (state.cancelSuperposition) {
          state.cancelSuperposition();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Trigger AI move automatically when it is the AI opponent's turn
  useEffect(() => {
    if (gameMode === 'ai' && currentTurn === aiColor && gamePhase === 'playing') {
      const timeout = setTimeout(() => {
        triggerAIMove();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [currentTurn, gameMode, aiColor, gamePhase, triggerAIMove]);

  if (gameScreen === 'menu') return <MenuScreen />;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 3D Scene — full screen base layer */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Board3D />
      </div>

      {/* Left HUD */}
      <div style={{ 
        position: 'fixed', left: 0, top: 0, 
        height: '100vh', width: '220px',
        zIndex: 10, pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto', height: '100%' }}>
          <QuantumHUD />
        </div>
      </div>

      {/* Right HUD */}
      <div style={{ 
        position: 'fixed', right: 0, top: 0, 
        height: '100vh', width: '220px',
        zIndex: 10, pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto', height: '100%' }}>
          <TimelineHUD />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: '220px', 
        right: '220px', zIndex: 10 
      }}>
        <GameInfo />
      </div>

      {/* Top title bar */}
      <div style={{
        position: 'fixed', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0,204,255,0.2)',
        borderRadius: '12px',
        padding: '8px 24px'
      }}>
        <div style={{ 
          fontSize: '14px', fontWeight: 700, 
          letterSpacing: '0.15em', color: '#00ccff',
          textShadow: '0 0 10px #00ccff'
        }}>
          QUANTUM CHESS
        </div>
        <div style={{ 
          fontSize: '10px', color: 'rgba(150,180,255,0.6)',
          letterSpacing: '0.1em'
        }}>
          3D EDITION
        </div>
      </div>

      {/* Win screen */}
      <AnimatePresence>
        {(gameStatus === 'checkmate' || gameStatus === 'stalemate') && (
          <WinScreen />
        )}
      </AnimatePresence>

    </div>
  );
}
