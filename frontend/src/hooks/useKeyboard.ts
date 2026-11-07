import { useEffect } from 'react'
import { useStore } from './useStore'

const PLANET_IDS = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon']

export function useKeyboard() {
  const store = useStore()

  useEffect(() => {
    let planetIndex = PLANET_IDS.indexOf(store.selectedBody || 'earth')

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          store.togglePause()
          break
        case 'KeyR':
          store.resetCamera()
          break
        case 'KeyO':
          store.toggleOrbits()
          break
        case 'KeyC':
          store.setCompareMode(!store.compareMode)
          store.setActiveTab(store.compareMode ? 'home' : 'compare')
          break
        case 'KeyF':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen()
          else document.exitFullscreen()
          break
        case 'Escape':
          if (store.compareMode) {
            store.setCompareMode(false)
            store.setActiveTab('home')
          } else {
            store.setInfoPanelOpen(false)
            store.setSelectedBody(null)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          store.increaseSpeed()
          break
        case 'ArrowDown':
          e.preventDefault()
          store.decreaseSpeed()
          break
        case 'Equal':
        case 'NumpadAdd':
          window.dispatchEvent(new CustomEvent('nova:zoom', { detail: 'in' }))
          break
        case 'Minus':
        case 'NumpadSubtract':
          window.dispatchEvent(new CustomEvent('nova:zoom', { detail: 'out' }))
          break
        case 'KeyL': {
          planetIndex = (planetIndex + 1) % PLANET_IDS.length
          const nextId = PLANET_IDS[planetIndex]
          store.setSelectedBody(nextId)
          store.setInfoPanelOpen(true)
          break
        }
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [store])
}
