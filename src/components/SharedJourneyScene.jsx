import { useMemo, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import CameraRig from './CameraRig.jsx'
import { Beam, Bote, MeetingFlash, Waypoint, SceneLabel } from './JourneyBeam.jsx'
import { journeyLayout, pickWaypoints } from '../lib/journey.js'

const COLOR_A = '#8ab4ff' // Person A – Blau (aus dem Farbschema)
const COLOR_B = '#ffd76a' // Person B – Gold (beam)
const COLOR_MERGED_HEAD = '#fff4d6'

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

function Composition({ journey, onSelect }) {
  const { soloA, soloB, common, a, b, nameA, nameB } = journey
  const layout = useMemo(
    () => journeyLayout({ soloA, soloB, common }),
    [soloA, soloB, common],
  )
  const { M, A0, B0, T, boundR, size } = layout
  const width = Math.max(size * 0.008, 0.045)

  // Reale Sterne, an denen das Licht vorbeigezogen ist.
  const wpA = useMemo(() => pickWaypoints(0, soloA, 4), [soloA])
  const wpB = useMemo(() => pickWaypoints(0, soloB, 4), [soloB])
  const wpM = useMemo(
    () =>
      pickWaypoints(
        Math.max(soloA, soloB),
        Math.max(a.lightYears, b.lightYears),
        4,
      ),
    [soloA, soloB, a.lightYears, b.lightYears],
  )

  const labelA = nameA || 'Person A'
  const labelB = nameB || 'Person B'

  return (
    <group>
      {/* Strahlen */}
      {soloA > 0 && <Beam from={A0} to={M} color={COLOR_A} phaseKey="solo" width={width} />}
      {soloB > 0 && <Beam from={B0} to={M} color={COLOR_B} phaseKey="solo" width={width} />}
      <Beam from={M} to={T} color={COLOR_A} color2={COLOR_B} phaseKey="merged" width={width * 1.15} />

      {/* Wegmarken (passierte Sterne) */}
      {wpA.map((wp) => (
        <Waypoint key={`a-${wp.name}`} from={A0} to={M} wp={wp} phaseKey="solo" onSelect={onSelect} />
      ))}
      {wpB.map((wp) => (
        <Waypoint key={`b-${wp.name}`} from={B0} to={M} wp={wp} phaseKey="solo" onSelect={onSelect} />
      ))}
      {wpM.map((wp) => (
        <Waypoint key={`m-${wp.name}`} from={M} to={T} wp={wp} phaseKey="merged" onSelect={onSelect} />
      ))}

      {/* Lichtboten */}
      {soloA > 0 && <Bote from={A0} to={M} color={COLOR_A} phaseKey="solo" fadeWith="merged" size={size * 0.06} />}
      {soloB > 0 && <Bote from={B0} to={M} color={COLOR_B} phaseKey="solo" fadeWith="merged" size={size * 0.06} />}
      <Bote from={M} to={T} color={COLOR_MERGED_HEAD} phaseKey="merged" size={size * 0.075} />

      {/* Treffpunkt */}
      <MeetingFlash position={M} />

      {/* Beschriftungen */}
      <SceneLabel position={A0} text={labelA} sub={`geboren · ${a.distance.display} ${a.distance.short}`} tone="text-light-200" fit={boundR} />
      <SceneLabel position={B0} text={labelB} sub={`geboren · ${b.distance.display} ${b.distance.short}`} tone="text-beam" fit={boundR} />
      <SceneLabel position={[M[0], M[1] + size * 0.12, M[2]]} text="Kennenlernen" sub="hier trifft sich euer Licht" tone="text-light-200" fit={boundR} />
      <SceneLabel position={T} text="Heute" sub="gemeinsam unterwegs" tone="text-light-200" fit={boundR} />
    </group>
  )
}

export default function SharedJourneyScene({ journey, onSelect }) {
  const controls = useRef()
  const layout = useMemo(
    () => journeyLayout({ soloA: journey.soloA, soloB: journey.soloB, common: journey.common }),
    [journey.soloA, journey.soloB, journey.common],
  )
  const fit = layout.boundR * 2.0

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [fit * 0.32, fit * 0.5, fit * 1.1], fov: 55, near: 0.01, far: 100000 }}
        onPointerMissed={() => onSelect(null)}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#04040c']} />
        <ambientLight intensity={0.4} />
        <Suspense fallback={null}>
          <Stars radius={fit * 6} depth={fit * 2} count={1400} factor={fit * 0.02} fade speed={0.3} />
          <Composition journey={journey} onSelect={onSelect} />
          <CameraRig distance={fit} controlsRef={controls} />
        </Suspense>
        <OrbitControls
          ref={controls}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={fit * 0.2}
          maxDistance={fit * 6}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  )
}
