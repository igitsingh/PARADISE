import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store/useExperienceStore';
import { createRainTexture, createDustTexture, createWindTexture } from '../utils/TextureGenerator';

export function WeatherDirector() {
  const rainPointsRef = useRef();
  const dustPointsRef = useRef();
  
  // Rain particles (Vertical streaks)
  const rainCount = 8000;
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;     // x spread
      pos[i * 3 + 1] = Math.random() * 80;          // y height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100; // z spread
    }
    return pos;
  }, []);

  // Dust/Wind particles (Swirling dots)
  const dustCount = 4000;
  const dustPositions = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 30 - 5; 
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, []);

  const { rainMap, windMap } = useMemo(() => {
    return {
      rainMap: createRainTexture(),
      windMap: createWindTexture()
    };
  }, []);

  useFrame((state, delta) => {
    const p = useExperienceStore.getState().progression;
    
    // Animate Rain (falls fast, slants slightly)
    if (rainPointsRef.current) {
      const positions = rainPointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= delta * 40; // Fall speed
        positions[i * 3] -= delta * 5;      // Wind slant
        if (positions[i * 3 + 1] < -5) {
          positions[i * 3 + 1] = 80; // Reset to top
          positions[i * 3] = (Math.random() - 0.5) * 100;
        }
      }
      rainPointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Rain Opacity logic (Peaks during left hold 0.30 - 0.45)
      let targetOpacity = 0;
      if (p >= 0.15 && p <= 0.55) {
        if (p < 0.30) {
           targetOpacity = ((p - 0.15) / 0.15) * 0.6; // Fade in
        } else if (p <= 0.45) {
           targetOpacity = 0.6; // Hold
        } else {
           targetOpacity = (1 - (p - 0.45) / 0.10) * 0.6; // Fade out
        }
      }
      rainPointsRef.current.material.opacity = THREE.MathUtils.lerp(
        rainPointsRef.current.material.opacity, 
        targetOpacity, 
        delta * 2
      );
    }

    // Animate Wind/Debris (Fierce horizontal blowing)
    if (dustPointsRef.current) {
      const positions = dustPointsRef.current.geometry.attributes.position.array;
      const time = state.clock.getElapsedTime();
      for (let i = 0; i < dustCount; i++) {
        // Fierce horizontal gale, completely horizontal
        positions[i * 3] += delta * (80 + Math.random() * 40); // Move very fast to the right
        
        if (positions[i * 3] > 60) {
          positions[i * 3] = -60; // wrap around further out
        }
      }
      dustPointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Wind Opacity logic (Peaks during right hold 0.70 - 0.85)
      let targetOpacity = 0;
      if (p >= 0.55 && p <= 1.0) {
        if (p < 0.70) {
           targetOpacity = ((p - 0.55) / 0.15) * 0.7; // Visible daytime wind
        } else if (p <= 0.85) {
           targetOpacity = 0.7; 
        } else {
           targetOpacity = (1 - (p - 0.85) / 0.15) * 0.7; 
        }
      }
      dustPointsRef.current.material.opacity = THREE.MathUtils.lerp(
        dustPointsRef.current.material.opacity, 
        targetOpacity, 
        delta * 2
      );
    }
  });

  return (
    <group name="WeatherSystems">
      <points ref={rainPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={rainCount} array={rainPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
          size={0.6} 
          map={rainMap}
          color="#aaccff" 
          transparent 
          opacity={0} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </points>

      <points ref={dustPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={dustCount} array={dustPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
          size={1.2} // Visible but not massive
          map={windMap}
          color="#e0d8cc" // Soft dusty daytime grey/tan, not pure white
          transparent 
          opacity={0} 
          depthWrite={false} 
          blending={THREE.NormalBlending} // Additive is invisible against a bright sky
        />
      </points>
    </group>
  );
}
