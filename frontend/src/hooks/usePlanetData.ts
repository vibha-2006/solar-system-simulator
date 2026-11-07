import { useState, useEffect } from 'react'
import { fetchPlanets, fetchPlanet, fetchComparison } from '../services/api'
import type { PlanetSummary, PlanetDetail, ComparisonResult } from '../types'

export function usePlanets() {
  const [planets, setPlanets] = useState<PlanetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlanets()
      .then(setPlanets)
      .catch(() => setError('Failed to load planetary data'))
      .finally(() => setLoading(false))
  }, [])

  return { planets, loading, error }
}

export function usePlanetDetail(id: string | null) {
  const [detail, setDetail] = useState<PlanetDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) { setDetail(null); return }
    setLoading(true)
    fetchPlanet(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [id])

  return { detail, loading }
}

export function useComparison(bodyA: string | null, bodyB: string | null) {
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bodyA || !bodyB) { setResult(null); return }
    setLoading(true)
    setError(null)
    fetchComparison(bodyA, bodyB)
      .then(setResult)
      .catch(() => setError('Failed to load comparison'))
      .finally(() => setLoading(false))
  }, [bodyA, bodyB])

  return { result, loading, error }
}
