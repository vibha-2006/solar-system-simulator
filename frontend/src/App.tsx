import { Suspense } from 'react'
import { Navbar } from './components/navbar/Navbar'
import { Sidebar } from './components/sidebar/Sidebar'
import { InfoPanel } from './components/panels/InfoPanel'
import { ComparePanel } from './components/panels/ComparePanel'
import { SceneCanvas } from './three/SceneCanvas'
import { ViewportOverlay } from './components/ui/ViewportOverlay'
import { usePlanets } from './hooks/usePlanetData'
import { useStore } from './hooks/useStore'
import { useKeyboard } from './hooks/useKeyboard'
import './styles/globals.css'
import './App.css'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="7" fill="#dda83a"/>
          <ellipse cx="26" cy="26" rx="22" ry="9" stroke="#00d9aa" strokeWidth="1.8" fill="none" transform="rotate(-25 26 26)"/>
          <ellipse cx="26" cy="26" rx="22" ry="9" stroke="#dda83a" strokeWidth="1.8" fill="none" transform="rotate(25 26 26)" opacity="0.5"/>
          <circle cx="26" cy="26" r="3" fill="#fff7a0" opacity="0.9"/>
        </svg>
        <span className="loading-title">SOLAR SYSTEM SIMULATOR</span>
      </div>
      <div className="loading-bar">
        <div className="loading-progress" />
      </div>
      <span className="loading-text">Initializing Solar System…</span>
    </div>
  )
}

function AppContent() {
  const { planets, loading, error } = usePlanets()
  const { compareMode, infoPanelOpen, selectedBody } = useStore()
  useKeyboard()

  if (loading) return <LoadingScreen />

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#f87171" strokeWidth="2">
            <circle cx="20" cy="20" r="18"/>
            <path d="M20 12v10M20 28v2"/>
          </svg>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <p className="error-hint">Make sure the backend is running on port 8000</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="nova-layout">
        <Sidebar planets={planets} />
        <div className="nova-viewport" style={{ position: 'relative' }}>
          <Suspense fallback={<LoadingScreen />}>
            <SceneCanvas planets={planets} />
          </Suspense>
          <ViewportOverlay />
          {compareMode && (
            <ComparePanel planets={planets} />
          )}
        </div>
        {infoPanelOpen && selectedBody && !compareMode && (
          <InfoPanel />
        )}
      </div>
    </>
  )
}

export default function App() {
  return (
    <div className="nova-app">
      <AppContent />
    </div>
  )
}
