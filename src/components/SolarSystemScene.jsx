import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import { DoubleSide, SRGBColorSpace } from 'three'
import { planetPositions } from '../lib/astronomy.js'
import { lightTimeFromKm, nf } from '../lib/lightTravel.js'
import { AU_KM } from '../lib/constants.js'
import LightBubble from './LightBubble.jsx'
import ConnectionLine from './ConnectionLine.jsx'

const B = import.meta.env.BASE_URL
// Datei-Basisname je Planetenname.
const TEX_FILE = {
  Merkur: 'mercury', Venus: 'venus', Erde: 'earth', Mars: 'mars',
  Jupiter: 'jupiter', Saturn: 'saturn', Uranus: 'uranus', Neptun: 'neptune',
}
// Achsneigung (Grad) und Rotationsrichtung.
const TILT = {
  Merkur: 0.03, Venus: 177.4, Erde: 23.4, Mars: 25.2,
  Jupiter: 3.1, Saturn: 26.7, Uranus: 97.8, Neptun: 28.3,
}
// alle Planeten- + Sonnen-Texturen auf einmal laden (eine Suspense-Grenze)
function usePlanetTextures() {
  const urls = { sun: `${B}textures/planets/sun.jpg`, saturnring: `${B}textures/planets/saturnring.png` }
  for (const f of Object.values(TEX_FILE)) urls[f] = `${B}textures/planets/${f}.jpg`
  const tex = useTexture(urls)
  useMemo(() => {
    for (const k in tex) if (k !== 'saturnring') tex[k].colorSpace = SRGBColorSpace
  }, [tex])
  return tex
}

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

function Sun({ tex }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.03
  })
  return (
    <group>
      <pointLight intensity={2.4} distance={0} decay={0} color="#fff4d6" />
      <mesh ref={ref}>
        <sphereGeometry args={[0.6, 48, 48]} />
        <meshBasicMaterial map={tex} color="#fff0d0" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#ffcf6a" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

function Planet({ planet, inside, boundary, distEarthAu, selected, onSelect, tex, ringTex }) {
  const boundaryRing = useRef()
  const spin = useRef()
  const isEarth = planet.name === 'Erde'
  const isSaturn = planet.name === 'Saturn'
  const tiltRad = ((TILT[planet.name] || 0) * Math.PI) / 180

  useFrame((state, dt) => {
    if (boundaryRing.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.18
      boundaryRing.current.scale.setScalar(p)
    }
    if (spin.current) spin.current.rotation.y += dt * 0.12
  })
  const pos = planetScenePos(planet)
  const size = planet.size * 0.32
  const distEarthKm = distEarthAu * AU_KM

  const select = (e) => {
    e.stopPropagation()
    onSelect({
      kind: isEarth ? 'Heimatplanet' : 'Planet',
      name: planet.name,
      distanceKm: isEarth ? 0 : distEarthKm,
      distanceLabel: isEarth
        ? 'dein Standort'
        : `${nf(3).format(distEarthAu)} AE von der Erde`,
      lightTime: isEarth ? '—' : lightTimeFromKm(distEarthKm),
      inside,
      boundary,
      pos,
      meta: isEarth
        ? 'Unser Heimatplanet – Ursprung der Lichtblase'
        : boundary
          ? 'Nahe der Lichtfront'
          : undefined,
    })
  }

  return (
    <group position={pos}>
      {/* Achsneigung + Eigenrotation */}
      <group rotation={[0, 0, tiltRad]} scale={selected ? 1.4 : 1}>
        <mesh
          ref={spin}
          onClick={select}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          <sphereGeometry args={[size, 48, 48]} />
          <meshStandardMaterial map={tex} roughness={1} metalness={0} />
        </mesh>
        {isSaturn && ringTex && (
          <mesh rotation={[Math.PI / 2, 0, 0]} onClick={select}>
            <ringGeometry args={[size * 1.35, size * 2.3, 64]} />
            <meshBasicMaterial map={ringTex} side={DoubleSide} transparent depthWrite={false} />
          </mesh>
        )}
      </group>
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
  const tex = usePlanetTextures()
  const bubbleR = auMap(bubbleAu)
  const earth = planets.find((p) => p.name === 'Erde')
  const earthPos = earth ? planetScenePos(earth) : [0, 0, 0]

  // Distanz jedes Planeten von der ERDE (die Lichtblase geht von der Erde aus).
  const distFromEarth = (p) => {
    if (!earth) return p.distanceAu
    return Math.hypot(p.x - earth.x, p.y - earth.y, p.z - earth.z)
  }

  return (
    <group>
      <Sun tex={tex.sun} />
      {planets.map((p) => (
        <OrbitRing key={`ring-${p.name}`} radius={auMap(p.semiMajorAu)} />
      ))}
      {planets.map((p) => {
        const dE = distFromEarth(p)
        return (
          <Planet
            key={p.name}
            planet={p}
            tex={tex[TEX_FILE[p.name]]}
            ringTex={tex.saturnring}
            distEarthAu={dE}
            inside={bubbleAu >= dE}
            boundary={Math.abs(dE - bubbleAu) <= bubbleAu * 0.18}
            selected={selected?.name === p.name}
            onSelect={onSelect}
          />
        )
      })}
      {/* Lichtblase geht von der Erde aus */}
      <group position={earthPos}>
        <LightBubble radius={bubbleR} />
      </group>
      <ConnectionLine from={earthPos} to={selected?.pos} />
    </group>
  )
}

// Passender Kamera-Abstand für diese Szene.
export function solarFitDistance(bubbleAu) {
  const neptune = auMap(30.07)
  return Math.max(auMap(bubbleAu) * 2.1, neptune * 2.0)
}
