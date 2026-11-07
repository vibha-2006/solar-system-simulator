import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../hooks/useStore'
import type { PlanetSummary } from '../types'
import {
  PLANET_SHADER_MAP,
  makeCloudMaterial,
  makeRingMaterial,
  makeCoronaMaterial,
  makeAtmMaterial,
} from './PlanetShaders'

interface SolarSystemProps {
  planets: PlanetSummary[]
}

interface PlanetState {
  angle: number
  moonAngle: number
}

// Atmosphere config per planet [r, g, b, intensity]
const ATM_CONFIG: Record<string, [number,number,number, number]> = {
  earth:   [0.18, 0.46, 1.00, 0.70],
  venus:   [0.90, 0.60, 0.15, 0.65],
  uranus:  [0.18, 0.80, 0.90, 0.50],
  neptune: [0.08, 0.35, 1.00, 0.55],
  mars:    [0.55, 0.18, 0.08, 0.30],
  saturn:  [0.75, 0.68, 0.45, 0.25],
  jupiter: [0.65, 0.48, 0.28, 0.20],
}

// Label colors
const LABEL_COLOR: Record<string, string> = {
  sun:     '#fdb813',
  earth:   '#60a5fa',
  mars:    '#f87171',
  jupiter: '#e09828',
  saturn:  '#e4d191',
  default: '#8ab0cc',
}

export function SolarSystem({ planets }: SolarSystemProps) {
  const { paused, speed, showOrbits, selectedBody, setSelectedBody,
          setInfoPanelOpen, setFps, _cameraResetSignal } = useStore()
  const { camera } = useThree()

  const stateRef = useRef<Record<string, PlanetState>>({})
  const fpsRef   = useRef({ count: 0, timer: 0 })
  const focusRef = useRef<{ active: boolean; target: THREE.Vector3; camPos: THREE.Vector3 }>({
    active: false, target: new THREE.Vector3(), camPos: new THREE.Vector3(),
  })

  // Initialise orbit angles
  useEffect(() => {
    const rng = (seed: number) => {
      let s = seed * 1234567
      return (Math.abs(Math.sin(s)) * 43758.5453) % 1
    }
    planets.forEach((p, i) => {
      if (!stateRef.current[p.id]) {
        stateRef.current[p.id] = {
          angle:     rng(i + 1) * Math.PI * 2,
          moonAngle: rng(i + 11) * Math.PI * 2,
        }
      }
    })
  }, [planets])

  // Camera reset
  useEffect(() => {
    focusRef.current.active = false
  }, [_cameraResetSignal])

  // Focus camera on selected planet
  const triggerFocus = useCallback((planetId: string) => {
    const p = planets.find(x => x.id === planetId)
    if (!p) return
    const s = stateRef.current[p.id]
    if (!s) return

    let pos: THREE.Vector3
    if (p.id === 'sun') {
      pos = new THREE.Vector3(0, 0, 0)
    } else if (p.id === 'moon') {
      const earth = planets.find(x => x.id === 'earth')
      const es = stateRef.current['earth']
      if (!earth || !es) return
      const ex = Math.cos(es.angle) * earth.orbital_radius_visual
      const ez = Math.sin(es.angle) * earth.orbital_radius_visual
      pos = new THREE.Vector3(
        ex + Math.cos(s.moonAngle) * p.orbital_radius_visual,
        0,
        ez + Math.sin(s.moonAngle) * p.orbital_radius_visual,
      )
    } else {
      pos = new THREE.Vector3(
        Math.cos(s.angle) * p.orbital_radius_visual,
        0,
        Math.sin(s.angle) * p.orbital_radius_visual,
      )
    }

    const dist = p.size_visual * 7 + 6
    const camPos = pos.clone().add(new THREE.Vector3(dist * 0.4, dist * 0.5, dist))
    focusRef.current = { active: true, target: pos.clone(), camPos }
  }, [planets])

  useEffect(() => {
    if (selectedBody) triggerFocus(selectedBody)
  }, [selectedBody, triggerFocus])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    // Animate planet angles
    if (!paused) {
      const factor = speed * dt * 0.01
      planets.forEach(p => {
        const s = stateRef.current[p.id]
        if (!s) return
        if (p.orbital_period_days > 0) {
          s.angle += (factor / p.orbital_period_days) * Math.PI * 2
        }
        if (p.id === 'moon') {
          s.moonAngle += (factor / 27.32) * Math.PI * 2
        }
      })
    }

    // Camera focus lerp
    if (focusRef.current.active) {
      camera.position.lerp(focusRef.current.camPos, 0.025)
    }

    // FPS
    fpsRef.current.count++
    fpsRef.current.timer += dt
    if (fpsRef.current.timer >= 1) {
      setFps(Math.round(fpsRef.current.count / fpsRef.current.timer))
      fpsRef.current.count = 0
      fpsRef.current.timer = 0
    }
  })

  // Zoom listener
  useEffect(() => {
    const onZoom = (e: CustomEvent) => {
      const f = e.detail === 'in' ? 0.80 : 1.25
      camera.position.multiplyScalar(f)
    }
    window.addEventListener('nova:zoom', onZoom as EventListener)
    return () => window.removeEventListener('nova:zoom', onZoom as EventListener)
  }, [camera])

  const mainPlanets = planets.filter(p => p.id !== 'moon' && p.id !== 'sun')
  const moon   = planets.find(p => p.id === 'moon')
  const earth  = planets.find(p => p.id === 'earth')
  const sunP   = planets.find(p => p.id === 'sun')

  const handleClick = (id: string) => {
    setSelectedBody(id)
    setInfoPanelOpen(true)
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.04} color="#0a1530" />
      <pointLight position={[0, 0, 0]} intensity={4}   color="#fff4e0" distance={300} decay={1.2} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#fdb813" distance={150} decay={2}   />

      {/* Stars */}
      <Stars radius={350} depth={100} count={8000} factor={3.5} saturation={0.25} fade speed={0.3} />

      {/* Sun */}
      {sunP && (
        <SunMesh
          planet={sunP}
          isSelected={selectedBody === 'sun'}
          onClick={() => handleClick('sun')}
        />
      )}

      {/* Planets */}
      {mainPlanets.map(p => (
        <PlanetMesh
          key={p.id}
          planet={p}
          stateRef={stateRef}
          showOrbits={showOrbits}
          isSelected={selectedBody === p.id}
          onClick={() => handleClick(p.id)}
        />
      ))}

      {/* Moon */}
      {moon && earth && (
        <MoonMesh
          moon={moon}
          earth={earth}
          stateRef={stateRef}
          isSelected={selectedBody === 'moon'}
          onClick={() => handleClick('moon')}
        />
      )}
    </>
  )
}

