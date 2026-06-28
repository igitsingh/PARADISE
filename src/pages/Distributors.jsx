import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export function Distributors() {
  return (
    <div className="premium-page-container">
      <Link to="/" className="paradise-logo logo-link">
        PARADISE ORGANICS
      </Link>
      
      <div className="premium-content-wrapper">
        <h1 className="premium-title">For Distributors</h1>
        <div className="premium-divider"></div>
        <p className="premium-text">
          Join the Paradise Organics Inner Circle. We are looking for exclusive partners who share 
          our vision of bringing uncompromised purity to the global market.
        </p>
        <p className="premium-text">
          As a distributor, you gain access to our premium supply chain, marketing materials, 
          and a dedicated support team committed to your success.
        </p>
        
        <Link to="/" className="premium-back-btn">Return to Experience</Link>
      </div>
    </div>
  );
}
