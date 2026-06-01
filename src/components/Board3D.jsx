import { useMemo, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Square3D from './Square3D';
import Piece3D from './Piece3D';
import Wormhole3D from './Wormhole3D';
import useQuantumStore from '../store/quantumStore';
import { squareToCoords, coordsToSquare } from '../engine/chessEngine';

// Pre-generate 1200 star coordinates globally (runs once at module level)
const STAR_POSITIONS = new Float32Array(1200 * 3);
for (let i = 0; i < 1200; i++) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = 80;
  STAR_POSITIONS[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  STAR_POSITIONS[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  STAR_POSITIONS[i * 3 + 2] = r * Math.cos(phi);
}

// Starfield background component
function Starfield() {
  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(STAR_POSITIONS, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      starGeo.dispose();
    };
  }, [starGeo]);

  return (
    <points geometry={starGeo} renderOrder={-1}>
      <pointsMaterial 
        color="#ffffff" 
        size={0.12} 
        sizeAttenuation={true} 
        opacity={1.0} 
        transparent={false} 
      />
    </points>
  );
}

// Helper to parse FEN into pieces array
function parseFen(fen) {
  const parts = fen.split(' ');
  const boardPart = parts[0];
  const rows = boardPart.split('/');
  const pieces = [];

  for (let fRow = 0; fRow < 8; fRow++) {
    const row = 7 - fRow; // row = 0 is rank 1, row = 7 is rank 8
    let col = 0;
    const rowStr = rows[fRow];

    for (let charIdx = 0; charIdx < rowStr.length; charIdx++) {
      const ch = rowStr[charIdx];
      if (ch >= '1' && ch <= '8') {
        col += parseInt(ch);
      } else {
        const color = ch === ch.toUpperCase() ? 'w' : 'b';
        const type = ch.toLowerCase();
        pieces.push({
          type,
          color,
          row,
          col,
          isGhost: false,
          isSelected: false,
        });
        col++;
      }
    }
  }
  return pieces;
}

function BoardScene() {
  const fen = useQuantumStore((s) => s.fen);
  const superpositions = useQuantumStore((s) => s.superpositions);
  const selectedSquare = useQuantumStore((s) => s.selectedSquare);
  const validMoves = useQuantumStore((s) => s.validMoves);
  const wormholePairs = useQuantumStore((s) => s.wormholePairs);
  const superpositionMode = useQuantumStore((s) => s.superpositionMode);
  const splitSourceSquare = useQuantumStore((s) => s.splitSourceSquare);

  const effectiveSelected = superpositionMode ? splitSourceSquare : selectedSquare;

  // Generate 8x8 squares
  const squares = useMemo(() => {
    const list = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sqName = coordsToSquare(col, row);
        list.push({ row, col, square: sqName });
      }
    }
    return list;
  }, []);

  // Compute standard and ghost pieces
  const pieces = useMemo(() => {
    const fenPieces = parseFen(fen);

    // Identify squares that are in superposition
    const superposedSquares = new Set();
    superpositions.forEach((sp) => {
      superposedSquares.add(sp.realSquare);
      superposedSquares.add(sp.ghostSquare);
    });

    // Filter out standard pieces that are superposed
    const normalPieces = fenPieces.filter((p) => {
      const sq = coordsToSquare(p.col, p.row);
      return !superposedSquares.has(sq);
    });

    // Create ghost piece items
    const ghostPieceItems = [];
    superpositions.forEach((sp) => {
      const type = sp.pieceId.split('_')[0];
      const color = sp.owner;

      // Ghost at real square
      const realCoords = squareToCoords(sp.realSquare);
      ghostPieceItems.push({
        type,
        color,
        row: realCoords.row,
        col: realCoords.col,
        isGhost: true,
        superpositionId: sp.id,
      });

      // Ghost at ghost square
      const ghostCoords = squareToCoords(sp.ghostSquare);
      ghostPieceItems.push({
        type,
        color,
        row: ghostCoords.row,
        col: ghostCoords.col,
        isGhost: true,
        superpositionId: sp.id,
      });
    });

    return [...normalPieces, ...ghostPieceItems].map((p) => {
      const sq = coordsToSquare(p.col, p.row);
      return {
        ...p,
        isSelected: effectiveSelected === sq,
      };
    });
  }, [fen, superpositions, effectiveSelected]);

  // Compute wormhole layouts
  const wormholes = useMemo(() => {
    const list = [];
    wormholePairs.forEach((pair, idx) => {
      const color = idx === 0 ? 'orange' : 'red';
      const aCoords = squareToCoords(pair.a);
      const bCoords = squareToCoords(pair.b);

      const aPos = [aCoords.col - 3.5, 0.15, aCoords.row - 3.5];
      const bPos = [bCoords.col - 3.5, 0.15, bCoords.row - 3.5];

      list.push({
        key: `wh_${pair.a}`,
        position: aPos,
        color,
        linkedPosition: bPos,
        square: pair.a,
      });
      list.push({
        key: `wh_${pair.b}`,
        position: bPos,
        color,
        linkedPosition: aPos,
        square: pair.b,
      });
    });
    return list;
  }, [wormholePairs]);

  const wormholeSquareSet = useMemo(() => {
    const s = new Set();
    wormholePairs.forEach((p) => { s.add(p.a); s.add(p.b); });
    return s;
  }, [wormholePairs]);

  return (
    <>
      {/* Subtle board base platform under the squares */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.15, 8.4]} />
        <meshStandardMaterial 
          color="#0d1128" 
          metalness={0.4} 
          roughness={0.8}
        />
      </mesh>

      {/* Main key light */}
      <directionalLight 
        position={[4, 10, 6]} 
        intensity={1.4} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Ambient fill */}
      <ambientLight intensity={0.35} color="#1a2040" />

      {/* Blue rim light from back-left */}
      <pointLight position={[-6, 5, -6]} intensity={0.8} color="#2244ff" />

      {/* Warm accent from front-right */}
      <pointLight position={[6, 4, 6]} intensity={0.5} color="#ff8844" />

      {/* Dedicated under-glow for black pieces */}
      <pointLight position={[0, 1, -3.5]} intensity={0.9} color="#4466ee" />

      {/* Dedicated point light inside Board3D for black pieces */}
      <pointLight position={[0, 3, -4]} intensity={1.2} color="#6688ff" />

      {/* Wormhole atmosphere glow */}
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#ff4400" />

      {/* Starfield Background */}
      <Starfield />

      {/* 8x8 Grid of Squares */}
      {squares.map(({ row, col, square }) => (
        <Square3D
          key={square}
          row={row}
          col={col}
          isSelected={effectiveSelected === square}
          isValidMove={validMoves.includes(square)}
          isWormhole={wormholeSquareSet.has(square)}
        />
      ))}

      {/* Chess Pieces */}
      {pieces.map((p) => (
        <Piece3D
          key={`piece_${p.col}_${p.row}`}
          piece={p}
        />
      ))}

      {/* Wormholes */}
      {wormholes.map((w) => (
        <Wormhole3D
          key={w.key}
          position={w.position}
          color={w.color}
          linkedPosition={w.linkedPosition}
        />
      ))}

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2.2}
        enablePan={false}
        minDistance={8}
        maxDistance={22}
      />
    </>
  );
}

export default function Board3D() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        shadows={true}
        camera={{ position: [0, 14, 12], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020408']} />
        <fog attach="fog" args={['#020408', 18, 45]} />
        <Suspense fallback={null}>
          <BoardScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
