export function getTerrainHeight(x, y) {
  // Gentle rolling hills using sine waves
  let z = Math.sin(x * 0.05) * 4 + Math.cos(y * 0.05) * 4;
  
  // Make the area around the house perfectly flat, blending smoothly into the hills
  const distFromCenter = Math.sqrt(x*x + y*y);
  if (distFromCenter < 15) {
    z = 0; // Perfectly flat ground under and immediately around the house
  } else if (distFromCenter < 35) {
    // Smoothly blend from flat (at dist 15) to rolling hills (at dist 35)
    const t = (distFromCenter - 15) / 20;
    const smoothT = t * t * (3 - 2 * t); // Smoothstep for natural transition
    z = z * smoothT;
  }
  
  return z;
}