// ─── SUN ─────────────────────────────────────────────────────────────────────
function SunMesh({ planet, isSelected, onClick }: {
  planet: PlanetSummary; isSelected: boolean; onClick: () => void
}) {
  const coreMat  = useMemo(() => PLANET_SHADER_MAP['sun'](), [])
  const coronaMat = useMemo(() => makeCoronaMaterial(), [])
  const meshRef  = useRef<THREE.Mesh>(null)
  const r = planet.size_visual

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    coreMat.uniforms.u_time.value   = t
    coronaMat.uniforms.u_time.value = t
    if (meshRef.current) meshRef.current.rotation.y = t * 0.04
  })

  return (
    <group>
      {/* Corona (outer glow) */}
      <mesh>
        <sphereGeometry args={[r * 1.65, 32, 32]} />
        <primitive object={coronaMat} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[r * 1.25, 32, 32]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      {/* Sun sphere */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[r, 64, 64]} />
        <primitive object={coreMat} />
      </mesh>
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r * 1.18, r * 1.26, 80]} />
          <meshBasicMaterial color="#00d9aa" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Text
        position={[0, r + 0.8, 0]}
        fontSize={0.65}
        color={isSelected ? '#00d9aa' : '#fdb813'}
        anchorX="center"
        anchorY="bottom"
        renderOrder={2}
      >
        Sun
      </Text>
    </group>
  )
}

