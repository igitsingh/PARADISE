import * as THREE from 'three';

/**
 * Procedurally generates a noise texture for bump/roughness maps.
 */
export function createNoiseTexture(size = 512, intensity = 1.0, isRoughness = false) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let val = Math.random() * 255;
    
    if (isRoughness) {
      // Create blotchy mud puddles by smoothing the noise heavily or clamping
      // A simple trick is to use sine waves or just threshold the random noise
      const x = (i / 4) % size;
      const y = Math.floor((i / 4) / size);
      
      const waveX = Math.sin(x * 0.05) * 50;
      const waveY = Math.cos(y * 0.05) * 50;
      val = (val + waveX + waveY) * 0.5;
      
      // Wet puddles (very dark = smooth), dry dirt (light = rough)
      val = val > 120 ? 255 : 40; 
    }
    
    val *= intensity;
    
    data[i] = val;     // r
    data[i + 1] = val; // g
    data[i + 2] = val; // b
    data[i + 3] = 255; // a
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedurally generates a falling rain streak texture.
 */
export function createRainTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  // Draw a very thin vertical line in the center of the square so it doesn't stretch on Points
  ctx.fillRect(31, 0, 2, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedurally generates a soft radial gradient for wind dust/leaves.
 */
export function createDustTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const centerX = 32;
  const centerY = 32;
  const radius = 32;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedurally generates a colorful, dreamy pastel texture map using sine waves.
 */
export function createPastelTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor((i / 4) / size);
    
    // Create organic color patches using overlapping sine waves
    const rWave = Math.sin(x * 0.02) + Math.cos(y * 0.015);
    const gWave = Math.sin(x * 0.01 + Math.PI) + Math.cos(y * 0.02);
    const bWave = Math.sin(x * 0.015) + Math.cos(y * 0.01 + Math.PI/2);
    
    // Map waves (-2 to 2) into pastel ranges (mostly bright, soft colors)
    // Pink/Peach/Lavender/Mint mix
    const r = 200 + (rWave * 25); 
    const g = 190 + (gWave * 30);
    const b = 220 + (bWave * 25);
    
    data[i] = r;     // r
    data[i + 1] = g; // g
    data[i + 2] = b; // b
    data[i + 3] = 255; // a
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedurally generates a horizontal wind streak texture.
 */
export function createWindTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 128, 0);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)'); // More opaque center
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 7, 128, 2); // 2 pixels high

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedurally generates a grassy texture map.
 */
export function createGrassTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor((i / 4) / size);
    
    // Mix different frequencies for noise
    const noise = Math.random();
    const noise2 = Math.sin(x * 0.1) * Math.cos(y * 0.1);
    
    let r, g, b;
    if (noise > 0.8) {
        // Yellowish green
        r = 100 + noise2 * 20;
        g = 180 + noise2 * 30;
        b = 50 + noise2 * 10;
    } else if (noise > 0.4) {
        // Normal green
        r = 60 + noise2 * 20;
        g = 140 + noise2 * 30;
        b = 40 + noise2 * 10;
    } else {
        // Dark green
        r = 40 + noise2 * 20;
        g = 100 + noise2 * 30;
        b = 30 + noise2 * 10;
    }
    
    data[i] = Math.max(0, Math.min(255, r));     // r
    data[i + 1] = Math.max(0, Math.min(255, g)); // g
    data[i + 2] = Math.max(0, Math.min(255, b)); // b
    data[i + 3] = 255; // a
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedurally generates a rich soil texture (lateritic, organic).
 */
export function createSoilTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor((i / 4) / size);
    
    const noise = Math.random();
    const noise2 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
    const noise3 = Math.sin(y * 0.1) + Math.cos(x * 0.1);
    
    let r, g, b;
    if (noise > 0.8) {
        // Reddish lateritic soil
        r = 120 + noise3 * 20;
        g = 50 + noise3 * 10;
        b = 30;
    } else if (noise > 0.4) {
        // Dark rich organic matter
        r = 60 + noise2 * 10;
        g = 35 + noise2 * 10;
        b = 20;
    } else {
        // Deep dark dirt
        r = 40 + noise2 * 15;
        g = 25 + noise2 * 5;
        b = 15;
    }
    
    data[i] = Math.max(0, Math.min(255, r));     // r
    data[i + 1] = Math.max(0, Math.min(255, g)); // g
    data[i + 2] = Math.max(0, Math.min(255, b)); // b
    data[i + 3] = 255; // a
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

