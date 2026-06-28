import { useEffect, useState } from 'react';
import { ExperienceDirector } from './directors/ExperienceDirector';
import { useExperienceStore } from './store/useExperienceStore';
import { SignupOverlay } from './components/SignupOverlay';
import './index.css';

function calcOpacity(p, start, end, fade = 0.05) {
  if (p < start || p > end) return 0;
  // If it's the very first block, don't fade in from 0, just be visible
  if (start === 0 && p < fade) return 1;
  if (p < start + fade) return (p - start) / Math.max(0.001, fade);
  if (p > end - fade) return (end - p) / Math.max(0.001, fade);
  return 1;
}

function StoryOverlay() {
  const [progression, setProgression] = useState(0);
  
  useEffect(() => {
    // Zustand v4 subscribe without selector takes a single listener: (state, previousState)
    const unsubscribe = useExperienceStore.subscribe((state) => {
      setProgression(state.progression);
    });
    return () => unsubscribe();
  }, []);

  const storyBlocks = [
    {
      start: 0.0, end: 0.15,
      content: (
        <>
          Our journey begins at the surface, but <strong style={{fontWeight: 800, letterSpacing: '1px'}}>TRUE PURITY</strong> is found <strong style={{fontWeight: 800, letterSpacing: '1px'}}>DEEP WITHIN THE EARTH</strong>.
          <br /><br />
          <span style={{ fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 600 }}>Scroll to discover origins</span>
        </>
      )
    },
    {
      start: 0.25, end: 0.45,
      content: (
        <>
          Nourished by the <strong style={{fontWeight: 800, color: '#aaccff'}}>PURE RAINS</strong> of Meghalaya.<br />Nature's cleansing blessing.
        </>
      )
    },
    {
      start: 0.55, end: 0.85,
      content: (
        <>
          Protected by the <strong style={{fontWeight: 800, color: '#c4d4e3'}}>COOL MOUNTAIN NIGHTS</strong>.<br />Where natural potency builds in absolute silence.
        </>
      )
    },
    {
      start: 1.0, end: 1.25,
      content: (
        <>
          Buried beneath layers of <strong style={{fontWeight: 800, color: '#e5a574'}}>UNTAMED, RICH SOIL</strong>...<br />A sacred treasure awaits.
        </>
      )
    },
    {
      start: 1.35, end: 1.65,
      content: (
        <>
          Behold the legendary <strong style={{fontWeight: 800, color: '#F5C036'}}>LAKADONG TURMERIC</strong>.<br />Unmatched curcumin. Unparalleled purity.
        </>
      )
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 100,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {storyBlocks.map((block, i) => {
        const opacity = calcOpacity(progression, block.start, block.end);
        if (opacity <= 0.01) return null;
        
        const isRight = i % 2 === 0; // 0, 2, 4 = right. 1, 3 = left.
        
        return (
          <div key={i} style={{ 
            position: 'absolute',
            bottom: '60px',
            right: isRight ? '60px' : undefined,
            left: !isRight ? '60px' : undefined,
            width: '450px',
            color: '#ffffff',
            fontFamily: '"Inter", sans-serif',
            fontSize: '28px',
            fontWeight: '300',
            lineHeight: '1.4',
            textAlign: 'left',
            textShadow: '0px 4px 20px rgba(0,0,0,0.6)',
            opacity: opacity,
            transform: `translateY(${(1 - opacity) * 10}px)`,
            transition: 'opacity 0.1s linear, transform 0.1s linear'
          }}>
            {block.content}
          </div>
        );
      })}
    </div>
  );
}

function App() {
  return (
    <div className="app-root">
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        zIndex: 100,
        color: '#ffffff',
        fontFamily: '"Cinzel", serif',
        fontSize: '32px',
        fontWeight: '700',
        pointerEvents: 'none',
        lineHeight: '1.1',
        textTransform: 'uppercase',
        display: 'flex',
        flexDirection: 'column',
        width: '260px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'PARADISE'.split('').map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'ORGANICS'.split('').map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </div>
      </div>
      <StoryOverlay />
      <SignupOverlay />
      <ExperienceDirector />
    </div>
  );
}

export default App;
