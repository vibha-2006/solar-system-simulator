export interface PlanetSummary {
  id: string
  name: string
  classification: string
  color: string
  type: string
  orbital_radius_visual: number
  size_visual: number
  has_rings: boolean
  parent_id: string | null
  orbital_period_days: number
}

export interface PlanetDetail extends PlanetSummary {
  description: string
  radius_km: number
  diameter_km: number
  mass_kg: string
  mass_value: number
  distance_from_sun_km: number
  distance_au: number
  orbital_period_days: number
  rotation_period: string
  axial_tilt_deg: number
  surface_temperature: string
  atmosphere: string
  known_moons: number
  facts: string[]
}

export interface ComparisonItem {
  label: string
  a_value: string
  b_value: string
  a_numeric: number | null
  b_numeric: number | null
}

export interface ComparisonResult {
  body_a: PlanetDetail
  body_b: PlanetDetail
  comparisons: ComparisonItem[]
  insight: string
}

export interface SimulationState {
  paused: boolean
  speed: number
  showOrbits: boolean
  selectedBody: string | null
  compareMode: boolean
  compareBodyA: string | null
  compareBodyB: string | null
  fullscreen: boolean
  fps: number
}

export type NavTab = 'home' | 'simulation' | 'compare' | 'learn' | 'about'
