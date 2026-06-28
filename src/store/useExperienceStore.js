import { create } from 'zustand';

export const useExperienceStore = create((set) => ({
  isReady: false,
  setReady: (ready) => set({ isReady: ready }),

  // Pointer state for parallax (normalized -1 to 1)
  pointer: { x: 0, y: 0 },
  setPointer: (pointer) => set({ pointer }),

  // Scroll progression dictates the narrative timeline (0 to 1)
  progression: 0,
  targetProgression: 0,
  setTargetProgression: (target) => {
    if (isNaN(target) || !isFinite(target)) {
      console.warn('Engine Warning: Invalid progression value (NaN or Infinite). Value ignored.');
      return;
    }
    const clamped = Math.max(0, Math.min(2.5, target));
    set({ targetProgression: clamped });
  },

  // Debug State
  showDebug: false,
  toggleDebug: () => set((state) => ({ showDebug: !state.showDebug })),
  
  debugLighting: false,
  toggleDebugLighting: () => set((state) => ({ debugLighting: !state.debugLighting })),
}));
