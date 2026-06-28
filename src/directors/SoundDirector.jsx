import React, { useEffect, useState, useRef } from 'react';
import { useExperienceStore } from '../store/useExperienceStore';

export function SoundDirector() {
  const [hasStarted, setHasStarted] = useState(false);
  const audioCtxRef = useRef(null);
  
  // Refs to control volumes dynamically
  const birdsGainRef = useRef(null);
  const rainGainRef = useRef(null);
  const windGainRef = useRef(null);
  
  // Track active intervals and timeouts for cleanup
  const timersRef = useRef(new Set());
  const wrapperRef = useRef(null);

  const addTimer = (id, isInterval = false) => {
    timersRef.current.add({ id, isInterval });
    return id;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach(({ id, isInterval }) => {
      if (isInterval) clearInterval(id);
      else clearTimeout(id);
    });
    timersRef.current.clear();
  };

  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // --- SHARED NOISE BUFFER ---
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // --- 1. RAIN SYNTHESIS ---
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1200;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGainRef.current = rainGain;

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(ctx.destination);
    rainSource.start();

    // --- 2. WIND SYNTHESIS ---
    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 300;

    addTimer(setInterval(() => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
      try {
        const targetFreq = 150 + Math.random() * 300;
        windFilter.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 2);
      } catch (e) {
        // Ignore InvalidStateError if context is closing
      }
    }, 2000), true);

    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windGainRef.current = windGain;

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ctx.destination);
    windSource.start();

    // --- 3. BIRD SYNTHESIS ---
    const birdsGain = ctx.createGain();
    birdsGain.gain.value = 0.5;
    birdsGainRef.current = birdsGain;
    birdsGain.connect(ctx.destination);

    const playBirdChirp = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
      
      try {
        const prog = Number(useExperienceStore.getState().progression) || 0;
        
        // Only play sound if birds are visible (prog < 0.3) and gain is audible
        if (prog < 0.3 && birdsGainRef.current && birdsGainRef.current.gain.value >= 0.05) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const baseFreq = 3000 + Math.random() * 2000;
          osc.type = 'sine';
          osc.frequency.value = baseFreq;
          osc.frequency.exponentialRampToValueAtTime(baseFreq + (Math.random() > 0.5 ? 1000 : -500), ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
          osc.connect(gain);
          gain.connect(birdsGainRef.current);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch (e) {}

      // Play much less regularly (between 4 to 12 seconds)
      addTimer(setTimeout(playBirdChirp, Math.random() * 8000 + 4000), false);
    };

    playBirdChirp();
    addTimer(setTimeout(playBirdChirp, 2000), false);

    setHasStarted(true);
  };

  const stopAudio = () => {
    clearAllTimers();
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setHasStarted(false);
  };

  useEffect(() => {
    const unsubscribe = useExperienceStore.subscribe((state) => {
      const prog = Number(state.progression) || 0; 
      
      // Update wrapper opacity to fade out at the bottom
      if (wrapperRef.current) {
        let opacity = 1;
        if (prog > 1.0) {
          opacity = Math.max(0, 1 - (prog - 1.0) / 0.2); // Fades completely by 1.2
        }
        wrapperRef.current.style.opacity = opacity.toString();
        wrapperRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
      }

      if (!birdsGainRef.current || !rainGainRef.current || !windGainRef.current) return;
      if (isNaN(prog)) return;

      try {
        let birdsVol = 1 - (prog / 0.25);
        birdsGainRef.current.gain.value = Math.max(0, Math.min(1, birdsVol)) * 0.5;

        let rainVol = 0;
        if (prog > 0.1 && prog < 0.7) {
          if (prog <= 0.3) rainVol = (prog - 0.1) / 0.2;
          else if (prog <= 0.5) rainVol = 1;
          else rainVol = 1 - ((prog - 0.5) / 0.2);
        }
        // -10dB reduction from 1.5 multiplier (~0.47)
        rainGainRef.current.gain.value = Math.max(0, Math.min(1, rainVol)) * 0.47;

        let windVol = 0;
        if (prog > 0.5 && prog < 1.1) {
          if (prog <= 0.7) windVol = (prog - 0.5) / 0.2;
          else if (prog <= 0.9) windVol = 1;
          else windVol = 1 - ((prog - 0.9) / 0.2);
        }
        // -10dB reduction from 2.0 multiplier (~0.63)
        windGainRef.current.gain.value = Math.max(0, Math.min(1, windVol)) * 0.63;

      } catch (e) {
        console.error("Audio Update Error:", e);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <div className="listen-btn-wrapper" ref={wrapperRef}>
      {!hasStarted ? (
        <span className="listen-text" onClick={initAudio}>
          LISTEN
        </span>
      ) : (
        <span className="listen-text active" onClick={stopAudio}>
          MUTE
        </span>
      )}
    </div>
  );
}
