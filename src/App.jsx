import { ExperienceDirector } from './directors/ExperienceDirector';
import './index.css';

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
          {'PARADISE'.split('').map((char, index) => <span key={index}>{char}</span>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {'ORGANICS'.split('').map((char, index) => <span key={index}>{char}</span>)}
        </div>
      </div>
      <ExperienceDirector />
    </div>
  );
}

export default App;
