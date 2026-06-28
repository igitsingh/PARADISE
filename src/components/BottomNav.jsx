import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useExperienceStore } from '../store/useExperienceStore';
import '../App.css';

export function BottomNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const desktopNavRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== '/') return;
    
    const unsubscribe = useExperienceStore.subscribe((state) => {
      const prog = Number(state.progression) || 0;
      if (desktopNavRef.current) {
        let opacity = 0;
        // Fade in after the 'Join the Inner Circle' card appears (prog > 2.0)
        if (prog > 2.0) {
          opacity = Math.min(1, (prog - 2.0) / 0.2); 
        }
        desktopNavRef.current.style.opacity = opacity.toString();
        desktopNavRef.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
      }
    });

    return () => unsubscribe();
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Bottom Nav - Only on Home Page, faded in at the bottom */}
      {location.pathname === '/' && (
        <div className="bottom-nav-container desktop-only" ref={desktopNavRef} style={{ opacity: 0, pointerEvents: 'none' }}>
          <div className="bottom-nav-glass">
            <Link to="/our-story" className={`bottom-nav-link ${location.pathname === '/our-story' ? 'active' : ''}`}>
              Our Story
            </Link>
            <Link to="/products" className={`bottom-nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
              Products
            </Link>
            <Link to="/impact-report" className={`bottom-nav-link ${location.pathname === '/impact-report' ? 'active' : ''}`}>
              Impact Report
            </Link>
            <Link to="/distributors" className={`bottom-nav-link ${location.pathname === '/distributors' ? 'active' : ''}`}>
              For Distributors
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Top Right Circle & Menu */}
      <div className="mobile-menu-wrapper mobile-only">
        <button 
          className={`mobile-menu-btn ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
        </button>
        
        <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <Link to="/our-story" onClick={() => setIsOpen(false)} className="mobile-nav-link">Our Story</Link>
            <Link to="/products" onClick={() => setIsOpen(false)} className="mobile-nav-link">Products</Link>
            <Link to="/impact-report" onClick={() => setIsOpen(false)} className="mobile-nav-link">Impact Report</Link>
            <Link to="/distributors" onClick={() => setIsOpen(false)} className="mobile-nav-link">For Distributors</Link>
          </div>
        </div>
      </div>
    </>
  );
}