// ─── PLANET ───────────────────────────────────────────────────────────────────
function PlanetMesh({ planet, stateRef, showOrbits, isSelected, onClick }: {
  planet: PlanetSummary
  stateRef: React.MutableRefObject<Record<string, PlanetState>>
  showOrbits: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const bodyMat  = useMemo(() => PLANET_SHADER_MAP[planet.id]?.() ?? PLANET_SHADER_MAP['moon'](), [planet.id])
  const cloudMat = useMemo(() => planet.id === 'earth' ? makeCloudMaterial() : null, [planet.id])
  const ringMat  = useMemo(() => planet.has_rings ? makeRingMaterial() : null, [planet.has_rings])
  const atmMat   = useMemo(() => {
    const cfg = ATM_CONFIG[planet.id]
    return cfg ? makeAtmMaterial([cfg[0], cfg[1], cfg[2]], cfg[3]) : null
  }, [planet.id])

  const groupRef  = useRef<THREE.Group>(null)
  const meshRef   = useRef<THREE.Mesh>(null)
  const cloudRef  = useRef<THREE.Mesh>(null)
  const r = planet.size_visual
  const orbitR = planet.orbital_radius_visual

  // Orbit line
  const orbitLine = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * orbitR, 0, Math.sin(a) * orbitR))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return geo
  }, [orbitR])

  useFrame(({ clock }) => {
    const t  = clock.getElapsedTime()
    const st = stateRef.current[planet.id]
    if (!st || !groupRef.current) return

    groupRef.current.position.set(
      Math.cos(st.angle) * orbitR,
      0,
      Math.sin(st.angle) * orbitR,
    )
    if (meshRef.current)  meshRef.current.rotation.y  = t * 0.3
    if (cloudRef.current) cloudRef.current.rotation.y = t * 0.35

    if ('u_time' in bodyMat.uniforms) bodyMat.uniforms.u_time.value = t
    if (cloudMat && 'u_time' in cloudMat.uniforms) cloudMat.uniforms.u_time.value = t
  })

  const lc = LABEL_COLOR[planet.id] ?? LABEL_COLOR['default']

  return (
    <>
      {/* Orbit path */}
      {showOrbits && (
        <line>
          <primitive object={orbitLine} />
          <lineBasicMaterial
            color={isSelected ? '#00d9aa' : '#1a3550'}
            transparent
            opacity={isSelected ? 0.5 : 0.25}
          />
        </line>
      )}

      <group ref={groupRef}>
        {/* Atmosphere glow */}
        {atmMat && (
          <mesh>
            <sphereGeometry args={[r * 1.18, 32, 32]} />
            <primitive object={atmMat} />
          </mesh>
        )}

        {/* Planet body */}
        <mesh ref={meshRef} onClick={onClick}>
          <sphereGeometry args={[r, 64, 64]} />
          <primitive object={bodyMat} />
        </mesh>

        {/* Earth cloud layer */}
        {cloudMat && (
          <mesh ref={cloudRef}>
            <sphereGeometry args={[r * 1.025, 48, 48]} />
            <primitive object={cloudMat} />
          </mesh>
        )}

        {/* Saturn rings */}
        {ringMat && (
          <mesh rotation={[-0.45, 0, 0]}>
            <ringGeometry args={[r * 1.35, r * 2.55, 128, 1]} />
            <primitive object={ringMat} />
          </mesh>
        )}

        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r * 1.28, r * 1.38, 80]} />
            <meshBasicMaterial color="#00d9aa" transparent opacity={0.75} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Label */}
        <Text
          position={[0, r * 1.5 + 0.5, 0]}
          fontSize={Math.max(0.32, r * 0.32)}
          color={isSelected ? '#00d9aa' : lc}
          anchorX="center"
          anchorY="bottom"
          renderOrder={2}
        >
          {planet.name}
        </Text>
      </group>
    </>
  )
}

// ─── MOON ─────────────────────────────────────────────────────────────────────
function MoonMesh({ moon, earth, stateRef, isSelected, onClick }: {
  moon: PlanetSummary
  earth: PlanetSummary
  stateRef: React.MutableRefObject<Record<string, PlanetState>>
  isSelected: boolean
  onClick: () => void
}) {
  const mat = useMemo(() => PLANET_SHADER_MAP['moon'](), [])
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t  = clock.getElapsedTime()
    const es = stateRef.current['earth']
    const ms = stateRef.current['moon']
    if (!es || !ms || !ref.current) return

    const ex = Math.cos(es.angle) * earth.orbital_radius_visual
    const ez = Math.sin(es.angle) * earth.orbital_radius_visual
    ref.current.position.set(
      ex + Math.cos(ms.moonAngle) * moon.orbital_radius_visual,
      0,
      ez + Math.sin(ms.moonAngle) * moon.orbital_radius_visual,
    )
    if ('u_time' in mat.uniforms) mat.uniforms.u_time.value = t
  })

  const r = moon.size_visual
  return (
    <group ref={ref}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[r, 32, 32]} />
        <primitive object={mat} />
      </mesh>
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r * 1.3, r * 1.45, 48]} />
          <meshBasicMaterial color="#00d9aa" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Text
        position={[0, r * 1.6 + 0.3, 0]}
        fontSize={0.28}
        color={isSelected ? '#00d9aa' : '#607888'}
        anchorX="center"
        anchorY="bottom"
        renderOrder={2}
      >
        Moon
      </Text>
    </group>
  )
}
