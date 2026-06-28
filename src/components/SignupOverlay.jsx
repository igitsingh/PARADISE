import { useState, useEffect } from 'react';
import { useExperienceStore } from '../store/useExperienceStore';

export function SignupOverlay() {
  const [progression, setProgression] = useState(0);
  const [role, setRole] = useState('Enthusiast');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = useExperienceStore.subscribe((state) => {
      setProgression(state.progression);
    });
    return () => unsubscribe();
  }, []);

  // Fade in after p = 2.0 (when floating in the void)
  const opacity = progression < 2.0 ? 0 : Math.min((progression - 2.0) / 0.4, 1.0);
  
  if (opacity <= 0) return null;

  const handleSignup = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  const roles = ['Importer', 'Distributor', 'Retailer', 'Enthusiast'];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 200,
      pointerEvents: opacity < 0.5 ? 'none' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: opacity,
      transition: 'opacity 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '50px 40px',
        background: 'rgba(10, 8, 2, 0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(245, 192, 54, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontFamily: '"Inter", sans-serif',
        textAlign: 'center',
        transform: `translateY(${(1 - opacity) * 30}px)`,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}>
        
        {submitted ? (
          <div style={{ padding: '40px 0' }}>
            <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: '32px', color: '#F5C036', marginBottom: '16px' }}>
              Welcome to Paradise
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: '300' }}>
              Your journey to unparalleled purity begins now.<br />We will be in touch shortly.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ 
              fontFamily: '"Cinzel", serif', 
              fontSize: '36px', 
              color: '#F5C036', 
              marginBottom: '12px',
              textShadow: '0 2px 10px rgba(245, 192, 54, 0.3)'
            }}>
              Join the Inner Circle
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px', fontWeight: '300', lineHeight: '1.5' }}>
              Unlock wholesale pricing, exclusive harvest access, and partner directly with the source of true Lakadong purity.
            </p>
            
            <div style={{ 
              display: 'flex', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '12px', 
              padding: '4px',
              marginBottom: '32px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: role === r ? 'rgba(245, 192, 54, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: role === r ? '#F5C036' : 'rgba(255,255,255,0.5)',
                    fontSize: '14px',
                    fontWeight: role === r ? '500' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: role === r ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="email" 
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(245, 192, 54, 0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #F5C036 0%, #D49A1F 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#0A0802',
                  fontSize: '16px',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 192, 54, 0.3)',
                  transition: 'transform 0.1s, box-shadow 0.1s'
                }}
              >
                Access the Paradise Network
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}