import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Wormhole3D({ position, color = 'orange' }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const coreRef = useRef();
  const particlesRef = useRef();
  const coreMatRef = useRef();

  // Memoize geometries for performance
  const outerGeo = useMemo(() => new THREE.TorusGeometry(0.42, 0.04, 8, 32), []);
  const innerGeo = useMemo(() => new THREE.TorusGeometry(0.28, 0.03, 8, 32), []);
  const coreGeo = useMemo(() => new THREE.SphereGeometry(0.12, 16, 16), []);
  const particleGeo = useMemo(() => new THREE.SphereGeometry(0.025, 8, 8), []);

  useEffect(() => {
    return () => {
      outerGeo.dispose();
      innerGeo.dispose();
      coreGeo.dispose();
      particleGeo.dispose();
    };
  }, [outerGeo, innerGeo, coreGeo, particleGeo]);

  // Color mapping based on prop
  const theme = useMemo(() => {
    if (color === 'red') {
      return {
        outerColor: '#ff0033',
        outerEmissive: '#ff0044',
        innerEmissive: '#ff00aa',
        coreEmissive: '#ff0055',
        particleColor: '#ff0088',
      };
    }
    // Default orange
    return {
      outerColor: '#ff4400',
      outerEmissive: '#ff6600',
      innerEmissive: '#ffaa00',
      coreEmissive: '#ff8800',
      particleColor: '#ffa000',
    };
  }, [color]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate outer ring at 1.2 rad/s
    if (outerRef.current) {
      outerRef.current.rotation.z = time * 1.2;
    }

    // Rotate inner ring opposite at 1.8 rad/s
    if (innerRef.current) {
      innerRef.current.rotation.z = -time * 1.8;
    }

    // Orbit particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 1.5;
    }

    // Pulse core scale and intensity
    if (coreRef.current) {
      const scale = 1.0 + Math.sin(time * 4) * 0.15;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 2.0 + Math.sin(time * 4) * 0.5;
    }
  });

  // Calculate 8 particles spaced evenly
  const particles = useMemo(() => {
    const list = [];
    const radius = 0.35;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      list.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return list;
  }, []);

  return (
    <group position={position}>
      {/* Outer Ring */}
      <mesh
        ref={outerRef}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={outerGeo}
        castShadow
      >
        <meshStandardMaterial
          color={theme.outerColor}
          emissive={theme.outerEmissive}
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Inner Ring */}
      <mesh
        ref={innerRef}
        rotation={[Math.PI / 2, 0, 0]}
        geometry={innerGeo}
        castShadow
      >
        <meshStandardMaterial
          color={theme.outerColor}
          emissive={theme.innerEmissive}
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Center Glow Core */}
      <mesh
        ref={coreRef}
        geometry={coreGeo}
      >
        <meshStandardMaterial
          ref={coreMatRef}
          color={theme.outerColor}
          emissive={theme.coreEmissive}
          emissiveIntensity={2.0}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Orbiting Particle Cluster */}
      <group ref={particlesRef}>
        {particles.map((pos, idx) => (
          <mesh
            key={idx}
            position={pos}
            geometry={particleGeo}
          >
            <meshBasicMaterial color={theme.particleColor} />
          </mesh>
        ))}
      </group>

      {/* Glow Point Light */}
      <pointLight color={theme.coreEmissive} intensity={0.6} distance={1.8} position={[0, 0.2, 0]} />
    </group>
  );
}
