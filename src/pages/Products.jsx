import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export function Products() {
  return (
    <div className="premium-page-container" style={{ overflowY: 'auto' }}>
      <Link to="/" className="paradise-logo logo-link">
        PARADISE ORGANICS
      </Link>
      
      <div className="premium-content-wrapper" style={{ maxWidth: '1000px', marginTop: '120px', marginBottom: '80px', padding: '0 20px', width: '100%' }}>
        <h1 className="premium-title" style={{ fontSize: '3rem', letterSpacing: '0.1em' }}>Our Origins <span style={{ fontSize: '1rem', verticalAlign: 'middle', opacity: 0.6, letterSpacing: '0.15em', marginLeft: '10px' }}>(Coming Soon)</span></h1>
        <div className="premium-divider" style={{ marginBottom: '60px' }}></div>
        
        <div className="coming-soon-grid">
          {/* TURMERIC PLACEHOLDER */}
          <div className="placeholder-card">
            <div className="placeholder-content">
              <h2>TURMERIC</h2>
              <div className="placeholder-line"></div>
              <p>The golden standard of wellness.</p>
            </div>
          </div>

          {/* GINGER PLACEHOLDER */}
          <div className="placeholder-card">
            <div className="placeholder-content">
              <h2>GINGER</h2>
              <div className="placeholder-line"></div>
              <p>Intense aromatics and therapeutic warmth.</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '80px' }}>
          <Link to="/" className="premium-back-btn">Return to Experience</Link>
        </div>
      </div>
    </div>
  );
}
