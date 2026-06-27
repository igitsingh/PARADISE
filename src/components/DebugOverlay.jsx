import { useEffect, useRef, useState } from 'react';
import { useExperienceStore } from '../store/useExperienceStore';

export function DebugOverlay() {
  const showDebug = useExperienceStore((state) => state.showDebug);
  const debugLighting = useExperienceStore((state) => state.debugLighting);
  const [stats, setStats] = useState({ fps: 0, prog: 0, cam: '', vel: 0, region: '', fog: '', exp: '' });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!showDebug) return;
    
    let rafId;
    const update = () => {
      frameCount.current++;
      const now = performance.now();
      const elapsed = now - lastTime.current;
      
      if (elapsed >= 500) { // Update stats every 500ms
        const fps = Math.round((frameCount.current * 1000) / elapsed);
        frameCount.current = 0;
        lastTime.current = now;
        
        const prog = useExperienceStore.getState().progression;
        const dStats = window.debugStats || {};
        const pos = dStats.camPos ? `${dStats.camPos.x.toFixed(2)}, ${dStats.camPos.y.toFixed(2)}, ${dStats.camPos.z.toFixed(2)}` : '0, 0, 0';
        const look = dStats.camLookAt ? `${dStats.camLookAt.x.toFixed(2)}, ${dStats.camLookAt.y.toFixed(2)}, ${dStats.camLookAt.z.toFixed(2)}` : '0, 0, 0';
        const vel = dStats.camVelocity ? dStats.camVelocity.toFixed(2) : '0.00';
        
        let region = 'Region 1';
        if (prog > 0.4 && prog < 0.6) region = 'Transition Zone';
        if (prog >= 0.6) region = 'Region 2';

        setStats({
          fps,
          prog: prog.toFixed(3),
          cam: `Pos: [${pos}] | Target: [${look}]`,
          vel,
          region,
          fog: prog > 0.3 && prog < 0.7 ? 'Dense (Masking)' : 'Standard',
          exp: debugLighting ? 'Fixed 1.0 (Debug Light)' : (prog > 0.4 && prog < 0.6 ? 'High 2.0 (Adapting)' : 'Normal 1.0')
        });
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    
    return () => cancelAnimationFrame(rafId);
  }, [showDebug, debugLighting]);

  if (!showDebug) return null;

  return (
    <div style={{
      position: 'absolute', top: 10, left: 10, zIndex: 100, 
      background: 'rgba(0,0,0,0.8)', color: '#0f0', 
      padding: '15px', fontFamily: 'monospace', fontSize: '12px',
      border: '1px solid #0f0', pointerEvents: 'none'
    }}>
      <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #0f0' }}>ENGINE DEBUG</h3>
      <p>FPS: {stats.fps}</p>
      <p>Progress [0,1]: {stats.prog}</p>
      <p>Camera: {stats.cam}</p>
      <p>Velocity: {stats.vel} u/s</p>
      <p>Region: {stats.region}</p>
      <p>Fog Density: {stats.fog}</p>
      <p>Exposure: {stats.exp}</p>
      <p>Debug Lighting: {debugLighting ? 'ON' : 'OFF'} (Press L)</p>
      <p style={{ marginTop: 10, opacity: 0.5 }}>Press D to hide</p>
    </div>
  );
}
