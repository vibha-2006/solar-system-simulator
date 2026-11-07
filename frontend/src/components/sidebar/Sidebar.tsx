import { useStore } from '../../hooks/useStore'
import type { PlanetSummary } from '../../types'
import './Sidebar.css'

interface SidebarProps {
  planets: PlanetSummary[]
}

const PLANET_ORDER = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon']

const SHORTCUTS = [
  { key: 'L', action: 'Select Body' },
  { key: 'Space', action: 'Pause / Resume' },
  { key: 'R', action: 'Reset Camera' },
  { key: '↑↓', action: 'Change Speed' },
  { key: 'C', action: 'Compare Planets' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'O', action: 'Toggle Orbits' },
  { key: 'ESC', action: 'Close Panel' },
]

export function Sidebar({ planets }: SidebarProps) {
  const {
    paused, speed, showOrbits, selectedBody,
    togglePause, increaseSpeed, decreaseSpeed,
    resetCamera, toggleOrbits, setSelectedBody,
    setCompareMode, setActiveTab, setInfoPanelOpen,
  } = useStore()

  const orderedPlanets = PLANET_ORDER
    .map(id => planets.find(p => p.id === id))
    .filter(Boolean) as PlanetSummary[]

  const handleZoom = (dir: 'in' | 'out') => {
    window.dispatchEvent(new CustomEvent('nova:zoom', { detail: dir }))
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
  }

  const handleCompare = () => {
    setCompareMode(true)
    setActiveTab('compare')
  }

  return (
    <aside className="nova-sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.6">
            <path d="M1 3h12v1H1zM1 7h12v1H1zM1 11h12v1H1z"/>
          </svg>
          <span>CONTROLS</span>
        </div>

        <button
          className={`btn-pause ${paused ? 'paused' : 'running'}`}
          onClick={togglePause}
        >
          {paused ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M3 2l7 4-7 4V2z"/>
              </svg>
              RESUME
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="2" y="2" width="3" height="8" rx="1"/>
                <rect x="7" y="2" width="3" height="8" rx="1"/>
              </svg>
              PAUSE
            </>
          )}
        </button>

        <div className="control-row label-row">
          <span className="ctrl-label">Simulation Speed</span>
        </div>
        <div className="control-row speed-row">
          <button className="ctrl-btn" onClick={decreaseSpeed} title="Decrease speed">−</button>
          <span className="speed-display">× {speed}</span>
          <button className="ctrl-btn" onClick={increaseSpeed} title="Increase speed">+</button>
        </div>

        <button className="ctrl-item" onClick={resetCamera}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
            <path d="M7 2a5 5 0 100 10A5 5 0 007 2zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" opacity="0.4"/>
            <path d="M7 1v3l1.5-1.5L7 1zM3.4 3.4l2.1 2.1-.7.7-2.1-2.1.7-.7z" opacity="0.8"/>
          </svg>
          <span>Reset Camera</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" opacity="0.4" className="ml-auto">
            <path d="M9 6a3 3 0 11-3-3v1.5A1.5 1.5 0 107.5 6H6l2 2 1-1-1-1H9z"/>
          </svg>
        </button>

        <button className="ctrl-item" onClick={toggleOrbits}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7">
            <ellipse cx="7" cy="7" rx="6" ry="2.5" transform="rotate(-20 7 7)"/>
          </svg>
          <span>Orbits: <span className={showOrbits ? 'accent-on' : 'accent-off'}>{showOrbits ? 'ON' : 'OFF'}</span></span>
          <div className={`toggle ${showOrbits ? 'on' : 'off'}`}>
            <div className="toggle-thumb" />
          </div>
        </button>

        <button className="ctrl-item" onClick={() => handleZoom('in')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
            <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5l3 3M5.5 6h1M6 5.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Zoom In</span>
          <span className="ctrl-hint">+</span>
        </button>

        <button className="ctrl-item" onClick={() => handleZoom('out')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
            <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5l3 3M4.5 6h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Zoom Out</span>
          <span className="ctrl-hint">−</span>
        </button>

        <button className="ctrl-item" onClick={handleFullscreen}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
            <path d="M1 1h4v1.5H2.5V4H1V1zm8 0h4v3h-1.5V2.5H9V1zM1 9h1.5v1.5H5V12H1V9zm8 1.5H11V9h1.5v3H9v-1.5z"/>
          </svg>
          <span>Fullscreen</span>
        </button>

        <button className="ctrl-item compare-btn" onClick={handleCompare}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
            <rect x="1" y="1" width="5" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="8" y="1" width="5" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span>Compare Planets</span>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.6">
            <circle cx="7" cy="7" r="3" fill="currentColor"/>
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1"/>
          </svg>
          <span>SELECT BODY</span>
        </div>

        <div className="planet-list">
          {orderedPlanets.map(planet => (
            <button
              key={planet.id}
              className={`planet-item ${selectedBody === planet.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedBody(planet.id)
                setInfoPanelOpen(true)
              }}
            >
              <div
                className="planet-dot"
                style={{
                  background: getPlanetGradient(planet),
                  boxShadow: `0 0 6px ${planet.color}66`,
                }}
              />
              <span className="planet-name">{planet.name}</span>
              {selectedBody === planet.id && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="ml-auto" opacity="0.6">
                  <path d="M5 9l-3-3 1-1 2 2 4-4 1 1z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section shortcuts-section">
        <div className="section-header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.6">
            <rect x="1" y="3" width="12" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="3" y="5" width="2" height="2" rx="0.5"/>
            <rect x="6" y="5" width="2" height="2" rx="0.5"/>
            <rect x="9" y="5" width="2" height="2" rx="0.5"/>
          </svg>
          <span>KEYBOARD SHORTCUTS</span>
        </div>
        <div className="shortcuts-grid">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="shortcut-row">
              <kbd className="kbd">{s.key}</kbd>
              <span className="shortcut-action">{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function getPlanetGradient(planet: PlanetSummary): string {
  const c = planet.color
  if (planet.id === 'sun') return `radial-gradient(circle, #fff7a0, #fdb813, #f97316)`
  if (planet.id === 'earth') return `radial-gradient(circle, #60a5fa, #1a6b9a, #0f4c75)`
  if (planet.id === 'mars') return `radial-gradient(circle, #ef8260, #c1440e, #8b2500)`
  if (planet.id === 'jupiter') return `radial-gradient(circle, #e8c470, #c88b3a, #9b6520)`
  if (planet.id === 'saturn') return `radial-gradient(circle, #f0e09a, #e4d191, #c4a040)`
  if (planet.id === 'uranus') return `radial-gradient(circle, #a8f0f0, #7de8e8, #40c0c0)`
  if (planet.id === 'neptune') return `radial-gradient(circle, #6080e8, #3f54ba, #1e2d8a)`
  if (planet.id === 'moon') return `radial-gradient(circle, #d0d0d0, #b0b0b0, #808080)`
  if (planet.id === 'venus') return `radial-gradient(circle, #f0dca8, #e8cda0, #c0a060)`
  if (planet.id === 'mercury') return `radial-gradient(circle, #d0d0d0, #b5b5b5, #808080)`
  return c
}
