import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useExperienceStore } from '../store/useExperienceStore';
import * as THREE from 'three';

export function CameraDirector() {
  const { camera } = useThree();
  const targetProgression = useExperienceStore((state) => state.targetProgression);
  const pointer = useExperienceStore((state) => state.pointer);
  
  const currentProgression = useRef(0);
  const currentParallax = useRef(new THREE.Vector3());
  
  const basePosition = useRef(new THREE.Vector3(0, 2, 12)); 
  const targetLookAt = useRef(new THREE.Vector3(0, -2, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, -2, 0));
  const previousPosition = useRef(new THREE.Vector3(0, 2, 12));
  const isFirstFrame = useRef(true);

  useFrame((state, delta) => {
    // Cinematic, damped progression
    currentProgression.current = THREE.MathUtils.damp(
      currentProgression.current,
      targetProgression,
      2.0,
      delta
    );
    useExperienceStore.setState({ progression: currentProgression.current });

    const p = currentProgression.current;

    // The Epic Sweep: 4 Scroll Phases with HOLDS
    // 0.00 - 0.15: Hold Center (Default)
    // 0.15 - 0.30: Orbit Left
    // 0.30 - 0.45: HOLD LEFT (Establish Rain)
    // 0.45 - 0.55: Return to Center
    // 0.55 - 0.70: Orbit Right
    // 0.70 - 0.85: HOLD RIGHT (Establish Wind)
    // 0.85 - 1.00: Return to Center
    // 1.00 - 1.30: Dive into the Soil
    
    let targetTheta = 0;
    let targetRadius = 12; // Moved closer
    let targetHeight = 2;  // Lowered height
    
    if (p < 0.15) {
      targetTheta = 0;
    } else if (p < 0.30) {
      const localP = (p - 0.15) / 0.15;
      const ease = localP * localP * (3 - 2 * localP);
      targetTheta = THREE.MathUtils.lerp(0, -Math.PI * 0.35, ease);
    } else if (p < 0.45) {
      targetTheta = -Math.PI * 0.35; // Hold Left
    } else if (p < 0.55) {
      const localP = (p - 0.45) / 0.10;
      const ease = localP * localP * (3 - 2 * localP);
      targetTheta = THREE.MathUtils.lerp(-Math.PI * 0.35, 0, ease);
    } else if (p < 0.70) {
      const localP = (p - 0.55) / 0.15;
      const ease = localP * localP * (3 - 2 * localP);
      targetTheta = THREE.MathUtils.lerp(0, Math.PI * 0.35, ease);
    } else if (p < 0.85) {
      targetTheta = Math.PI * 0.35; // Hold Right
    } else if (p < 1.0) {
      const localP = (p - 0.85) / 0.15;
      const ease = localP * localP * (3 - 2 * localP);
      targetTheta = THREE.MathUtils.lerp(Math.PI * 0.35, 0, ease);
    } else {
      targetTheta = 0; // Hold center while diving
    }

    let targetX = targetRadius * Math.sin(targetTheta);
    let targetZ = targetRadius * Math.cos(targetTheta);
    let targetY = targetHeight;

    if (p >= 1.0) {
      if (p <= 1.3) {
        // Dive into the cone
        const diveP = (p - 1.0) / 0.30;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        targetY = THREE.MathUtils.lerp(targetHeight, -6, easeDive);
        targetZ = THREE.MathUtils.lerp(targetRadius, 1.5, easeDive); // Move inside the cone (radius 4 to 1)
      } else if (p <= 1.6) {
        // Dive straight down to the portal
        const diveP = (p - 1.3) / 0.30;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        targetY = THREE.MathUtils.lerp(-6, -14, easeDive);
        targetZ = THREE.MathUtils.lerp(1.5, 1.5, easeDive); // Stay inside the cone, flying straight down
      } else if (p <= 2.0) {
        // Pass through portal and float into the void
        const diveP = (p - 1.6) / 0.40;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        targetY = THREE.MathUtils.lerp(-14, -30, easeDive);
        targetZ = THREE.MathUtils.lerp(1.5, 30, easeDive); // Pull back gently into the void
      } else {
        // Final float state
        const diveP = Math.min((p - 2.0) / 0.50, 1.0);
        targetY = THREE.MathUtils.lerp(-30, -32, diveP);
        targetZ = THREE.MathUtils.lerp(30, 35, diveP); // Slow continuous drift
      }
    }

    basePosition.current.set(targetX, targetY, targetZ);
    
    // Anchor the camera perfectly to the structure's center in world space
    targetLookAt.current.set(0, -2, 0);

    if (p >= 1.0) {
      if (p <= 1.3) {
        const diveP = (p - 1.0) / 0.30;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        targetLookAt.current.y = THREE.MathUtils.lerp(-2, -6, easeDive);
      } else if (p <= 1.6) {
        const diveP = (p - 1.3) / 0.30;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        targetLookAt.current.y = THREE.MathUtils.lerp(-6, -14, easeDive);
      } else if (p <= 2.0) {
        const diveP = (p - 1.6) / 0.40;
        const easeDive = diveP * diveP * (3 - 2 * diveP);
        targetLookAt.current.y = THREE.MathUtils.lerp(-14, -30, easeDive);
      } else {
        const diveP = Math.min((p - 2.0) / 0.50, 1.0);
        targetLookAt.current.y = THREE.MathUtils.lerp(-30, -32, diveP);
      }
    }

    // Subtle Breathing
    const time = state.clock.getElapsedTime();
    const breathX = Math.sin(time * 0.5) * 0.05;
    const breathY = Math.cos(time * 0.4) * 0.05;
    
    // Heavy Parallax (The Igloo-style UI feel)
    const maxParallaxX = 1.0;
    const maxParallaxY = 0.6;
    currentParallax.current.x = THREE.MathUtils.damp(currentParallax.current.x, pointer.x * maxParallaxX, 2.0, delta);
    currentParallax.current.y = THREE.MathUtils.damp(currentParallax.current.y, pointer.y * maxParallaxY, 2.0, delta);

    // Apply
    camera.position.x = basePosition.current.x + breathX + currentParallax.current.x;
    camera.position.y = basePosition.current.y + breathY + currentParallax.current.y;
    camera.position.z = basePosition.current.z;

    currentLookAt.current.lerp(targetLookAt.current, delta * 4);
    camera.lookAt(currentLookAt.current);
    
    if (useExperienceStore.getState().showDebug) {
      window.debugStats = {
        camPos: camera.position.clone(),
        camLookAt: currentLookAt.current.clone(),
        camVelocity: camera.position.distanceTo(previousPosition.current) / delta || 0,
      };
      previousPosition.current.copy(camera.position);
    }
  });

  return null;
}
