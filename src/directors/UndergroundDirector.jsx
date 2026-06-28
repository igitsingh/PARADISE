import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperienceStore } from '../store/useExperienceStore';
import * as THREE from 'three';
import { createSoilTexture, createNoiseTexture, createDustTexture } from '../utils/TextureGenerator';

export function UndergroundDirector() {
  const groupRef = useRef();
  
  // Procedural Soil Textures
  const soilTextures = useMemo(() => {
    const map = createSoilTexture(1024);
    const bumpMap = createNoiseTexture(1024, 1.0, true);
    return { map, bumpMap };
  }, []);

  const dotTexture = useMemo(() => createDustTexture(), []);

  // Floating Mineral Particles
  const particleCount = 2000;
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = -5 - Math.random() * 30; // from -5 down to -35
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  const matRef = useRef();
  const cavernRef = useRef();

  useFrame((state, delta) => {
    const p = useExperienceStore.getState().progression;
    if (matRef.current) {
       // Only fade in particles when diving (p > 0.95)
       const targetOpacity = p > 0.95 ? 1.0 : 0.0;
       matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 4);
    }
    
    // Slow float for particles
    if (groupRef.current) {
        groupRef.current.visible = p > 0.85; // Hide completely when not near the dive
        groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 1.0;
    }
  });

  return (
    <group ref={groupRef} name="Underground">
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particlePositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
          ref={matRef}
          size={0.06} 
          map={dotTexture}
          color="#ffbba0" 
          transparent 
          opacity={0} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* The Subterranean Cavern (Actual Soil) */}
      <mesh position={[0, -28, 0]} ref={cavernRef}>
        {/* A cylinder that acts as a deep tunnel we dive into */}
        <cylinderGeometry args={[25, 20, 50, 32, 1, true]} />
        <meshPhysicalMaterial 
          map={soilTextures.map}
          bumpMap={soilTextures.bumpMap}
          bumpScale={0.5}
          side={THREE.BackSide}
          roughness={0.9}
          metalness={0.1}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}
