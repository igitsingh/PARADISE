import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Create procedural texture for the root skin/bark
function createRootSkinTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base earthy brown-orange color
  ctx.fillStyle = '#4c2b17';
  ctx.fillRect(0, 0, 512, 512);

  // Organic rings/bands (darker horizontal segments)
  ctx.fillStyle = '#2c160a';
  for (let i = 0; i < 18; i++) {
    const y = Math.random() * 512;
    const h = 4 + Math.random() * 12;
    ctx.fillRect(0, y, 512, h);
  }

  // Grainy speckles / dirt nodules
  for (let i = 0; i < 150; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#1a0d05' : '#8a5937';
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizontal fibrous lines
  ctx.strokeStyle = '#5a3721';
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < 512; x += 15) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 8);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 20); // Repeat vertically along the massive depth
  return texture;
}

// Create procedural texture for the sliced glowing core
function createRootCutTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Deep orange base (high-curcumin content indicator)
  ctx.fillStyle = '#d65200';
  ctx.fillRect(0, 0, 256, 256);

  // Concentric cellular layers
  for (let r = 15; r < 120; r += 12) {
    ctx.strokeStyle = Math.random() > 0.5 ? '#BF930F' : '#8A6805';
    ctx.lineWidth = 2 + Math.random() * 3;
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Extremely vibrant glowing center core
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 45);
  grad.addColorStop(0, '#F5F1E8'); // Ivory white hot center
  grad.addColorStop(0.3, '#D4A822'); // Bright gold
  grad.addColorStop(0.7, '#BF930F'); // Brand gold
  grad.addColorStop(1.0, '#8A6805');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 45, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function GoldenRoot() {
  const rootMeshGroupRef = useRef();
  const cutFaceRef = useRef();
  const coneRef = useRef();

  const { rootGeometry, skinMat, lakadongMat, coneGeometry } = useMemo(() => {
    const tex = createRootSkinTexture();
    const cut = createRootCutTexture();
    
    const depth = 3.2;
    const radiusTop = 0.7;
    const radiusBottom = 0.5;
    // openEnded = false so top and bottom caps are generated!
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, depth, 64, 32, false);
    
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      const angle = Math.atan2(z, x);
      const dist = Math.sqrt(x*x + z*z);
      
      if (dist > 0.001) {
        let bump = Math.sin(y * 4.5) * Math.cos(angle * 3.0) * 0.14;
        bump += Math.sin(angle * 5.0) * 0.08;
        bump += Math.sin(y * 14.0) * 0.035; // circular ring grooves
        
        // Apply bump proportionally to distance from center, so caps are scaled correctly
        // The outer radius is roughly 0.6 on average
        const bumpFactor = 1.0 + (bump / 0.6);
        pos.setX(i, x * bumpFactor);
        pos.setZ(i, z * bumpFactor);
      }
    }
    geo.computeVertexNormals();
    
    // Create the volumetric glowing cone geometry (wider at the top, narrow at the bottom)
    const coneHeight = 15;
    const cGeo = new THREE.CylinderGeometry(4.0, 1.0, coneHeight, 32, 1, true);
    cGeo.translate(0, -coneHeight / 2, 0); // Shift so the TOP of the cone is at local Y=0

    // Materials
    const skinMat = new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.9,
      metalness: 0.1,
      bumpMap: tex,
      bumpScale: 0.15,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8
    });

    const lakadongMat = new THREE.MeshPhysicalMaterial({
      map: cut,
      color: "#FF9900", // Vibrant Lakadong Turmeric Yellow-Orange
      emissive: "#FF8800",
      emissiveIntensity: 1.5,
      roughness: 0.4
    });

    return { rootGeometry: geo, skinMat, lakadongMat, coneGeometry: cGeo };
  }, []);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate ONLY the root
    if (rootMeshGroupRef.current) {
      rootMeshGroupRef.current.rotation.y = elapsedTime * 0.3;
    }

    // Pulse the lakadong material emissive brightness
    if (lakadongMat) {
      lakadongMat.emissiveIntensity = 1.5 + Math.sin(elapsedTime * 3.5) * 0.5;
    }

    // Pulse the volumetric cone opacity
    if (coneRef.current && coneRef.current.material) {
      coneRef.current.material.opacity = 0.15 + Math.sin(elapsedTime * 2.0) * 0.05;
    }
  });

  return (
    <group position={[0, -2.7 - (3.2/2), 0]}>
      
      {/* Volumetric Glowing Light Cone (Stationary) */}
      <mesh ref={coneRef} geometry={coneGeometry} position={[0, 1.8, 0]}>
        <meshBasicMaterial 
          color="#ffaa33" 
          transparent={true} 
          opacity={0.15} 
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotating Turmeric Root */}
      <group ref={rootMeshGroupRef}>
        {/* Wrinkled skin/bark with lakadong ends */}
        <mesh 
          geometry={rootGeometry} 
          material={[skinMat, lakadongMat, lakadongMat]} // [side, top, bottom]
          castShadow 
          receiveShadow 
        />
      </group>
      
      {/* Root Glow Lights */}
      <pointLight position={[0, 0, 0]} color="#BF930F" intensity={5} distance={10} />
      <pointLight position={[0, -50, 0]} color="#BF930F" intensity={30} distance={150} />
      <pointLight position={[0, -100, 0]} color="#BF930F" intensity={50} distance={200} />
    </group>
  );
}
