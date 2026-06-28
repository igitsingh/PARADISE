import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '../store/useExperienceStore';
import { createRainTexture, createDustTexture, createWindTexture } from '../utils/TextureGenerator';

export function WeatherDirector() {
  const rainPointsRef = useRef();
  const dustPointsRef = useRef();
  
  // Rain particles (Vertical streaks)
  const rainCount = 50000;
  const rainPositions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;     // x spread
      pos[i * 3 + 1] = (Math.random() * 100) - 5;   // perfectly distributed y height from -5 to 95
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
        positions[i * 3 + 1] -= delta * 120; // Heavy storm fall speed
        positions[i * 3] -= delta * 15;      // Heavy wind slant
        if (positions[i * 3 + 1] < -5) {
          // Perfectly wrap around the vertical space to maintain the exact initial random distribution forever
          positions[i * 3 + 1] += 100; 
          // We can also re-randomize X/Z slightly without breaking the vertical distribution
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

    // Animate Wind/Debris (Fierce horizontal blowing across the screen)
    if (dustPointsRef.current) {
      const positions = dustPointsRef.current.geometry.attributes.position.array;
      
      // Calculate the perfect left-to-right vector for the camera's wind state angle (Math.PI * 0.35)
      const windAngle = Math.PI * 0.35;
      const dirX = Math.cos(windAngle);
      const dirZ = -Math.sin(windAngle);

      for (let i = 0; i < dustCount; i++) {
        const speed = delta * (80 + Math.random() * 40);
        positions[i * 3] += dirX * speed;
        positions[i * 3 + 2] += dirZ * speed;
        
        // Wrap around 160x160 area
        if (positions[i * 3] > 80) positions[i * 3] -= 160;
        else if (positions[i * 3] < -80) positions[i * 3] += 160;
        
        if (positions[i * 3 + 2] > 80) positions[i * 3 + 2] -= 160;
        else if (positions[i * 3 + 2] < -80) positions[i * 3 + 2] += 160;
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
          size={2.0} 
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
