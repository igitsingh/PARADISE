import { useState, useEffect } from 'react';
import { useExperienceStore } from '../store/useExperienceStore';

export function BrandOverlay() {
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    const unsubscribe = useExperienceStore.subscribe((state) => {
      setProgression(Number(state.progression) || 0);
    });
    return () => unsubscribe();
  }, []);

  // Appears smoothly when the rain scene starts (p = 0.1)
  let opacity = 0;
  if (progression > 0.1) {
    opacity = Math.min((progression - 0.1) / 0.1, 1.0);
  }

  // Fade out at the very end when the card appears? Or keep it? The user said "appear on the left", usually it can stay.
  // We will keep it.

  if (opacity <= 0) return null;

  // Let's not rotate it on mobile to save space, or just use a standard layout.
  // Actually, rotated looks very elegant and modern for side text.
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        position: 'absolute',
        left: isMobile ? '1.5rem' : '2.5rem',
        top: isMobile ? '1.5rem' : '2.5rem',
        color: '#ffffff',
        fontFamily: '"Playfair Display", serif',
        fontSize: isMobile ? '0.85rem' : '1.1rem',
        letterSpacing: '0.2em',
        opacity: opacity,
        transition: 'opacity 0.1s linear',
        pointerEvents: 'none',
        zIndex: 20,
        whiteSpace: 'nowrap',
      }}
    >
      PARADISE ORGANICS
    </div>
  );
}
