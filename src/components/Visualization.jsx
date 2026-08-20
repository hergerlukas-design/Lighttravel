import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import CameraRig from './CameraRig.jsx'
import SolarSystemScene, { solarFitDistance } from './SolarSystemScene.jsx'
import StarFieldScene, { starsFitDistance } from './StarFieldScene.jsx'
import InfoPopup from './InfoPopup.jsx'
import FilterPanel from './FilterPanel.jsx'
import { DEFAULT_FILTERS } from '../lib/starFilter.js'
import { PARSEC_IN_LY } from '../lib/constants.js'

function Loader() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-light-300/70">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-light-400/30 border-t-light-400" />
        <span className="text-sm">Szene wird geladen …</span>
      </div>
    </div>
  )
}

export default function Visualization({ result, selected, setSelected }) {
  const controls = useRef()
  const isSolar = result.scene === 'solar'
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Auswahl verwerfen, wenn die Szene wechselt: die gespeicherte Position
  // gilt nur im jeweiligen Koordinatensystem (AE ↔ Parsec).
  useEffect(() => {
    setSelected(null)
  }, [result.scene, setSelected])

  // Lichtblasenradius in den jeweiligen Szenen-Einheiten.
  const bubbleAu = result.au
  const bubbleLy = result.lightYears
  const bubblePc = bubbleLy / PARSEC_IN_LY
  const fit = isSolar ? solarFitDistance(bubbleAu) : starsFitDistance(bubbleLy)

  return (
    <div className="relative h-full w-full">
      <Canvas
        key={result.scene} /* Szenenwechsel = frischer Canvas + Kamera-Neustart */
        camera={{ position: [fit * 0.6, fit * 0.4, fit], fov: 55, near: 0.01, far: 100000 }}
        onPointerMissed={() => setSelected(null)}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#04040c']} />
        <ambientLight intensity={0.35} />
        <Suspense fallback={null}>
          <Stars radius={fit * 6} depth={fit * 2} count={1500} factor={fit * 0.02} fade speed={0.4} />
          {isSolar ? (
            <SolarSystemScene
              date={result.from}
              bubbleAu={bubbleAu}
              onSelect={setSelected}
              selected={selected}
            />
          ) : (
            <StarFieldScene
              date={result.from}
              bubbleLy={bubbleLy}
              fit={fit}
              filters={filters}
              onSelect={setSelected}
              selected={selected}
            />
          )}
          <CameraRig distance={fit} controlsRef={controls} />
        </Suspense>
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={fit * 0.15}
          maxDistance={fit * 8}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
        />
      </Canvas>

      {/* Vignette: hält die Overlays vom Szeneninhalt lesbar getrennt. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(2,2,8,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Linke Spalte: Maßstab und Filter stapeln sich, ohne feste Offsets. */}
        <div className="absolute inset-y-3 left-3 flex w-[min(17rem,calc(100%-1.5rem))] flex-col gap-2 sm:inset-y-4 sm:left-4">
          <ScaleBadge result={result} />
          {!isSolar && (
            <FilterPanel filters={filters} setFilters={setFilters} bubblePc={bubblePc} />
          )}
        </div>

        <Legend isSolar={isSolar} />
        <InfoPopup object={selected} onClose={() => setSelected(null)} />

        {!selected && (
          <div className="absolute inset-x-3 bottom-3 flex justify-center sm:bottom-4">
            <p className="rounded-full border border-light-400/10 bg-space-975/70 px-3 py-1.5 text-center text-[11px] text-light-300/60 backdrop-blur-sm">
              <span className="sm:hidden">Ziehen · Zoomen · Antippen</span>
              <span className="hidden sm:inline">
                Ziehen zum Drehen · Scrollen zum Zoomen · Objekt anklicken
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ScaleBadge({ result }) {
  return (
    <div className="hud shrink-0">
      <div className="label text-[10px] text-light-300/50">Ansicht</div>
      <div className="font-display text-sm font-semibold text-light-100">
        {result.scene === 'solar' ? 'Sonnensystem' : 'Sternenkarte'}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5 border-t border-white/[0.07] pt-1.5">
        <span className="text-[11px] text-light-300/55">Lichtblase</span>
        <span className="text-[13px] font-semibold tabular-nums text-beam">
          {result.distance.display}
        </span>
        <span className="text-[11px] text-light-300/55">{result.distance.unit}</span>
      </div>
    </div>
  )
}

const LEGEND_ITEMS = [
  { cls: 'bg-beam/60 ring-1 ring-beam', label: 'im Lichtkegel' },
  { cls: 'border border-light-400/40', label: 'noch nicht erreicht' },
  { cls: 'border-2 border-front', label: 'an der Lichtfront' },
]

function Legend({ isSolar }) {
  const items = isSolar
    ? LEGEND_ITEMS
    : [...LEGEND_ITEMS, { cls: 'border-2 border-beam', label: 'nächstes Ziel des Lichts' }]

  return (
    <div className="hud absolute right-3 top-3 hidden sm:right-4 sm:top-4 sm:block">
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2 text-[11px] text-light-300/75">
            <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${i.cls}`} />
            {i.label}
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-white/[0.07] pt-1.5 text-[10px] text-light-300/45">
        {isSolar ? 'Radius logarithmisch skaliert' : 'Koordinaten in Parsec (HYG)'}
      </div>
    </div>
  )
}
