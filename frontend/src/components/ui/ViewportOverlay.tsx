import { useStore } from '../../hooks/useStore'
import './ViewportOverlay.css'

export function ViewportOverlay() {
  const { resetCamera } = useStore()

  const handleZoom = (dir: 'in' | 'out') => {
    window.dispatchEvent(new CustomEvent('nova:zoom', { detail: dir }))
  }

  return (
    <>
      {/* Compass */}
      <div className="viewport-compass">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="27" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.4)"/>
          {/* N */}
          <line x1="30" y1="30" x2="30" y2="6" stroke="rgba(99,179,237,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="30" y="5" textAnchor="middle" fill="#63b3ed" fontSize="8" fontFamily="Inter" fontWeight="600">N</text>
          {/* S */}
          <line x1="30" y1="30" x2="30" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
          <text x="30" y="59" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Inter">S</text>
          {/* E */}
          <line x1="30" y1="30" x2="54" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
          <text x="58" y="33" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Inter">E</text>
          {/* W */}
          <line x1="30" y1="30" x2="6" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
          <text x="3" y="33" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Inter">W</text>
        </svg>
      </div>

      {/* Camera controls */}
      <div className="viewport-controls">
        <button className="vp-btn" onClick={() => handleZoom('in')} title="Zoom In">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M6 3v3H3v2h3v3h2V8h3V6H8V3H6z"/>
          </svg>
        </button>
        <button className="vp-btn" onClick={() => handleZoom('out')} title="Zoom Out">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 6h8v2H3z"/>
          </svg>
        </button>
        <button className="vp-btn" onClick={resetCamera} title="Reset Camera">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M7 2a5 5 0 100 10A5 5 0 007 2zm0 1.5v3l2 1-1 1.7L6 8V3.5z" opacity="0.8"/>
          </svg>
        </button>
      </div>
    </>
  )
}
