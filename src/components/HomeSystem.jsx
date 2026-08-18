import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { DoubleSide } from 'three'
import { PLANETS, planetPositions } from '../lib/astronomy.js'
import { lightTimeFromKm, nf } from '../lib/lightTravel.js'

/**
 * Kompaktes, stilisiertes "Heimat"-Sonnensystem im Zentrum der Sternenkarte.
 * Auf Sternkarten-Maßstab (Parsec) wäre das echte Sonnensystem ein Punkt –
 * darum hier bewusst NICHT maßstabsgetreu, sondern als kleines Wahrzeichen
 * ("du bist hier"): Sonne + Planeten mit echten Winkelpositionen zum Datum,
 * aber komprimierten Bahnradien. Die Erde ist als Heimatplanet hervorgehoben.
 */
function OrbitRing({ radius, highlight }) {
  const positions = useMemo(() => {
    const seg = 96
    const arr = new Float32Array((seg + 1) * 3)
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      arr[i * 3] = Math.cos(a) * radius
      arr[i * 3 + 1] = 0
      arr[i * 3 + 2] = Math.sin(a) * radius
    }
    return arr
  }, [radius])
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={highlight ? '#8ab4ff' : '#3a4a7a'}
        transparent
        opacity={highlight ? 0.55 : 0.3}
        depthWrite={false}
      />
    </line>
  )
}

export default function HomeSystem({ date, fit, onSelect, selected }) {
  const emblemR = fit * 0.09
  const planets = useMemo(() => planetPositions(date), [date])
  const n = planets.length

  return (
    <group>
      {/* Sonne */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect({
            kind: 'Stern',
            name: 'Sonne',
            distanceKm: 0,
            distanceLabel: '0 (Heimatstern)',
            lightTime: 'im Zentrum',
            inside: true,
            pos: [0, 0, 0],
            meta: 'Unser Heimatstern – Ausgangspunkt der Lichtreise',
          })
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <sphereGeometry args={[emblemR * 0.06, 24, 24]} />
        <meshBasicMaterial color="#fff2c4" />
      </mesh>
      <Html center distanceFactor={fit * 0.55} position={[0, emblemR * 0.14, 0]}>
        <div className="select-none whitespace-nowrap text-[11px] font-semibold text-beam">
          Sonne
        </div>
      </Html>

      {planets.map((p, i) => {
        const t = n > 1 ? i / (n - 1) : 0
        const ringR = emblemR * (0.32 + 0.68 * t)
        const rr = p.distanceAu || 1
        const ux = p.x / rr
        const uy = p.y / rr
        const angleX = ux * ringR
        const angleZ = uy * ringR
        const isEarth = p.name === 'Erde'
        const size = emblemR * (0.03 + p.size * 0.008) * (isEarth ? 1.25 : 1)
        const isSel = selected?.name === p.name

        return (
          <group key={p.name}>
            <OrbitRing radius={ringR} highlight={isEarth} />
            <group position={[angleX, 0, angleZ]}>
              <mesh
                scale={isSel ? 1.5 : 1}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect({
                    kind: isEarth ? 'Heimatplanet' : 'Planet',
                    name: isEarth ? 'Erde' : p.name,
                    distanceKm: p.distanceKm,
                    distanceLabel: `${nf(3).format(p.distanceAu)} AE von der Sonne`,
                    lightTime: lightTimeFromKm(p.distanceKm),
                    inside: true,
                    pos: [angleX, 0, angleZ],
                    meta: isEarth
                      ? 'Unser Heimatplanet – von hier aus blickst du ins All'
                      : `Position zum ${date.toLocaleDateString('de-DE')}`,
                  })
                }}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => (document.body.style.cursor = 'auto')}
              >
                <sphereGeometry args={[size, 20, 20]} />
                <meshStandardMaterial
                  color={p.color}
                  emissive={p.color}
                  emissiveIntensity={isEarth ? 0.9 : 0.5}
                  roughness={0.6}
                />
              </mesh>
              {isEarth && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[size * 1.6, size * 2.0, 40]} />
                  <meshBasicMaterial color="#8ab4ff" side={DoubleSide} transparent opacity={0.8} />
                </mesh>
              )}
              <Html
                center
                distanceFactor={fit * 0.55}
                position={[0, size + emblemR * 0.05, 0]}
                zIndexRange={[8, 0]}
              >
                <div
                  className={`select-none whitespace-nowrap text-[10px] font-medium ${
                    isEarth ? 'text-light-200' : 'text-light-300/70'
                  }`}
                >
                  {isEarth ? 'Erde · Heimat' : p.name}
                </div>
              </Html>
            </group>
          </group>
        )
      })}
    </group>
  )
}

/**
 * Szenen-Position des Erd-Markers im Heimat-System – identische Formel wie
 * oben, damit die Verbindungslinie exakt an der Erde beginnt.
 */
export function homeEarthPosition(date, fit) {
  const emblemR = fit * 0.09
  const planets = planetPositions(date)
  const n = planets.length
  const i = planets.findIndex((p) => p.name === 'Erde')
  if (i < 0) return [0, 0, 0]
  const p = planets[i]
  const t = n > 1 ? i / (n - 1) : 0
  const ringR = emblemR * (0.32 + 0.68 * t)
  const rr = p.distanceAu || 1
  return [(p.x / rr) * ringR, 0, (p.y / rr) * ringR]
}
