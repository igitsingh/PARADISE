import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { WorldDirector } from './WorldDirector';
import { CameraDirector } from './CameraDirector';
import { ContinuityDirector } from './ContinuityDirector';
import { LightingDirector } from './LightingDirector';
import { InteractionDirector } from './InteractionDirector';
import { AtmosphereDirector } from './AtmosphereDirector';
import { WeatherDirector } from './WeatherDirector';
import { useExperienceStore } from '../store/useExperienceStore';

export function ExperienceDirector() {
  const showDebug = useExperienceStore((state) => state.showDebug);
  
  useEffect(() => {
    // Keyboard listeners for debug toggles
    const handleKeyDown = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        useExperienceStore.setState((state) => ({ showDebug: !state.showDebug }));
      }
      if (e.key === 'l' || e.key === 'L') {
        useExperienceStore.setState((state) => ({ debugLighting: !state.debugLighting }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <WorldDirector />
          <CameraDirector />
          <LightingDirector />
          <InteractionDirector />
          <AtmosphereDirector />
          <WeatherDirector />
        </Suspense>
      </Canvas>
      
      {/* Developer Debug Overlay */}
      {showDebug && <DebugOverlay />}
    </>
  );
}

// Temporary HUD overlay for development tracking
function DebugOverlay() {
  const progression = useExperienceStore((state) => state.progression);
  const debugLighting = useExperienceStore((state) => state.debugLighting);

  return (
    <div style={{
      position: 'absolute', top: 10, left: 10, 
      color: '#00ff00', fontFamily: 'monospace', 
      background: 'rgba(0,0,0,0.8)', padding: '10px',
      pointerEvents: 'none'
    }}>
      <div>Paradise Experience Engine v0.0.3</div>
      <div>Progression: {(progression * 100).toFixed(1)}%</div>
      <div>Debug Lighting (L): {debugLighting ? 'ON' : 'OFF'}</div>
      <div>Weather State: {progression < 0.2 ? 'Calm' : progression < 0.6 ? 'Rain' : 'Golden Wind'}</div>
    </div>
  );
}
