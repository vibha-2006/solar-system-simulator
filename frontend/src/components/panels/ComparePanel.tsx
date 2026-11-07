import { useStore } from '../../hooks/useStore'
import { useComparison } from '../../hooks/usePlanetData'
import type { PlanetSummary, ComparisonItem } from '../../types'
import './ComparePanel.css'

interface ComparePanelProps {
  planets: PlanetSummary[]
}

const PLANET_ORDER = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon']

export function ComparePanel({ planets }: ComparePanelProps) {
  const { compareBodyA, compareBodyB, setCompareBodyA, setCompareBodyB, setCompareMode, setActiveTab } = useStore()
  const { result, loading, error } = useComparison(compareBodyA, compareBodyB)

  const ordered = PLANET_ORDER
    .map(id => planets.find(p => p.id === id))
    .filter(Boolean) as PlanetSummary[]

  const handleClose = () => {
    setCompareMode(false)
    setActiveTab('home')
    setCompareBodyA(null)
    setCompareBodyB(null)
  }

  return (
    <div className="compare-overlay">
      <div className="compare-panel">
        <div className="compare-header">
          <div className="compare-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.7">
              <rect x="1" y="1" width="6" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>PLANET COMPARISON</span>
          </div>
          <button className="close-compare-btn" onClick={handleClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Close</span>
          </button>
        </div>

        <div className="selector-row">
          <div className="body-selector">
            <span className="selector-label">Body A</span>
            <div className="selector-grid">
              {ordered.map(p => (
                <button
                  key={p.id}
                  className={`sel-btn ${compareBodyA === p.id ? 'active-a' : ''}`}
                  onClick={() => setCompareBodyA(p.id)}
                  style={{ '--dot-color': p.color } as React.CSSProperties}
                >
                  <span className="sel-dot" style={{ background: p.color }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="vs-badge">VS</div>

          <div className="body-selector">
            <span className="selector-label">Body B</span>
            <div className="selector-grid">
              {ordered.map(p => (
                <button
                  key={p.id}
                  className={`sel-btn ${compareBodyB === p.id ? 'active-b' : ''}`}
                  onClick={() => setCompareBodyB(p.id)}
                  style={{ '--dot-color': p.color } as React.CSSProperties}
                >
                  <span className="sel-dot" style={{ background: p.color }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {!compareBodyA || !compareBodyB ? (
          <div className="compare-prompt">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <rect x="4" y="4" width="14" height="32" rx="2"/>
              <rect x="22" y="4" width="14" height="32" rx="2"/>
            </svg>
            <p>Select two celestial bodies to compare</p>
          </div>
        ) : loading ? (
          <div className="compare-loading">
            <div className="loading-spinner" />
            <span>Loading comparison…</span>
          </div>
        ) : error ? (
          <div className="compare-error">{error}</div>
        ) : result ? (
          <div className="compare-results">
            <div className="bodies-header">
              <div className="body-name-a">{result.body_a.name}</div>
              <div className="col-label">Metric</div>
              <div className="body-name-b">{result.body_b.name}</div>
            </div>
            {result.comparisons.map((item: ComparisonItem) => (
              <CompareRow key={item.label} item={item} />
            ))}
            <div className="compare-insight">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.6">
                <circle cx="7" cy="5" r="2"/>
                <path d="M6 8h2v4H6z"/>
                <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <p>{result.insight}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CompareRow({ item }: { item: ComparisonItem }) {
  const hasNumeric = item.a_numeric !== null && item.b_numeric !== null && item.a_numeric !== item.b_numeric
  let aBar = 50, bBar = 50
  if (hasNumeric && item.a_numeric !== null && item.b_numeric !== null) {
    const max = Math.max(item.a_numeric, item.b_numeric)
    aBar = (item.a_numeric / max) * 100
    bBar = (item.b_numeric / max) * 100
  }

  return (
    <div className="compare-row">
      <div className="compare-cell cell-a">
        {hasNumeric && <div className="bar bar-a" style={{ width: `${aBar}%` }} />}
        <span className="cell-val">{item.a_value}</span>
      </div>
      <div className="compare-metric">{item.label}</div>
      <div className="compare-cell cell-b">
        {hasNumeric && <div className="bar bar-b" style={{ width: `${bBar}%` }} />}
        <span className="cell-val">{item.b_value}</span>
      </div>
    </div>
  )
}
