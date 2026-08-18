import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import CameraRig from './CameraRig.jsx'
import SolarSystemScene, { solarFitDistance } from './SolarSystemScene.jsx'
import StarFieldScene, { starsFitDistance } from './StarFieldScene.jsx'
import InfoPopup from './InfoPopup.jsx'

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

  // Lichtblasenradius in den jeweiligen Szenen-Einheiten.
  const bubbleAu = result.au
  const bubbleLy = result.lightYears
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

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0">
        <ScaleBadge result={result} />
        <Legend isSolar={isSolar} />
        <InfoPopup object={selected} onClose={() => setSelected(null)} />
        {!selected && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[11px] text-light-300/40">
            Ziehen zum Drehen · Scrollen zum Zoomen · Objekt anklicken für Details
          </div>
        )}
      </div>
    </div>
  )
}

function ScaleBadge({ result }) {
  return (
    <div className="absolute left-4 top-4 rounded-lg border border-light-400/15 bg-space-900/70 px-3 py-2 backdrop-blur-md">
      <div className="text-[10px] uppercase tracking-widest text-light-300/50">
        Ansicht
      </div>
      <div className="font-display text-sm font-semibold text-light-200">
        {result.scene === 'solar' ? 'Sonnensystem' : 'Sternenkarte'}
      </div>
      <div className="mt-1 text-[11px] text-light-300/60">
        Lichtblase: {result.distance.display}{' '}
        <span className="text-light-300/45">{result.distance.unit}</span>
      </div>
    </div>
  )
}

function Legend({ isSolar }) {
  return (
    <div className="absolute right-4 top-4 hidden rounded-lg border border-light-400/15 bg-space-900/70 px-3 py-2 backdrop-blur-md sm:block">
      <div className="flex items-center gap-2 text-[11px] text-light-300/70">
        <span className="inline-block h-3 w-3 rounded-full bg-beam/60 ring-1 ring-beam" />
        im Lichtkegel
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-light-300/70">
        <span className="inline-block h-3 w-3 rounded-full border border-light-400/40" />
        noch nicht erreicht
      </div>
      <div className="mt-1.5 text-[10px] text-light-300/40">
        {isSolar
          ? 'Radius logarithmisch skaliert'
          : 'Koordinaten in Parsec (HYG)'}
      </div>
    </div>
  )
}
