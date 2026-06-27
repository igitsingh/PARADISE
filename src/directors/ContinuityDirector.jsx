import { useFrame, useThree } from '@react-three/fiber';
import { useExperienceStore } from '../store/useExperienceStore';

export function ContinuityDirector() {
  const { scene } = useThree();

  useFrame((state, delta) => {
    const p = useExperienceStore.getState().progression;
    
    let targetFogFar = 50; 
    let targetFogNear = 5;

    if (p < 0.3) {
      // Beat 1: At the Paradise House
      // Atmosphere is present but the house is clearly visible
      targetFogFar = 40;
      targetFogNear = 5;
    } 
    else if (p < 0.6) {
      // Transition: The Dive
      // Fog becomes intensely dense to physically swallow the geometry as the camera passes through it
      targetFogFar = 10;
      targetFogNear = 0;
    } 
    else {
      // Beat 2: Region 2 (Earth Crust)
      // Fog opens up to reveal the massive scale of the crust
      targetFogFar = 80;
      targetFogNear = 20;
    }

    if (scene.fog) {
      scene.fog.far += (targetFogFar - scene.fog.far) * delta * 2.0;
      scene.fog.near += (targetFogNear - scene.fog.near) * delta * 2.0;
    }
  });

  return (
    <group name="ContinuitySystems">
      {/* Fog manages all environmental masking seamlessly */}
    </group>
  );
}
