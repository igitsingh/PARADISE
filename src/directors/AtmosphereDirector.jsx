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
import { Sky, Clouds, Cloud } from '@react-three/drei';
import { createDustTexture } from '../utils/TextureGenerator';

function Bird({ position, speed = 1, offset = 0 }) {
  const birdRef = useRef();
  
  useFrame((state) => {
    if (!birdRef.current) return;
    const time = state.clock.getElapsedTime() * speed + offset;
    birdRef.current.position.y = position[1] + Math.sin(time * 2) * 0.5;
    birdRef.current.position.x = position[0] + Math.cos(time * 0.5) * 5;
    
    const flap = Math.sin(time * 15);
    birdRef.current.children[0].rotation.z = flap * 0.5;
    birdRef.current.children[1].rotation.z = -flap * 0.5;
  });

  return (
    <group position={position} ref={birdRef}>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.2]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.2]} />
        <meshBasicMaterial color="#222" />
      </mesh>
    </group>
  );
}

// Classy, organic speed effect: Golden embers rushing upwards
function SpeedDust() {
  const particlesRef = useRef();
  const count = 500;
  
  const dotTexture = useMemo(() => createDustTexture(), []);
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20; // x
      pos[i * 3 + 1] = Math.random() * 50 - 25; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
      spd[i] = 1.0 + Math.random() * 3.0;
    }
    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    const p = useExperienceStore.getState().progression;
    
    // Only show when diving
    const isDiving = p > 1.0 && p < 1.6;
    particlesRef.current.visible = isDiving;
    
    if (isDiving) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      const diveIntensity = Math.min((p - 1.0) * 2.0, 1.0); // Ramps up speed
      
      for (let i = 0; i < count; i++) {
        // Move particles upwards based on speed and dive intensity
        positions[i * 3 + 1] += speeds[i] * delta * 20 * diveIntensity;
        
        // Loop particles back to bottom
        if (positions[i * 3 + 1] > 25) {
          positions[i * 3 + 1] = -25;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        map={dotTexture}
        color="#F5C036"
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function AtmosphereDirector() {
  const debugLighting = useExperienceStore((state) => state.debugLighting);
  const { scene } = useThree();
  const noiseRef = useRef();
  
  // Set default daytime background
  useMemo(() => {
    scene.background = new THREE.Color('#cceeff');
  }, [scene]);

  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color("#cceeff"), 20, 250);
  }, [scene]);

  const skyGroupRef = useRef();

  useFrame((state, delta) => {
    if (!scene.fog) return;
    
    const p = useExperienceStore.getState().progression;
    
    if (skyGroupRef.current) {
      skyGroupRef.current.visible = p < 1.0;
    }
    
    // Daytime Fog Colors
    let targetColor = new THREE.Color('#cceeff'); // Bright daytime blue
    let targetFar = 250;
    
    if (p > 0.15 && p < 0.55) {
      targetColor = new THREE.Color('#99aacc'); // Soft pastel overcast blue/grey
      targetFar = 30; // Dense rain fog
    } else if (p > 0.55 && p <= 1.0) {
      targetColor = new THREE.Color('#030812'); // Dark cool night sky/fog
      targetFar = 40; // Dense night fog
    } else if (p > 1.0 && p <= 1.3) {
      const diveP = (p - 1.0) / 0.3;
      const easeDive = diveP * diveP * (3 - 2 * diveP);
      const nightColor = new THREE.Color('#030812');
      const soilColor = new THREE.Color('#120a06'); // Deep dark rich soil
      
      targetColor = nightColor.lerp(soilColor, easeDive);
      targetFar = THREE.MathUtils.lerp(40, 15, easeDive); // Very claustrophobic underground
    } else if (p > 1.3 && p <= 1.6) {
      const diveP = (p - 1.3) / 0.3;
      const easeDive = diveP * diveP * (3 - 2 * diveP);
      const soilColor = new THREE.Color('#120a06');
      const magmaColor = new THREE.Color('#220500'); // Deep dark red magma fog
      
      targetColor = soilColor.lerp(magmaColor, easeDive);
      targetFar = THREE.MathUtils.lerp(15, 80, easeDive); // Open up vision to see the gigantic models
    } else if (p > 1.6) {
      const diveP = Math.min((p - 1.6) / 0.4, 1.0);
      const easeDive = diveP * diveP * (3 - 2 * diveP);
      const magmaColor = new THREE.Color('#220500');
      const goldenVoid = new THREE.Color('#0A0802'); // Deep premium black-gold
      
      targetColor = magmaColor.lerp(goldenVoid, easeDive);
      targetFar = THREE.MathUtils.lerp(80, 150, easeDive);
    }

    scene.fog.color.lerp(targetColor, delta * 2);
    if (scene.background) {
      scene.background.lerp(targetColor, delta * 2);
    }
    scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, targetFar, delta * 1.5);
  });

  return (
    <>
      <group ref={skyGroupRef}>
        <Sky sunPosition={[0, 100, 0]} inclination={0} azimuth={0.25} rayleigh={0.5} turbidity={5} />
        
        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud segments={40} bounds={[20, 5, 5]} volume={20} color="#ffffff" position={[0, 30, -50]} />
          <Cloud segments={40} bounds={[20, 5, 5]} volume={20} color="#ffffff" position={[40, 25, -60]} />
          <Cloud segments={40} bounds={[20, 5, 5]} volume={20} color="#ffffff" position={[-40, 35, -45]} />
        </Clouds>

        <Bird position={[10, 20, -30]} speed={1.2} offset={0} />
        <Bird position={[12, 19, -32]} speed={1.1} offset={1} />
        <Bird position={[8, 21, -29]} speed={1.3} offset={2} />
      </group>

      <SpeedDust />

      {!debugLighting && (
        <EffectComposer disableNormalPass multisampling={4}>
          <Bloom luminanceThreshold={2.0} luminanceSmoothing={0.9} height={300} />
          <Noise blendFunction={BlendFunction.SCREEN} opacity={0.04} premultiply />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
}
