import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  EffectComposer, 
  Bloom, 
  Noise, 
  Vignette 
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useExperienceStore } from '../store/useExperienceStore';

export function AtmosphereDirector() {
  const debugLighting = useExperienceStore((state) => state.debugLighting);
  const { scene } = useThree();
  const noiseRef = useRef();
  
  // Set default daytime background
  useMemo(() => {
    scene.background = new THREE.Color('#cceeff');
  }, [scene]);

  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color("#cceeff"), 10, 60);
  }, [scene]);

  useFrame((state, delta) => {
    if (!scene.fog) return;
    
    const p = useExperienceStore.getState().progression;
    
    // Daytime Fog Colors
    let targetColor = new THREE.Color('#cceeff'); // Bright daytime blue
    let targetFar = 60;
    
    if (p > 0.15 && p < 0.55) {
      targetColor = new THREE.Color('#99aacc'); // Soft pastel overcast blue/grey
      targetFar = 30; // Dense rain fog
    } else if (p > 0.55) {
      targetColor = new THREE.Color('#ddccbb'); // Dusty warm pastel yellow/orange
      targetFar = 35; // Dense wind fog
    }

    scene.fog.color.lerp(targetColor, delta * 2);
    scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, targetFar, delta * 1.5);
  });

  return (
    <>
      {!debugLighting && (
        <EffectComposer disableNormalPass multisampling={4}>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
          <Noise blendFunction={BlendFunction.SCREEN} opacity={0.04} premultiply />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
}
