import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoiseTexture, createPastelTexture } from '../utils/TextureGenerator';
import { useTexture } from '@react-three/drei';
import { getTerrainHeight } from '../utils/terrainUtils';
import { DistantScenery } from './DistantScenery';

function InteractiveBlock({ blockPos, normal, size, pointerLocal, textures, isBase }) {
  const meshRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isBase) {
      // Keep base blocks perfectly still
      return;
    }

    const time = state.clock.getElapsedTime();

    // Default State: Continuous breathing/floating animation
    // Offsetting the sine wave using the block's physical position so they breathe organically
    // We add 1 and multiply by 0.5 to keep the sine wave between 0 and 1, so they only push outwards
    const sineWave = Math.sin(time * 1.5 + blockPos.x * 0.5 + blockPos.y * 0.5);
    const breatheZ = (sineWave * 0.5 + 0.5) * 0.25;
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

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const wTop = size.widthTop / 2;
    const wBot = size.widthBottom / 2;
    const h = size.sY / 2;

    shape.moveTo(-wBot, -h);
    shape.lineTo(wBot, -h);
    shape.lineTo(wTop, h);
    shape.lineTo(-wTop, h);
    shape.lineTo(-wBot, -h);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: size.sZ,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -size.sZ / 2); // Center depth
    return geo;
  }, [size]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow geometry={geometry}>
      <meshPhysicalMaterial
        color="#ffffff"
        map={textures.map}
        normalMap={textures.normalMap}
        roughnessMap={textures.roughnessMap}
        aoMap={textures.aoMap}
        roughness={1.0}
        metalness={0.0}
      />
    </mesh>
  );
}

export function WorldDirector() {
  const worldRef = useRef();
  const pointerLocal = useRef(new THREE.Vector3(9999, 9999, 9999));

  const grassTextures = useTexture({
    map: '/GRASS/Grass007_4K-JPG/Grass007_4K-JPG_Color.jpg',
    normalMap: '/GRASS/Grass007_4K-JPG/Grass007_4K-JPG_NormalGL.jpg',
    roughnessMap: '/GRASS/Grass007_4K-JPG/Grass007_4K-JPG_Roughness.jpg',
    aoMap: '/GRASS/Grass007_4K-JPG/Grass007_4K-JPG_AmbientOcclusion.jpg',
  });

  useMemo(() => {
    Object.values(grassTextures).forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1.5, 1.5);
    });
  }, [grassTextures]);

  const terrainGrassTextures = useMemo(() => {
    const cloned = {
      map: grassTextures.map.clone(),
      normalMap: grassTextures.normalMap.clone(),
      roughnessMap: grassTextures.roughnessMap.clone(),
      aoMap: grassTextures.aoMap.clone(),
    };
    Object.values(cloned).forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(60, 60);
      tex.needsUpdate = true;
    });
    return cloned;
  }, [grassTextures]);

  // Generate Procedural Textures
  const { terrainBumpMap, terrainRoughnessMap, terrainColorMap } = useMemo(() => {
    return {
      terrainBumpMap: createNoiseTexture(512, 1.0, false),
      terrainRoughnessMap: createNoiseTexture(512, 1.0, true), // Wet puddles
      terrainColorMap: createPastelTexture(512)
    };
  }, []);

  const blocks = useMemo(() => {
    const radius = 4;
    const generated = [];
    const rows = 9;
    const cols = 18;

    for (let i = 0; i < rows; i++) {
      const phi = (Math.PI / 2) * (i / (rows - 1));
      for (let j = 0; j < cols; j++) {
        // Build directly above base bricks instead of interlocking
        const offset = 0;
        const theta = (Math.PI * 2) * (j / cols) + offset;

        const x = radius * Math.cos(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.sin(theta);

        const pos = new THREE.Vector3(x, y, z);
        const normal = pos.clone().normalize();

        const rowSpacing = (Math.PI * radius / 2) / (rows - 1);

        // Calculate trapezoid widths based on the circumference at the top and bottom of the brick
        // We use 0.99 instead of 0.95 to make the blocks fit tightly together for a clean precise structure
        const phiTop = phi + (rowSpacing / radius) / 2;
        const phiBottom = phi - (rowSpacing / radius) / 2;
        const widthTop = (Math.PI * 2 * radius * Math.max(0, Math.cos(phiTop))) / cols * 0.99;
        const widthBottom = (Math.PI * 2 * radius * Math.max(0, Math.cos(phiBottom))) / cols * 0.99;

        const sY = rowSpacing * 0.99;
        const sZ = 0.5; // Uniform depth

        // Calculate the exact rotation so the brick faces outward without twisting
        let up = new THREE.Vector3(0, 1, 0);
        // Fix Gimbal Lock at the very top of the sphere where the normal is parallel to the UP vector
        if (Math.abs(normal.y) > 0.999) {
          up = new THREE.Vector3(0, 0, -1);
        }
        const m = new THREE.Matrix4().lookAt(pos, new THREE.Vector3(0, 0, 0), up);
        const quaternion = new THREE.Quaternion().setFromRotationMatrix(m);

        generated.push({
          pos,
          normal,
          quaternion,
          size: { widthTop, widthBottom, sY, sZ },
          id: `${i}-${j}`,
          isBase: i === 0
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
      let z = getTerrainHeight(x, y);
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
          color="#ffffff"
          map={terrainGrassTextures.map}
          normalMap={terrainGrassTextures.normalMap}
          roughnessMap={terrainGrassTextures.roughnessMap}
          aoMap={terrainGrassTextures.aoMap}
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>

      {/* Distant Trees, Homes, and Roads (Aligned with terrain) */}
      <group position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <DistantScenery />
      </group>

      {/* The Paradise House */}
      <group position={[0, -2.7, 0]}>
        <mesh
          visible={true}
          onPointerMove={(e) => {
            e.stopPropagation();
            pointerLocal.current.copy(e.point);
            pointerLocal.current.y += 2.7;
          }}
          onPointerOut={() => pointerLocal.current.set(9999, 9999, 9999)}
        >
          <sphereGeometry args={[3.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#ffcc55" />
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
            quaternion={b.quaternion}
          >
            <InteractiveBlock
              blockPos={b.pos}
              normal={b.normal}
              size={b.size}
              pointerLocal={pointerLocal}
              textures={grassTextures}
              isBase={b.isBase}
            />
          </group>
        ))}
      </group>
    </group>
  );
}
