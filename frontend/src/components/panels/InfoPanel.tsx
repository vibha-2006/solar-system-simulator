import { useStore } from '../../hooks/useStore'
import { usePlanetDetail } from '../../hooks/usePlanetData'
import './InfoPanel.css'

export function InfoPanel() {
  const { selectedBody, infoPanelOpen, setInfoPanelOpen, setSelectedBody } = useStore()
  const { detail, loading } = usePlanetDetail(selectedBody)

  if (!infoPanelOpen || !selectedBody) return null

  const handleClose = () => {
    setInfoPanelOpen(false)
    setSelectedBody(null)
  }

  if (loading) {
    return (
      <aside className="nova-info-panel">
        <div className="panel-loading">
          <div className="loading-spinner" />
          <span>Loading data…</span>
        </div>
      </aside>
    )
  }

  if (!detail) return null

  const stats = [
    { label: 'Radius', value: `${detail.radius_km.toLocaleString()} km` },
    { label: 'Diameter', value: `${detail.diameter_km.toLocaleString()} km` },
    { label: 'Mass', value: detail.mass_kg },
    { label: 'Distance from Sun', value: detail.distance_au > 0 ? `${detail.distance_au.toFixed(3)} AU` : '—' },
    { label: 'Orbital period', value: detail.orbital_period_days > 0 ? `${detail.orbital_period_days.toFixed(2)} days` : '—' },
    { label: 'Rotation period', value: detail.rotation_period },
    { label: 'Axial tilt', value: `${detail.axial_tilt_deg.toFixed(2)}°` },
    { label: 'Surface temperature', value: detail.surface_temperature },
    { label: 'Atmosphere', value: detail.atmosphere },
    { label: 'Known moons', value: detail.known_moons.toString() },
  ]

  return (
    <aside className="nova-info-panel">
      <div className="info-header">
        <div className="planet-portrait">
          <div
            className="portrait-sphere"
            style={{
              background: getPlanetGradient(detail.id),
              boxShadow: `0 0 20px ${detail.color}44, 0 0 40px ${detail.color}22`,
            }}
          />
        </div>
        <div className="header-text">
          <h2 className="planet-title">{detail.name}</h2>
          <p className="planet-class">{detail.classification}</p>
        </div>
        <button className="close-btn" onClick={handleClose} aria-label="Close panel">×</button>
      </div>

      <p className="planet-description">{detail.description}</p>

      <div className="stats-section">
        <div className="stats-heading">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
            <rect x="1" y="8" width="2" height="5" rx="1"/>
            <rect x="4" y="5" width="2" height="8" rx="1"/>
            <rect x="7" y="3" width="2" height="10" rx="1"/>
            <rect x="10" y="1" width="2" height="12" rx="1"/>
          </svg>
          <span>STATISTICS</span>
        </div>
        <div className="stats-table">
          {stats.map(s => (
            <div key={s.label} className="stat-row">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {detail.facts.length > 0 && (
        <div className="facts-section">
          <div className="stats-heading">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.7">
              <circle cx="7" cy="5" r="2"/>
              <path d="M6 8h2v5H6z" rx="1"/>
              <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span>DID YOU KNOW?</span>
          </div>
          <ol className="facts-list">
            {detail.facts.map((fact, i) => (
              <li key={i} className="fact-item">
                <span className="fact-num">{i + 1}</span>
                <span className="fact-text">{fact}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </aside>
  )
}

function getPlanetGradient(id: string): string {
  const gradients: Record<string, string> = {
    sun: 'radial-gradient(circle at 35% 35%, #fff7a0, #fdb813, #f97316, #c05010)',
    mercury: 'radial-gradient(circle at 35% 35%, #d8d8d8, #b5b5b5, #808080)',
    venus: 'radial-gradient(circle at 35% 35%, #f5e8c0, #e8cda0, #c0a060)',
    earth: 'radial-gradient(circle at 35% 35%, #80c8f0, #3080c0, #1a5090, #206030)',
    mars: 'radial-gradient(circle at 35% 35%, #f09070, #c1440e, #8b2500)',
    jupiter: 'radial-gradient(circle at 35% 35%, #f0d890, #c88b3a, #9b6520)',
    saturn: 'radial-gradient(circle at 35% 35%, #f8f0c0, #e4d191, #c4a040)',
    uranus: 'radial-gradient(circle at 35% 35%, #c8f8f8, #7de8e8, #40c0c0)',
    neptune: 'radial-gradient(circle at 35% 35%, #8090f8, #3f54ba, #1e2d8a)',
    moon: 'radial-gradient(circle at 35% 35%, #e0e0e0, #b0b0b0, #707070)',
  }
  return gradients[id] || 'radial-gradient(circle, #aaa, #555)'
}
