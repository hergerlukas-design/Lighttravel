import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { DoubleSide } from 'three'
import { planetPositions } from '../lib/astronomy.js'
import { lightTimeFromKm, nf } from '../lib/lightTravel.js'
import { AU_KM } from '../lib/constants.js'
import LightBubble from './LightBubble.jsx'
import ConnectionLine from './ConnectionLine.jsx'

// Logarithmische Radial-Abbildung: echte AU-Distanz → Szenen-Einheiten.
// Bewahrt die reale Winkelkonfiguration der Planeten zum Datum, komprimiert
// aber den Radius, damit innere Planeten UND eine riesige Lichtblase sichtbar
// bleiben. Streng monoton steigend.
const R0 = 0.18
const LOG_K = 3.1
export function auMap(au) {
  return LOG_K * Math.log10(1 + Math.max(0, au) / R0)
}

// Szenen-Position eines Planeten (Ekliptik-Ebene auf XZ, y = Höhe).
export function planetScenePos(p) {
  const r = auMap(p.distanceAu)
  const rr = p.distanceAu || 1
  return [(p.x / rr) * r, (p.z / rr) * r * 0.6, (p.y / rr) * r]
}

function OrbitRing({ radius }) {
  const geo = useMemo(() => {
    const pts = []
    const seg = 128
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius)
    }
    return new Float32Array(pts)
  }, [radius])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={geo.length / 3}
          array={geo}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#2b3a66" transparent opacity={0.7} />
    </line>
  )
}

function Sun() {
  return (
    <group>
      <pointLight intensity={2.4} distance={0} decay={0} color="#fff4d6" />
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#fff2c4" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#ffcf6a" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

function Planet({ planet, inside, boundary, selected, onSelect }) {
  const ref = useRef()
  const boundaryRing = useRef()
  const isEarth = planet.name === 'Erde'

  useFrame((state) => {
    if (boundaryRing.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.18
      boundaryRing.current.scale.setScalar(p)
    }
  })
  const pos = planetScenePos(planet)
  const size = planet.size * 0.32

  return (
    <group position={pos}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onSelect({
            kind: isEarth ? 'Heimatplanet' : 'Planet',
            name: planet.name,
            distanceKm: planet.distanceKm,
            distanceLabel: `${nf(3).format(planet.distanceAu)} AE`,
            lightTime: lightTimeFromKm(planet.distanceKm),
            inside,
            boundary,
            pos,
            meta: isEarth
              ? 'Unser Heimatplanet'
              : boundary
                ? 'Nahe der Lichtfront'
                : undefined,
          })
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
        scale={selected ? 1.4 : 1}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={inside ? 0.8 : 0.15}
          roughness={0.7}
        />
      </mesh>
      {inside && (
        <mesh>
          <ringGeometry args={[size * 1.5, size * 1.9, 32]} />
          <meshBasicMaterial color="#ffd76a" side={DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}
      {isEarth && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 2.2, size * 2.6, 40]} />
          <meshBasicMaterial color="#8ab4ff" side={DoubleSide} transparent opacity={0.85} />
        </mesh>
      )}
      {boundary && (
        <mesh ref={boundaryRing} raycast={() => null}>
          <ringGeometry args={[size * 3.0, size * 3.5, 44]} />
          <meshBasicMaterial color="#7fe9ff" side={DoubleSide} transparent opacity={0.9} />
        </mesh>
      )}
      <Html center distanceFactor={18} position={[0, size + 0.5, 0]} zIndexRange={[10, 0]}>
        <div
          className={`select-none whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium tracking-wide ${
            isEarth ? 'text-light-200' : inside ? 'text-beam' : 'text-light-300/80'
          }`}
        >
          {isEarth ? 'Erde · Heimat' : planet.name}
        </div>
      </Html>
    </group>
  )
}

export default function SolarSystemScene({ date, bubbleAu, onSelect, selected }) {
  const planets = useMemo(() => planetPositions(date), [date])
  const bubbleR = auMap(bubbleAu)
  const earth = planets.find((p) => p.name === 'Erde')
  const earthPos = earth ? planetScenePos(earth) : [0, 0, 0]

  return (
    <group>
      <Sun />
      {planets.map((p) => (
        <OrbitRing key={`ring-${p.name}`} radius={auMap(p.semiMajorAu)} />
      ))}
      {planets.map((p) => (
        <Planet
          key={p.name}
          planet={p}
          inside={bubbleAu >= p.distanceAu}
          boundary={Math.abs(p.distanceAu - bubbleAu) <= bubbleAu * 0.18}
          selected={selected?.name === p.name}
          onSelect={onSelect}
        />
      ))}
      <LightBubble radius={bubbleR} />
      <ConnectionLine from={earthPos} to={selected?.pos} />
    </group>
  )
}

// Passender Kamera-Abstand für diese Szene.
export function solarFitDistance(bubbleAu) {
  const neptune = auMap(30.07)
  return Math.max(auMap(bubbleAu) * 2.1, neptune * 2.0)
}
