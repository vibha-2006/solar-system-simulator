import { create } from 'zustand'
import type { SimulationState, NavTab } from '../types'

interface AppStore extends SimulationState {
  activeTab: NavTab
  infoPanelOpen: boolean
  setActiveTab: (tab: NavTab) => void
  setSelectedBody: (id: string | null) => void
  togglePause: () => void
  setSpeed: (speed: number) => void
  increaseSpeed: () => void
  decreaseSpeed: () => void
  toggleOrbits: () => void
  setCompareMode: (v: boolean) => void
  setCompareBodyA: (id: string | null) => void
  setCompareBodyB: (id: string | null) => void
  setFullscreen: (v: boolean) => void
  setFps: (fps: number) => void
  setInfoPanelOpen: (v: boolean) => void
  resetCamera: () => void
  _cameraResetSignal: number
}

const SPEED_STEPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000]

export const useStore = create<AppStore>((set, get) => ({
  paused: false,
  speed: 50,
  showOrbits: true,
  selectedBody: 'earth',
  compareMode: false,
  compareBodyA: null,
  compareBodyB: null,
  fullscreen: false,
  fps: 0,
  activeTab: 'home',
  infoPanelOpen: true,
  _cameraResetSignal: 0,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedBody: (id) => set({ selectedBody: id, infoPanelOpen: id !== null }),
  togglePause: () => set(s => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  increaseSpeed: () => {
    const { speed } = get()
    const idx = SPEED_STEPS.findIndex(s => s >= speed)
    const next = idx < SPEED_STEPS.length - 1 ? SPEED_STEPS[idx + 1] : SPEED_STEPS[SPEED_STEPS.length - 1]
    set({ speed: next })
  },
  decreaseSpeed: () => {
    const { speed } = get()
    const idx = SPEED_STEPS.findIndex(s => s >= speed)
    const prev = idx > 0 ? SPEED_STEPS[idx - 1] : SPEED_STEPS[0]
    set({ speed: prev })
  },
  toggleOrbits: () => set(s => ({ showOrbits: !s.showOrbits })),
  setCompareMode: (v) => set({ compareMode: v, activeTab: v ? 'compare' : 'home' }),
  setCompareBodyA: (id) => set({ compareBodyA: id }),
  setCompareBodyB: (id) => set({ compareBodyB: id }),
  setFullscreen: (v) => set({ fullscreen: v }),
  setFps: (fps) => set({ fps }),
  setInfoPanelOpen: (v) => set({ infoPanelOpen: v }),
  resetCamera: () => set(s => ({ _cameraResetSignal: s._cameraResetSignal + 1 })),
}))
