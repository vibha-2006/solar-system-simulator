import { useStore } from '../../hooks/useStore'
import type { NavTab } from '../../types'
import './Navbar.css'

const NAV_TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'simulation', label: 'Simulation', icon: '▷' },
  { id: 'compare', label: 'Compare', icon: '⊞' },
  { id: 'learn', label: 'Learn', icon: '📖' },
  { id: 'about', label: 'About', icon: 'ℹ' },
]

export function Navbar() {
  const { activeTab, setActiveTab, paused, speed, fps, setCompareMode, compareMode } = useStore()

  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab)
    if (tab === 'compare') setCompareMode(true)
    else if (compareMode) setCompareMode(false)
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <nav className="nova-navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="3.5" fill="#dda83a"/>
            <ellipse cx="13" cy="13" rx="11" ry="4.5" stroke="#00d9aa" strokeWidth="1.4" fill="none" transform="rotate(-25 13 13)"/>
            <ellipse cx="13" cy="13" rx="11" ry="4.5" stroke="#dda83a" strokeWidth="1.4" fill="none" transform="rotate(25 13 13)" opacity="0.55"/>
            <circle cx="13" cy="13" r="1.5" fill="#fff7a0" opacity="0.9"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">SOLAR SYSTEM</span>
          <span className="brand-subtitle">SIMULATOR</span>
        </div>
      </div>

      <div className="navbar-nav">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="nav-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-status">
        <div className={`status-badge ${paused ? 'paused' : 'running'}`}>
          <span className="status-dot" />
          <span>{paused ? 'PAUSED' : 'RUNNING'}</span>
        </div>
        <div className="speed-badge">
          <span className="speed-x">×</span>
          <span className="speed-value">{speed}</span>
        </div>
        <div className="fps-badge">
          <span className="fps-value">{fps}</span>
          <span className="fps-label"> FPS</span>
        </div>
        <button className="icon-btn" title="Fullscreen" onClick={handleFullscreen}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.5 1h4v1.5h-2.5v2.5h-1.5v-4zm9 0h4v4h-1.5v-2.5h-2.5v-1.5zm-9 9h1.5v2.5h2.5v1.5h-4v-4zm11.5 2.5v-2.5h1.5v4h-4v-1.5h2.5z"/>
          </svg>
        </button>
        <button className="icon-btn" title="Settings">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 5a3 3 0 100 6 3 3 0 000-6zm-5.293 1.707l1.414 1.414A5.016 5.016 0 003 8c0-.129.009-.256.021-.38l-1.414-1.414A7 7 0 018 1a7 7 0 016.707 4.95L13.293 7.364A5.016 5.016 0 0013 8c0 .129-.009.256-.021.38l1.414 1.414A7 7 0 018 15a7 7 0 01-6.707-4.95l1.414-1.464A5.016 5.016 0 003 8c0-.129.009-.256.021-.38z" opacity="0.5"/>
            <path d="M8 6.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}
