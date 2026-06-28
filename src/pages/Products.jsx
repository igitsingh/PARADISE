import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export function Products() {
  return (
    <div className="premium-page-container">
      <Link to="/" className="paradise-logo logo-link">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'PARADISE'.split('').map((char, index) => <span key={index}>{char}</span>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'ORGANICS'.split('').map((char, index) => <span key={index}>{char}</span>)}
        </div>
      </Link>
      
      <div className="premium-content-wrapper">
        <h1 className="premium-title">Products</h1>
        <div className="premium-divider"></div>
        <p className="premium-text">
          Experience the golden standard of wellness. Our flagship Lakadong Turmeric is renowned globally 
          for its exceptionally high curcumin content, offering unparalleled therapeutic benefits.
        </p>
        <p className="premium-text">
          Hand-harvested, shade-dried, and stone-ground to preserve its volatile essential oils, 
          every batch is a testament to uncompromised quality.
        </p>
        
        <Link to="/" className="premium-back-btn">Return to Experience</Link>
      </div>
    </div>
  );
}
