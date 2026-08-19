import { useMemo, useState } from 'react'
import { Billboard, Html } from '@react-three/drei'
import { AdditiveBlending, DoubleSide } from 'three'
import CLUSTERS from '../data/clusters.json'
import { LIGHT_YEAR_KM } from '../lib/constants.js'
import { nf } from '../lib/lightTravel.js'

const COLOR = '#bfe0ff'

// deterministischer Zufall, damit die Punktwolke stabil bleibt.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Cluster({ c, iconSize, bubbleLy, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const inside = c.distLy <= bubbleLy

  // Mitglieds-Punkte einmalig um das Zentrum streuen (Szenen-Koordinaten pc).
  const positions = useMemo(() => {
    const rnd = mulberry32(c.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 7))
    const n = Math.min(c.members, 70)
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      // gleichmäßig in einer Kugel
      let x, y, z, d
      do {
        x = rnd() * 2 - 1
        y = rnd() * 2 - 1
        z = rnd() * 2 - 1
        d = x * x + y * y + z * z
      } while (d > 1)
      arr[i * 3] = c.x + x * c.radiusPc
      arr[i * 3 + 1] = c.z + z * c.radiusPc
      arr[i * 3 + 2] = c.y + y * c.radiusPc
    }
    return arr
  }, [c])

  const select = (e) => {
    e.stopPropagation()
    onSelect({
      kind: c.type,
      name: c.name,
      distanceKm: c.distLy * LIGHT_YEAR_KM,
      distanceLabel: `${nf(0).format(c.distLy)} Lj · ${nf(1).format(c.distPc)} pc`,
      lightTime: `${nf(0).format(c.distLy)} Jahre`,
      inside,
      pos: [c.x, c.z, c.y],
      meta: `${c.info} (${c.members}+ Sterne)`,
    })
  }

  return (
    <group>
      {/* Mitglieds-Sterne als Punktwolke */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={inside ? 2.6 : 1.8}
          sizeAttenuation={false}
          color={COLOR}
          transparent
          opacity={inside ? 0.95 : 0.6}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      {/* Klick-Icon + Label am Zentrum */}
      <group position={[c.x, c.z, c.y]}>
        <Billboard>
          <mesh
            onClick={select}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <circleGeometry args={[iconSize * 1.4, 20]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[iconSize * 1.0, iconSize * 1.25, 40]} />
            <meshBasicMaterial color={COLOR} transparent opacity={hovered ? 1 : 0.85} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
        </Billboard>
        <Html center distanceFactor={iconSize * 30} position={[0, iconSize * 1.6, 0]} zIndexRange={[16, 0]}>
          <div className="select-none whitespace-nowrap text-[10px] font-semibold" style={{ color: COLOR }}>
            {c.name}
          </div>
        </Html>
      </group>
    </group>
  )
}

export default function ClusterLayer({ bubbleLy, fit, filters, onSelect }) {
  const iconSize = fit * 0.02
  if (!filters?.showClusters) return null
  return (
    <group>
      {CLUSTERS.map((c) => (
        <Cluster key={c.id} c={c} iconSize={iconSize} bubbleLy={bubbleLy} onSelect={onSelect} />
      ))}
    </group>
  )
}
