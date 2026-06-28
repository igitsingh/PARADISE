import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useExperienceStore } from '../store/useExperienceStore';
import * as THREE from 'three';

export function LightingDirector() {
  const { gl, scene } = useThree();
  const debugLighting = useExperienceStore((state) => state.debugLighting);

  const defaultColor = new THREE.Color("#fff5e6"); // Bright warm sun
  const rainColor = new THREE.Color("#ccddff");    // Cool overcast daylight
  const windColor = new THREE.Color("#0a1525");    // Cool night dark blue
  const soilColor = new THREE.Color("#ff8833");    // Warm deep soil glow
  const magmaColor = new THREE.Color("#ff3300");   // Fiery red/orange deep earth magma
  
  // Create lights once
  const { directionalLight, ambientLight } = useMemo(() => {
    const dirLight = new THREE.DirectionalLight("#fff5e6", 3.0); // Much brighter sun
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;

    const ambLight = new THREE.AmbientLight("#cceeff", 1.5); // Bright blue sky ambient

    return { directionalLight: dirLight, ambientLight: ambLight };
  }, []);

  useEffect(() => {
    if (!debugLighting) {
      scene.add(directionalLight);
      scene.add(ambientLight);
    }
    return () => {
      scene.remove(directionalLight);
      scene.remove(ambientLight);
    };
  }, [scene, directionalLight, ambientLight, debugLighting]);

  useFrame((state, delta) => {
    if (debugLighting) {
      gl.toneMappingExposure = 1.0;
      return;
    }
    
    // Dynamic Exposure (can just stay at 1.0 for daytime)
    gl.toneMappingExposure += (1.0 - gl.toneMappingExposure) * delta * 1.5;

    const p = useExperienceStore.getState().progression;
    
    let targetColor = defaultColor;
    let targetIntensity = 3.0;
    let targetAmbient = 1.5;
    
    if (p >= 0.15 && p <= 0.55) {
        let intensityFactor = 0;
        if (p < 0.30) {
           intensityFactor = ((p - 0.15) / 0.15); 
        } else if (p <= 0.45) {
           intensityFactor = 1.0; 
        } else {
           intensityFactor = (1 - (p - 0.45) / 0.10); 
        }
        
        targetColor = defaultColor.clone().lerp(rainColor, intensityFactor);
        targetIntensity = THREE.MathUtils.lerp(3.0, 1.2, intensityFactor); // Dims slightly but stays daylight
        targetAmbient = THREE.MathUtils.lerp(1.5, 0.8, intensityFactor);
    } else if (p >= 0.55 && p <= 1.0) {
        let intensityFactor = 0;
        if (p < 0.70) {
           intensityFactor = ((p - 0.55) / 0.15); 
        } else {
           intensityFactor = 1.0; 
        }
        
        targetColor = defaultColor.clone().lerp(windColor, intensityFactor);
        targetIntensity = THREE.MathUtils.lerp(3.0, 0.2, intensityFactor); // Very dim moonlight
        targetAmbient = THREE.MathUtils.lerp(1.5, 0.1, intensityFactor); // Very dim ambient for night
    } else if (p > 1.0 && p <= 1.3) {
        const diveP = (p - 1.0) / 0.3;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        
        targetColor = windColor.clone().lerp(soilColor, easeDive);
        targetIntensity = THREE.MathUtils.lerp(0.2, 0.8, easeDive); // Reveal underground scene
        targetAmbient = THREE.MathUtils.lerp(0.1, 0.5, easeDive); 
    } else if (p > 1.3) {
        const diveP = Math.min((p - 1.3) / 0.7, 1.0);
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        
        targetColor = soilColor.clone().lerp(magmaColor, easeDive);
        targetIntensity = THREE.MathUtils.lerp(0.8, 2.0, easeDive); // Bright dramatic glow
        targetAmbient = THREE.MathUtils.lerp(0.5, 0.1, easeDive); // Lots of contrast
    }
    
    directionalLight.color.lerp(targetColor, delta * 2);
    directionalLight.intensity = THREE.MathUtils.lerp(directionalLight.intensity, targetIntensity, delta * 2);
    ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbient, delta * 2);
  });

  return (
    <group name="PersistentLighting">
      {debugLighting && (
        <>
          <ambientLight intensity={1} color="#ffffff" />
          <directionalLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
        </>
      )}
    </group>
  );
}
