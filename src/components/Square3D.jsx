import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useQuantumStore from '../store/quantumStore';
import { coordsToSquare } from '../engine/chessEngine';

const Square3D = React.memo(({ row, col, isSelected, isValidMove, isWormhole }) => {
  const selectSquare = useQuantumStore((s) => s.selectSquare);
  const [hovered, setHovered] = useState(false);
  const matRef = useRef();
  const ringRef = useRef();

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    // Convert coordinate indices to algebraic notation (e.g. e4) to pass to the store
    const square = coordsToSquare(col, row);
    selectSquare(square);
  }, [row, col, selectSquare]);

  // Alternating light/dark square colors
  const baseColor = (row + col) % 2 === 0 ? '#1a1f3a' : '#2d3561';

  // Emissive color
  const emissiveColor = useMemo(() => {
    if (isSelected) return '#00ff88';
    if (isWormhole) return '#ff4400';
    return '#ffffff';
  }, [isSelected, isWormhole]);

  // Emissive base intensity
  const emissiveIntensityVal = useMemo(() => {
    if (isSelected) return 0.8;
    if (isWormhole) return hovered ? 0.75 : 0.5;
    return hovered ? 0.25 : 0.0;
  }, [isSelected, isWormhole, hovered]);

  // Handle pulse animation for selection on useFrame
  useFrame((state) => {
    if (!matRef.current) return;
    if (isSelected) {
      const time = state.clock.getElapsedTime();
      // Oscillate emissiveIntensity between 0.4 and 1.2 at speed 2
      matRef.current.emissiveIntensity = 0.8 + Math.sin(time * 2) * 0.4;
    }
  });

  // Handle ring rotation on useFrame
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.8;
    }
  });

  // ring geometry resource memoization and unmount cleanup
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.35, 0.45, 32), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(0.95, 0.1, 0.95), []);

  useEffect(() => {
    return () => {
      ringGeo.dispose();
      boxGeo.dispose();
    };
  }, [ringGeo, boxGeo]);

  return (
    <group>
      {/* Base Square Box */}
      <mesh
        position={[col - 3.5, 0, row - 3.5]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        geometry={boxGeo}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          ref={matRef}
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensityVal}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* Valid Move Indicator Ring */}
      {isValidMove && (
        <mesh
          ref={ringRef}
          position={[col - 3.5, 0.06, row - 3.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={ringGeo}
        >
          <meshStandardMaterial
            color="#ffcc00"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            emissive="#ffcc00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
});

Square3D.displayName = 'Square3D';

export default Square3D;
