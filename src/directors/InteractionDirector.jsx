import { useEffect } from 'react';
import { useExperienceStore } from '../store/useExperienceStore';

export function InteractionDirector() {
  const setPointer = useExperienceStore((state) => state.setPointer);
  const setTargetProgression = useExperienceStore((state) => state.setTargetProgression);
  const toggleDebug = useExperienceStore((state) => state.toggleDebug);
  const toggleDebugLighting = useExperienceStore((state) => state.toggleDebugLighting);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize pointer coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointer({ x, y });
    };

    const handleWheel = (e) => {
      // Much slower progression so the user can easily stop on a beat
      setTargetProgression(useExperienceStore.getState().targetProgression + e.deltaY * 0.0002);
    };

    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'd') {
        toggleDebug();
      }
      if (e.key.toLowerCase() === 'l') {
        toggleDebugLighting();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setPointer, setTargetProgression, toggleDebug, toggleDebugLighting]);

  return null;
}
