import axios from 'axios'
import type { PlanetSummary, PlanetDetail, ComparisonResult } from '../types'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

export const fetchPlanets = (): Promise<PlanetSummary[]> =>
  api.get('/planets').then(r => r.data)

export const fetchPlanet = (id: string): Promise<PlanetDetail> =>
  api.get(`/planets/${id}`).then(r => r.data)

export const fetchFacts = (id: string): Promise<string[]> =>
  api.get(`/planets/${id}/facts`).then(r => r.data)

export const fetchComparison = (a: string, b: string): Promise<ComparisonResult> =>
  api.get('/compare', { params: { body_a: a, body_b: b } }).then(r => r.data)

export const fetchHealth = () =>
  api.get('/health').then(r => r.data)

export const fetchSimConfig = () =>
  api.get('/simulation/config').then(r => r.data)
