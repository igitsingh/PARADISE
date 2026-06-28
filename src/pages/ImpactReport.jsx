import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export function ImpactReport() {
  return (
    <div className="premium-page-container">
      <Link to="/" className="paradise-logo logo-link">
        PARADISE ORGANICS
      </Link>
      
      <div className="premium-content-wrapper">
        <h1 className="premium-title">Impact Report</h1>
        <div className="premium-divider"></div>
        <p className="premium-text">
          Sustainability is not a modern buzzword for us; it is the ancient way of life in Meghalaya. 
          Our farming practices regenerate the earth rather than depleting it.
        </p>
        <p className="premium-text">
          By partnering directly with indigenous farming communities, we ensure fair trade, 
          empower local women, and preserve the biodiversity of one of the world's most 
          breathtaking landscapes.
        </p>
        
        <Link to="/" className="premium-back-btn">Return to Experience</Link>
      </div>
    </div>
  );
}
