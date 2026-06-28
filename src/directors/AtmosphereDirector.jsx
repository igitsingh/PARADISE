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
import { Sky, Clouds, Cloud, Text as DreiText } from '@react-three/drei';
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
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 50; // Only positive Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      spd[i] = 0.2 + Math.random() * 0.8;
    }
    return [pos, spd];
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    const p = useExperienceStore.getState().progression;
    // Speed increases dramatically when diving
    let speedMultiplier = 1;
    if (p > 1.0 && p < 1.6) speedMultiplier = 15;
    else if (p > 1.6) speedMultiplier = 5;

    const positionsArray = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positionsArray[i * 3 + 1] += speeds[i] * speedMultiplier * delta * 15;
      if (positionsArray[i * 3 + 1] > 50) {
        positionsArray[i * 3 + 1] = -10; // reset to bottom
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    let targetOpacity = 0;
    if (p > 1.0) targetOpacity = 1;
    particlesRef.current.material.opacity = THREE.MathUtils.lerp(
      particlesRef.current.material.opacity,
      targetOpacity,
      delta * 2
    );
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffcc66" // Golden embers
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={dotTexture}
      />
    </points>
  );
}

export function AtmosphereDirector() {
  const { scene } = useThree();
  const debugLighting = useExperienceStore((state) => state.debugLighting);
  const noiseRef = useRef();
  
  // Set default daytime background
  useMemo(() => {
    scene.background = new THREE.Color('#cceeff');
  }, [scene]);

  // Setup fog
  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color("#cceeff"), 20, 250);
  }, [scene]);

  const skyGroupRef = useRef();
  const textRef = useRef();

  const isMobile = window.innerWidth < 768;

  useFrame((state, delta) => {
    if (!scene.fog) return;
    
    const p = useExperienceStore.getState().progression;
    
    if (skyGroupRef.current) {
      skyGroupRef.current.visible = p < 1.0;
    }
    
    if (textRef.current) {
      const baseY = isMobile ? 50 : 35;
      // Move upwards in the sky as you scroll
      textRef.current.position.y = baseY + p * 150;
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
  // #1E3A5F is a deep, grounded navy blue. In color psychology, deep blue is universally 
  // recognized as the color of trust, authenticity, and unwavering stability. 
  const textMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1E3A5F', fog: false, toneMapped: false }), []);

  return (
    <>
      <group ref={skyGroupRef}>
        <Sky sunPosition={[0, 100, 0]} inclination={0} azimuth={0.25} rayleigh={0.5} turbidity={5} />
        
        <DreiText 
          ref={textRef}
          position={[0, isMobile ? 50 : 35, -200]} 
          fontSize={isMobile ? 25 : 45} 
          letterSpacing={0.2}
          material={textMaterial}
          outlineWidth="0.8%"
          outlineColor="#D4AF37"
        >
          ORIGIN MATTERS.
        </DreiText>

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
