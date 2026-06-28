import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { WorldDirector } from './WorldDirector';
import { CameraDirector } from './CameraDirector';
import { ContinuityDirector } from './ContinuityDirector';
import { LightingDirector } from './LightingDirector';
import { GeologyDirector } from './GeologyDirector';
import { InteractionDirector } from './InteractionDirector';
import { AtmosphereDirector } from './AtmosphereDirector';
import { WeatherDirector } from './WeatherDirector';
import { UndergroundDirector } from './UndergroundDirector';
import { useExperienceStore } from '../store/useExperienceStore';

import React, { Component } from 'react';
import { Loader } from '@react-three/drei';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Canvas Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>Failed to load 3D assets. Please reload the page.</div>;
    }
    return this.props.children;
  }
}

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
      <ErrorBoundary>
        <Canvas shadows dpr={Math.min(window.devicePixelRatio, 1.5)} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            <WorldDirector />
            <CameraDirector />
            <LightingDirector />
            <InteractionDirector />
            <AtmosphereDirector />
            <WeatherDirector />
            <UndergroundDirector />
            <Suspense fallback={null}>
              <GeologyDirector />
            </Suspense>
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <Loader 
        containerStyles={{ background: '#0a0802' }} 
        innerStyles={{ width: '300px' }} 
        barStyles={{ background: '#F5C036' }} 
        dataStyles={{ color: '#F5C036', fontFamily: 'Cinzel' }} 
      />
      
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
      <div>Weather State: {progression < 0.2 ? 'Calm' : progression < 0.6 ? 'Rain' : progression < 1.0 ? 'Cool Night' : 'Underground Soil'}</div>
    </div>
  );
}
