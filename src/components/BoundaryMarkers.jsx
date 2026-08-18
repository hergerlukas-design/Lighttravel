import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Html } from '@react-three/drei'
import { AdditiveBlending, DoubleSide } from 'three'
import { STARS } from '../lib/stars.js'
import { PARSEC_IN_LY } from '../lib/constants.js'
import { lightTimeFromKm, nf } from '../lib/lightTravel.js'
import { matchesContent } from '../lib/starFilter.js'

const CYAN = '#7fe9ff'
const GOLD = '#ffd76a'

/**
 * Ermittelt die Sterne nahe der Blasengrenze (Lichtfront) sowie den
 * nächsten Stern, den das Licht als Nächstes erreichen wird.
 */
function useBoundaryStars(bubblePc, filters) {
  return useMemo(() => {
    const lo = bubblePc * 0.9
    const hi = bubblePc * 1.08
    // Inhaltliche Filter respektieren (Name, Helligkeit, Sternbild, Distanz),
    // aber unabhängig vom Status – die Grenz-Marker SIND ihr eigener Status.
    let band = STARS.filter(
      (s) => s.distPc >= lo && s.distPc <= hi && matchesContent(s, filters),
    )
    band.sort((a, b) => Math.abs(a.distPc - bubblePc) - Math.abs(b.distPc - bubblePc))
    band = band.slice(0, 48)

    // STARS ist nach Distanz aufsteigend sortiert -> erster passender
    // außerhalb der Blase = "als Nächstes".
    let nextOutside = null
    for (const s of STARS) {
      if (s.distPc > bubblePc && matchesContent(s, filters)) {
        nextOutside = s
        break
      }
    }
    const ids = new Set(band.map((s) => s.id))
    if (nextOutside && !ids.has(nextOutside.id)) band.push(nextOutside)
    return { band, nextOutsideId: nextOutside?.id }
  }, [bubblePc, filters])
}

function Marker({ star, size, bubblePc, frontier, onSelect }) {
  const ring = useRef()
  const [hovered, setHovered] = useState(false)
  const inside = star.distPc <= bubblePc
  const color = frontier ? GOLD : CYAN
  const showLabel = frontier || star.named || hovered

  useFrame((state) => {
    if (ring.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 2.2 + star.id) * 0.12
      ring.current.scale.setScalar(p)
    }
  })

  const select = (e) => {
    e.stopPropagation()
    onSelect({
      kind: 'Stern',
      name: star.name,
      distanceKm: star.distKm,
      distanceLabel: `${nf(2).format(star.distLy)} Lj · ${nf(2).format(star.distPc)} pc`,
      lightTime: lightTimeFromKm(star.distKm),
      inside,
      boundary: true,
      frontier,
      meta: frontier
        ? 'Diesen Stern erreicht dein Licht als Nächstes'
        : star.spect
          ? `Spektraltyp ${star.spect}${star.con ? ' · ' + star.con : ''}`
          : star.con,
    })
  }

  return (
    <group position={[star.x, star.z, star.y]}>
      <Billboard>
        {/* großzügige, unsichtbare Klick-/Tippfläche */}
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
          <circleGeometry args={[size * 1.6, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* pulsierender Ring */}
        <mesh ref={ring} raycast={() => null}>
          <ringGeometry args={[size * 0.85, size, 40]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? 1 : 0.85}
            side={DoubleSide}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
        {/* Kern in Sternfarbe */}
        <mesh raycast={() => null}>
          <circleGeometry args={[size * 0.32, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      </Billboard>
      {showLabel && (
        <Html center distanceFactor={size * 34} position={[0, size * 1.7, 0]} zIndexRange={[20, 0]}>
          <div
            className={`select-none whitespace-nowrap rounded px-1 text-[10px] font-medium ${
              frontier ? 'text-beam' : 'text-[#bff1ff]'
            }`}
          >
            {frontier ? '➜ ' : ''}
            {star.name}
            <span className="ml-1 text-light-300/50">{nf(1).format(star.distLy)} Lj</span>
          </div>
        </Html>
      )}
    </group>
  )
}

export default function BoundaryMarkers({ bubbleLy, fit, filters, onSelect }) {
  const bubblePc = bubbleLy / PARSEC_IN_LY
  const { band, nextOutsideId } = useBoundaryStars(bubblePc, filters)
  const size = fit * 0.018

  return (
    <group>
      {band.map((s) => (
        <Marker
          key={s.id}
          star={s}
          size={size}
          bubblePc={bubblePc}
          frontier={s.id === nextOutsideId}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
