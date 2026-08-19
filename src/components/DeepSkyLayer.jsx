import { useMemo, useState } from 'react'
import { Billboard, Html } from '@react-three/drei'
import { AdditiveBlending, DoubleSide } from 'three'
import DEEPSKY from '../data/deepsky.json'
import { LIGHT_YEAR_KM } from '../lib/constants.js'
import { nf } from '../lib/lightTravel.js'

const CAT_COLOR = {
  galaxy: '#c9b3ff',
  nebula: '#ff7ab8',
  globular: '#ffd27a',
  open: '#9ad0ff',
  other: '#d0d0d0',
}

function distLabel(distLy) {
  if (distLy >= 1e6) return `${nf(2).format(distLy / 1e6)} Mio. Lj`
  return `${nf(0).format(distLy)} Lj`
}
// Lichtlaufzeit in Jahren = Distanz in Lichtjahren.
function lightTimeLabel(distLy) {
  if (distLy >= 1e6) return `${nf(2).format(distLy / 1e6)} Mio. Jahre`
  return `${nf(0).format(distLy)} Jahre`
}

function Icon({ category, color, size, inside }) {
  const op = inside ? 1 : 0.75
  // Grundformen je Objekttyp.
  if (category === 'galaxy') {
    return (
      <group scale={[1.7, 0.7, 1]}>
        <mesh>
          <ringGeometry args={[size * 0.5, size, 40]} />
          <meshBasicMaterial color={color} transparent opacity={op} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
        <mesh>
          <circleGeometry args={[size * 0.45, 20]} />
          <meshBasicMaterial color={color} transparent opacity={op * 0.7} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
      </group>
    )
  }
  if (category === 'globular') {
    return (
      <group>
        <mesh>
          <circleGeometry args={[size, 24]} />
          <meshBasicMaterial color={color} transparent opacity={op * 0.35} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
        <mesh>
          <circleGeometry args={[size * 0.55, 20]} />
          <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
      </group>
    )
  }
  if (category === 'open') {
    // Ring + ein paar Punkte = lockerer Haufen.
    const dots = [0, 1, 2, 3, 4]
    return (
      <group>
        <mesh>
          <ringGeometry args={[size * 0.85, size, 32]} />
          <meshBasicMaterial color={color} transparent opacity={op * 0.7} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
        {dots.map((d) => {
          const a = (d / dots.length) * Math.PI * 2
          const r = size * 0.5
          return (
            <mesh key={d} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <circleGeometry args={[size * 0.14, 8]} />
              <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} blending={AdditiveBlending} />
            </mesh>
          )
        })}
      </group>
    )
  }
  // nebula / other: weicher Fleck mit dünnem Rand
  return (
    <group>
      <mesh>
        <circleGeometry args={[size * 1.1, 24]} />
        <meshBasicMaterial color={color} transparent opacity={op * 0.28} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh>
        <ringGeometry args={[size * 0.7, size * 0.85, 28]} />
        <meshBasicMaterial color={color} transparent opacity={op * 0.6} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  )
}

function DeepSkyObject({ obj, size, bubbleLy, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const color = CAT_COLOR[obj.category] || CAT_COLOR.other
  const inside = obj.distLy <= bubbleLy
  const showLabel = inside || obj.mag <= 6 || hovered

  const select = (e) => {
    e.stopPropagation()
    onSelect({
      kind: obj.typeName,
      name: obj.label,
      distanceKm: obj.distLy * LIGHT_YEAR_KM,
      distanceLabel: distLabel(obj.distLy),
      lightTime: lightTimeLabel(obj.distLy),
      inside,
      pos: [obj.x, obj.z, obj.y],
      meta: obj.blurb || `${obj.typeName}${obj.mag != null ? ` · ${nf(1).format(obj.mag)} mag` : ''}`,
    })
  }

  return (
    <group position={[obj.x, obj.z, obj.y]}>
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
          <circleGeometry args={[size * 1.5, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Icon category={obj.category} color={color} size={size} inside={inside} />
      </Billboard>
      {showLabel && (
        <Html center distanceFactor={size * 30} position={[0, size * 1.7, 0]} zIndexRange={[15, 0]}>
          <div
            className="select-none whitespace-nowrap text-[10px] font-medium"
            style={{ color: inside ? color : 'rgba(200,205,230,0.6)' }}
          >
            {obj.label}
          </div>
        </Html>
      )}
    </group>
  )
}

export default function DeepSkyLayer({ bubbleLy, fit, filters, onSelect }) {
  const fitCap = fit * 2.5
  const size = fit * 0.02
  const visible = useMemo(() => DEEPSKY.filter((o) => o.distPc <= fitCap), [fitCap])
  if (!filters?.showDeepSky) return null
  return (
    <group>
      {visible.map((o) => (
        <DeepSkyObject key={o.id} obj={o} size={size} bubbleLy={bubbleLy} onSelect={onSelect} />
      ))}
    </group>
  )
}
