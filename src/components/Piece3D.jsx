import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Piece3D = React.memo(({ piece }) => {
  const { type, color, row, col, isGhost, isSelected } = piece;

  const groupRef = useRef();
  const selectRingRef = useRef();

  // Geometries memoization
  const pawnBaseGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.22, 0.35, 16), []);
  const pawnHeadGeo = useMemo(() => new THREE.SphereGeometry(0.16, 16, 16), []);

  const rookBaseGeo = useMemo(() => new THREE.CylinderGeometry(0.2, 0.24, 0.4, 16), []);
  const rookTopGeo = useMemo(() => new THREE.BoxGeometry(0.38, 0.12, 0.38), []);

  const knightBaseGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.22, 0.25, 16), []);
  const knightTopGeo = useMemo(() => new THREE.ConeGeometry(0.18, 0.32, 8), []);

  const bishopBaseGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.2, 0.25, 16), []);
  const bishopTopGeo = useMemo(() => new THREE.ConeGeometry(0.14, 0.44, 8), []);

  const queenBaseGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.24, 0.36, 16), []);
  const queenSphereGeo = useMemo(() => new THREE.SphereGeometry(0.22, 16, 16), []);
  const queenCrownGeo = useMemo(() => new THREE.ConeGeometry(0.1, 0.12, 8), []);

  const kingBaseGeo = useMemo(() => new THREE.CylinderGeometry(0.2, 0.26, 0.4, 16), []);
  const kingCrossVGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.22, 0.08), []);
  const kingCrossHGeo = useMemo(() => new THREE.BoxGeometry(0.18, 0.08, 0.08), []);

  const ghostHaloGeo = useMemo(() => new THREE.RingGeometry(0.35, 0.42, 32), []);
  const selectRingGeo = useMemo(() => new THREE.RingGeometry(0.35, 0.42, 32), []);

  // Material creation
  const material = useMemo(() => {
    if (isGhost) {
      return new THREE.MeshStandardMaterial({
        color: '#0088ff',
        emissive: '#0044ff',
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.35,
        metalness: 0.2,
        roughness: 0.5,
      });
    }
    if (color === 'w') {
      return new THREE.MeshStandardMaterial({
        color: '#e8e0d0',
        metalness: 0.3,
        roughness: 0.5,
      });
    } else {
      return new THREE.MeshStandardMaterial({
        color: '#1a1a2e',
        metalness: 0.5,
        roughness: 0.3,
      });
    }
  }, [isGhost, color]);

  // Clean up all Three.js WebGL resource allocations on unmount
  useEffect(() => {
    return () => {
      pawnBaseGeo.dispose();
      pawnHeadGeo.dispose();
      rookBaseGeo.dispose();
      rookTopGeo.dispose();
      knightBaseGeo.dispose();
      knightTopGeo.dispose();
      bishopBaseGeo.dispose();
      bishopTopGeo.dispose();
      queenBaseGeo.dispose();
      queenSphereGeo.dispose();
      queenCrownGeo.dispose();
      kingBaseGeo.dispose();
      kingCrossVGeo.dispose();
      kingCrossHGeo.dispose();
      ghostHaloGeo.dispose();
      selectRingGeo.dispose();
      material.dispose();
    };
  }, [
    pawnBaseGeo, pawnHeadGeo, rookBaseGeo, rookTopGeo,
    knightBaseGeo, knightTopGeo, bishopBaseGeo, bishopTopGeo,
    queenBaseGeo, queenSphereGeo, queenCrownGeo,
    kingBaseGeo, kingCrossVGeo, kingCrossHGeo,
    ghostHaloGeo, selectRingGeo, material
  ]);

  // Frame animations
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Lerp y position based on selection: 0.55 when selected, 0.25 when standard
    const targetY = isSelected ? 0.55 : 0.25;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12);

    // Pulse emissiveIntensity for ghost wavefunctions by traversing group meshes safely
    if (isGhost) {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissiveIntensity = Math.sin(time * 3) * 0.3 + 0.6;
        }
      });
    }

    // Spin selection base ring
    if (isSelected && selectRingRef.current) {
      selectRingRef.current.rotation.z = time * 2;
    }
  });

  // Render sub-geometries based on piece type
  const renderGeometries = () => {
    if (type === 'p') {
      return (
        <group>
          <mesh geometry={pawnBaseGeo} material={material} castShadow receiveShadow position={[0, 0, 0]} />
          <mesh geometry={pawnHeadGeo} material={material} castShadow receiveShadow position={[0, 0.22, 0]} />
        </group>
      );
    }
    if (type === 'r') {
      return (
        <group>
          <mesh geometry={rookBaseGeo} material={material} castShadow receiveShadow position={[0, 0, 0]} />
          <mesh geometry={rookTopGeo} material={material} castShadow receiveShadow position={[0, 0.24, 0]} />
        </group>
      );
    }
    if (type === 'n') {
      return (
        <group>
          <mesh geometry={knightBaseGeo} material={material} castShadow receiveShadow position={[0, -0.075, 0]} />
          <mesh geometry={knightTopGeo} material={material} castShadow receiveShadow position={[0, 0.12, 0]} rotation={[0.35, 0, 0]} />
        </group>
      );
    }
    if (type === 'b') {
      return (
        <group>
          <mesh geometry={bishopBaseGeo} material={material} castShadow receiveShadow position={[0, -0.075, 0]} />
          <mesh geometry={bishopTopGeo} material={material} castShadow receiveShadow position={[0, 0.22, 0]} />
        </group>
      );
    }
    if (type === 'q') {
      return (
        <group>
          <mesh geometry={queenBaseGeo} material={material} castShadow receiveShadow position={[0, -0.05, 0]} />
          <mesh geometry={queenSphereGeo} material={material} castShadow receiveShadow position={[0, 0.18, 0]} />
          <mesh geometry={queenCrownGeo} material={material} castShadow receiveShadow position={[0, 0.32, 0]} />
        </group>
      );
    }
    if (type === 'k') {
      return (
        <group>
          <mesh geometry={kingBaseGeo} material={material} castShadow receiveShadow position={[0, 0, 0]} />
          <mesh geometry={kingCrossVGeo} material={material} castShadow receiveShadow position={[0, 0.26, 0]} />
          <mesh geometry={kingCrossHGeo} material={material} castShadow receiveShadow position={[0, 0.3, 0]} />
        </group>
      );
    }
    return null;
  };

  return (
    // Ghost pieces set raycast to null to prevent blocking clicks on squares beneath them
    <group
      ref={groupRef}
      position={[col - 3.5, isSelected ? 0.55 : 0.25, row - 3.5]}
      raycast={isGhost ? () => null : undefined}
    >
      <group scale={[1.2, 1.2, 1.2]}>
        {renderGeometries()}
      </group>

      {/* Selected Spin Green Ring at Base */}
      {isSelected && (
        <mesh
          ref={selectRingRef}
          position={[0, -0.22, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={selectRingGeo}
        >
          <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Ghost Halo Floor Overlay */}
      {isGhost && (
        <mesh
          position={[0, -0.23, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={ghostHaloGeo}
        >
          <meshBasicMaterial color="#00ccff" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
});

Piece3D.displayName = 'Piece3D';

export default Piece3D;
