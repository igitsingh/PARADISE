import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperienceStore } from '../store/useExperienceStore';
import * as THREE from 'three';
import { GoldenRoot } from './GoldenRoot';

export function GeologyDirector() {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    
    const p = useExperienceStore.getState().progression;
    groupRef.current.visible = p >= 0.95;
  });

  return (
    <group ref={groupRef} name="Geology" visible={false}>
      {/* The Glow Core & Roots connecting surface to deep earth */}
      <GoldenRoot />
    </group>
  );
}
