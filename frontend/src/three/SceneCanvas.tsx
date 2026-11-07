import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../hooks/useStore'
import { SolarSystem } from './SolarSystem'
import type { PlanetSummary } from '../types'

interface SceneCanvasProps {
  planets: PlanetSummary[]
}

export function SceneCanvas({ planets }: SceneCanvasProps) {
  const controlsRef = useRef<any>(null)
  const { _cameraResetSignal } = useStore()

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }, [_cameraResetSignal])

  return (
    <Canvas
      camera={{ position: [0, 38, 62], fov: 50, near: 0.1, far: 2000 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#030608']} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.45}
        zoomSpeed={1.1}
        panSpeed={0.7}
        minDistance={4}
        maxDistance={220}
        maxPolarAngle={Math.PI * 0.78}
        minPolarAngle={Math.PI * 0.08}
        mouseButtons={{
          LEFT:   THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT:  THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />

      <SolarSystem planets={planets} />
    </Canvas>
  )
}
