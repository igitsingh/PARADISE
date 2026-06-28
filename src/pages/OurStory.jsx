import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../App.css';

gsap.registerPlugin(ScrollTrigger);

export function OurStory() {
  const container = useRef(null);

  useEffect(() => {
    // Generate random dust particles
    const dustLayer = container.current.querySelector('.dust-layer');
    if (dustLayer) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'dust-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 4 + 1}px`;
        particle.style.height = particle.style.width;
        
        // Random floating animation
        gsap.to(particle, {
          y: -100 - Math.random() * 200,
          x: (Math.random() - 0.5) * 100,
          opacity: 0,
          duration: 10 + Math.random() * 20,
          repeat: -1,
          ease: "none"
        });
        
        dustLayer.appendChild(particle);
      }
    }

    // GSAP Scroll Animations
    let ctx = gsap.context(() => {
      // Golden Thread Animation
      gsap.to('.golden-thread-fill', {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.story-scroll-wrapper',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        }
      });

      // Animate each story section
      const sections = gsap.utils.toArray('.story-section');
      
      sections.forEach((section, i) => {
        const content = section.querySelector('.story-content');
        
        gsap.to(content, {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top center+=100',
            end: 'center center',
            toggleActions: 'play none none reverse'
          }
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div className="magical-story-container" ref={container}>
      <Link to="/" className="paradise-logo logo-link">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'PARADISE'.split('').map((char, index) => <span key={index}>{char}</span>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'ORGANICS'.split('').map((char, index) => <span key={index}>{char}</span>)}
        </div>
      </Link>
      
      <div className="dust-layer"></div>

      <div className="story-scroll-wrapper">
        <div className="golden-thread-container">
          <div className="golden-thread-fill"></div>
        </div>

        <div className="story-section">
          <div className="story-content">
            <h1 className="story-headline">The Genesis</h1>
            <p className="story-paragraph">
              Deep within the pristine hills of Meghalaya lies a secret kept by the earth for generations. 
              Our journey began with a simple belief: true purity cannot be manufactured, it must be discovered.
            </p>
          </div>
        </div>

        <div className="story-section">
          <div className="story-content">
            <h1 className="story-headline">The Legend</h1>
            <p className="story-paragraph">
              Paradise Organics is more than a brand. It is a tribute to the legendary Lakadong turmeric, 
              cultivated by the native hands that understand the sacred rhythm of the soil.
            </p>
          </div>
        </div>

        <div className="story-section">
          <div className="story-content">
            <h1 className="story-headline">The Harvest</h1>
            <p className="story-paragraph">
              Watered by pure rains and guarded by absolute silence, the golden roots build unparalleled potency. 
              Only the finest are selected, honoring the land and the hands that harvest them.
            </p>
          </div>
        </div>
        
        <div className="story-section" style={{ minHeight: '50vh', paddingBottom: '100px' }}>
          <div className="story-content">
            <Link to="/" className="premium-back-btn" style={{ marginTop: '0' }}>Return to Experience</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
