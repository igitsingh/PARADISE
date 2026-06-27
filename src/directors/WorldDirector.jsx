import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoiseTexture, createPastelTexture } from '../utils/TextureGenerator';

function InteractiveBlock({ blockPos, normal, size, pointerLocal, bumpMap }) {
  const meshRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Default State: Continuous breathing/floating animation
    // Offsetting the sine wave using the block's physical position so they breathe organically
    const breatheZ = Math.sin(time * 1.5 + blockPos.x * 0.5 + blockPos.y * 0.5) * 0.25;
    const breatheRotX = Math.sin(time * 1.0 + blockPos.y) * 0.05;
    const breatheRotY = Math.cos(time * 1.2 + blockPos.x) * 0.05;
    
    let targetZ = breatheZ;
    let targetRotX = breatheRotX;
    let targetRotY = breatheRotY;
    
    // Interaction State: Mouse proximity pushes blocks out
    const dist = blockPos.distanceTo(pointerLocal.current);
    const influenceRadius = 4.0; // Increased radius slightly so it reacts when cursor is "around" it
    
    if (dist < influenceRadius) {
      const normalizedDist = dist / influenceRadius;
      const intensity = Math.pow(1.0 - normalizedDist, 2.0);
      
      targetZ += intensity * 1.8;
      targetRotX += intensity * 0.4;
      targetRotY += intensity * 0.2;
    }
    
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, targetZ, delta * 8);
    meshRef.current.position.copy(currentPos.current);
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, delta * 6);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, delta * 6);
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshPhysicalMaterial 
        color="#e6e2d8" // Creamy stone daytime color
        roughness={0.7} 
        metalness={0.1}
        bumpMap={bumpMap}
        bumpScale={0.02}
      />
    </mesh>
  );
}

export function WorldDirector() {
  const worldRef = useRef();
  const pointerLocal = useRef(new THREE.Vector3(9999, 9999, 9999));
  
  // Generate Procedural Textures
  const { stoneBumpMap, terrainBumpMap, terrainRoughnessMap, terrainColorMap } = useMemo(() => {
    return {
      stoneBumpMap: createNoiseTexture(512, 0.5, false),
      terrainBumpMap: createNoiseTexture(512, 1.0, false),
      terrainRoughnessMap: createNoiseTexture(512, 1.0, true), // Wet puddles
      terrainColorMap: createPastelTexture(512)
    };
  }, []);
  
  const blocks = useMemo(() => {
    const radius = 4;
    const generated = [];
    const rows = 9;
    for (let i = 0; i < rows; i++) {
      const phi = (Math.PI / 2) * (i / (rows - 1));
      const cols = Math.max(1, Math.floor(Math.cos(phi) * 18));
      for (let j = 0; j < cols; j++) {
        const theta = (Math.PI * 2) * (j / cols);
        
        const x = radius * Math.cos(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.sin(theta);
        
        const pos = new THREE.Vector3(x, y, z);
        const normal = pos.clone().normalize();
        
        const sX = 1.0 + Math.random() * 0.6;
        const sY = 0.8 + Math.random() * 0.4;
        const sZ = 0.3 + Math.random() * 0.2;
        
        generated.push({ 
          pos, 
          normal,
          size: [sX, sY, sZ],
          id: `${i}-${j}` 
        });
      }
    }
    return generated;
  }, []);

  // Generate a massive, rolling terrain to catch the weather and lighting
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 64, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Gentle rolling hills using sine waves
      let z = Math.sin(x * 0.05) * 4 + Math.cos(y * 0.05) * 4;
      // Add a slight dip in the center where the house sits
      const distFromCenter = Math.sqrt(x*x + y*y);
      if (distFromCenter < 20) {
        z -= (20 - distFromCenter) * 0.3;
      }
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group ref={worldRef} name="ParadiseWorld">
      
      {/* The Sprawling Terrain */}
      <mesh 
        position={[0, -2.5, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        geometry={terrainGeometry}
        receiveShadow
      >
        <meshPhysicalMaterial 
          color="#ffffff" // White base so the pastel map shines through purely
          map={terrainColorMap}
          bumpMap={terrainBumpMap}
          bumpScale={0.5}
          roughnessMap={terrainRoughnessMap}
          roughness={1.0} 
          metalness={0.1}
          clearcoat={0.1}
        />
      </mesh>

      {/* The Paradise House */}
      <group position={[0, -2, 0]}>
        <mesh 
          visible={false}
          onPointerMove={(e) => {
            e.stopPropagation();
            pointerLocal.current.copy(e.point);
            pointerLocal.current.y += 2; 
          }}
          onPointerOut={() => pointerLocal.current.set(9999, 9999, 9999)}
        >
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial />
        </mesh>

        <pointLight 
          position={[0, 1, 0]} 
          intensity={25} 
          distance={20} 
          color="#ffaa33" 
        />
        
        {blocks.map((b) => (
          <group 
            key={b.id} 
            position={b.pos} 
            quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), b.normal)}
          >
            <InteractiveBlock 
              blockPos={b.pos}
              normal={b.normal}
              size={b.size} 
              pointerLocal={pointerLocal}
              bumpMap={stoneBumpMap}
            />
          </group>
        ))}
      </group>
    </group>
  );
}
