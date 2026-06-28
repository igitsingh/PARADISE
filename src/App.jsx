import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ExperienceDirector } from './directors/ExperienceDirector';
import { SoundDirector } from './directors/SoundDirector';
import { useExperienceStore } from './store/useExperienceStore';
import { SignupOverlay } from './components/SignupOverlay';
import { BrandOverlay } from './components/BrandOverlay';
import { BottomNav } from './components/BottomNav';
import { OurStory } from './pages/OurStory';
import { Products } from './pages/Products';
import { ImpactReport } from './pages/ImpactReport';
import { Distributors } from './pages/Distributors';
import './index.css';
import './App.css';

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
      start: 0.1, end: 0.45,
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
    <div className="story-overlay-container">
      {storyBlocks.map((block, index) => {
        const opacity = Math.max(0, Math.min(1, calcOpacity(progression, block.start, block.end)));
        if (opacity <= 0.01) return null;

        const isRight = index % 2 === 0;

        return (
          <div key={index} className={`story-block ${isRight ? 'align-right' : 'align-left'}`} style={{
            opacity: opacity,
            transform: `translateY(${(1 - opacity) * 10}px)`
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
    <>
      <Routes>
        <Route path="/" element={
          <div className="app-root">
            <BrandOverlay />
            <StoryOverlay />
            <SignupOverlay />
            <SoundDirector />
            <ExperienceDirector />
          </div>
        } />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/impact-report" element={<ImpactReport />} />
        <Route path="/distributors" element={<Distributors />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;
