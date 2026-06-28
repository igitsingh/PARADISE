import { useEffect } from 'react';
import { useExperienceStore } from '../store/useExperienceStore';

export function InteractionDirector() {
  const setPointer = useExperienceStore((state) => state.setPointer);
  const setTargetProgression = useExperienceStore((state) => state.setTargetProgression);
  const toggleDebug = useExperienceStore((state) => state.toggleDebug);
  const toggleDebugLighting = useExperienceStore((state) => state.toggleDebugLighting);

  useEffect(() => {
    let lastTouchY = 0;

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

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touchY = e.touches[0].clientY;
        const deltaY = lastTouchY - touchY;
        // Sensitivity for swipe vs wheel
        setTargetProgression(useExperienceStore.getState().targetProgression + deltaY * 0.003);
        lastTouchY = touchY;
      }
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
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setPointer, setTargetProgression, toggleDebug, toggleDebugLighting]);

  return null;
}
