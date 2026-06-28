import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight } from '../utils/terrainUtils';
import { useExperienceStore } from '../store/useExperienceStore';

export function DistantScenery() {
  const treesRef = useRef();
  const homesRef = useRef();
  const groupRef = useRef();

  // Procedural generation parameters
  const NUM_TREES = 800;
  const NUM_HOMES = 50;

  const { treeMatrices, treeColors } = useMemo(() => {
    const matrices = [];
    const colors = [];
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    // Base colors for trees
    const baseColors = ['#1a4a1a', '#225522', '#113311', '#286628'];

    for (let i = 0; i < NUM_TREES; i++) {
      // Scatter them far away
      const radius = 50 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius; // XY plane in world gen before rotation
      
      const z = getTerrainHeight(x, y);
      
      dummy.position.set(x, y, z);
      
      // Make them stand straight up (remember terrain is rotated -PI/2)
      // So 'up' for the tree is positive Z before the group rotates it.
      dummy.rotation.x = Math.PI / 2;
      dummy.rotation.y = Math.random() * Math.PI;
      
      const scale = 0.5 + Math.random() * 1.5;
      dummy.scale.set(scale, scale * (1 + Math.random()*0.5), scale);
      
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
      
      color.set(baseColors[Math.floor(Math.random() * baseColors.length)]);
      colors.push(color.r, color.g, color.b);
    }
    return { treeMatrices: matrices, treeColors: new Float32Array(colors) };
  }, []);

  const { homeMatrices } = useMemo(() => {
    const matrices = [];
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < NUM_HOMES; i++) {
      // Cluster them slightly, but keep them far
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius; 
      
      const z = getTerrainHeight(x, y);
      
      dummy.position.set(x, y, z);
      dummy.rotation.x = Math.PI / 2;
      
      const scale = 0.4 + Math.random() * 0.4;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return { homeMatrices: matrices };
  }, []);

  // Terraced Paths (Circular Roads)
  const pathsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    
    const numPaths = 5;
    for (let p = 0; p < numPaths; p++) {
      const radius = 40 + p * 20; // Concentric paths
      const segments = 128;
      
      for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;
        
        const x1 = Math.cos(theta1) * radius;
        const y1 = Math.sin(theta1) * radius;
        const z1 = getTerrainHeight(x1, y1) + 0.1; // Slightly above ground
        
        const x2 = Math.cos(theta2) * radius;
        const y2 = Math.sin(theta2) * radius;
        const z2 = getTerrainHeight(x2, y2) + 0.1;
        
        // Draw a thick line/ribbon
        const width = 1.0;
        const offset1X = Math.cos(theta1) * (radius + width);
        const offset1Y = Math.sin(theta1) * (radius + width);
        const offset1Z = getTerrainHeight(offset1X, offset1Y) + 0.1;
        
        const offset2X = Math.cos(theta2) * (radius + width);
        const offset2Y = Math.sin(theta2) * (radius + width);
        const offset2Z = getTerrainHeight(offset2X, offset2Y) + 0.1;
        
        // Triangle 1
        positions.push(x1, y1, z1);
        positions.push(x2, y2, z2);
        positions.push(offset1X, offset1Y, offset1Z);
        
        // Triangle 2
        positions.push(offset1X, offset1Y, offset1Z);
        positions.push(x2, y2, z2);
        positions.push(offset2X, offset2Y, offset2Z);
      }
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    if (treesRef.current && treeMatrices.length > 0) {
      for (let i = 0; i < NUM_TREES; i++) {
        treesRef.current.setMatrixAt(i, treeMatrices[i]);
      }
      treesRef.current.instanceMatrix.needsUpdate = true;
      treesRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(treeColors, 3));
    }
    
    if (homesRef.current && homeMatrices.length > 0) {
      for (let i = 0; i < NUM_HOMES; i++) {
        homesRef.current.setMatrixAt(i, homeMatrices[i]);
      }
      homesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [treeMatrices, treeColors, homeMatrices]);

  useFrame(() => {
    // Hide when diving deep
    const p = useExperienceStore.getState().progression;
    if (groupRef.current) {
        groupRef.current.visible = p < 1.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Terraced Roads */}
      <mesh geometry={pathsGeometry} receiveShadow>
        <meshStandardMaterial color="#886644" roughness={1.0} />
      </mesh>
      
      {/* Distant Stylized Trees (Cones) */}
      <instancedMesh ref={treesRef} args={[null, null, NUM_TREES]} castShadow receiveShadow>
        <coneGeometry args={[1, 4, 8]}>
            <instancedBufferAttribute attach="attributes-color" args={[treeColors, 3]} />
        </coneGeometry>
        <meshStandardMaterial vertexColors roughness={0.8} />
      </instancedMesh>
      
      {/* Distant Homes (Small Domes) */}
      <instancedMesh ref={homesRef} args={[null, null, NUM_HOMES]} castShadow receiveShadow>
        <sphereGeometry args={[2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffcc55" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}
