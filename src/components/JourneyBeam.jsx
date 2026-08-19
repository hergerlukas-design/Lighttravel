import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  LineCurve3,
  Vector3,
} from 'three'
import { journeyPhase } from '../lib/journey.js'
import { lightTimeFromKm } from '../lib/lightTravel.js'

// Weiches, rundes Leuchttextur-Sprite (einmal erzeugt, wiederverwendet).
let GLOW_TEX = null
function glowTexture() {
  if (GLOW_TEX) return GLOW_TEX
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.22, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  GLOW_TEX = new CanvasTexture(c)
  return GLOW_TEX
}

const lerp3 = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uProgress;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float along = vUv.x;                 // 0 = Start, 1 = Ende
    float revealed = step(along, uProgress);
    float head = smoothstep(0.16, 0.0, uProgress - along) * revealed;
    float flow = 0.85 + 0.15 * sin(uTime * 3.0 - along * 12.0);
    float ghost = 0.07 * (1.0 - revealed); // schwacher Vorschau-Pfad
    // zwei Farben entlang der Strecke leicht changieren lassen
    vec3 base = mix(uColor, uColor2, 0.5 + 0.5 * sin(uTime * 0.8 + along * 5.0));
    vec3 col = mix(base, vec3(1.0), head * 0.85);
    float a = uOpacity * ((0.42 + 0.58 * head) * revealed * flow + ghost);
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
  }
`

/**
 * Ein gerichteter Lichtstrahl von `from` nach `to`, der sich synchron zur
 * Animationsphase „von selbst zeichnet“. `phaseKey` wählt, welcher
 * Fortschritt (solo/merged) den Strahl enthüllt.
 */
export function Beam({ from, to, color, color2, phaseKey = 'solo', width = 0.05 }) {
  const matRef = useRef()
  const curve = useMemo(
    () => new LineCurve3(new Vector3(...from), new Vector3(...to)),
    [from, to],
  )
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uColor2: { value: new Color(color2 || color) },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
    }),
    [],
  )

  useFrame((state) => {
    const ph = journeyPhase(state.clock.elapsedTime)
    if (matRef.current) {
      matRef.current.uniforms.uProgress.value = ph[phaseKey]
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
      matRef.current.uniforms.uColor.value.set(color)
      matRef.current.uniforms.uColor2.value.set(color2 || color)
    }
  })

  return (
    <group>
      {/* Kern */}
      <mesh>
        <tubeGeometry args={[curve, 48, width, 8, false]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {/* Halo */}
      <mesh>
        <tubeGeometry args={[curve, 48, width * 2.6, 8, false]} />
        <shaderMaterial
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

/**
 * Der „Lichtbote“ – ein wanderndes Leuchtpünktchen, das entlang des Strahls
 * von `from` nach `to` reist. `phaseKey` bestimmt seinen Fortschritt,
 * `fadeWith` blendet ihn optional aus (z. B. sobald der gemeinsame Strahl
 * startet).
 */
export function Bote({ from, to, color, phaseKey = 'solo', fadeWith = null, size = 0.42 }) {
  const ref = useRef()
  const matRef = useRef()

  useFrame((state) => {
    const ph = journeyPhase(state.clock.elapsedTime)
    const p = ph[phaseKey]
    if (ref.current) {
      const pos = lerp3(from, to, p)
      ref.current.position.set(pos[0], pos[1], pos[2])
      const pulse = 1 + 0.18 * Math.sin(state.clock.elapsedTime * 5)
      let vis = p > 0.001 ? 1 : 0
      if (fadeWith) vis *= 1 - ph[fadeWith]
      ref.current.scale.setScalar(size * pulse * (0.5 + 0.5 * vis))
      if (matRef.current) matRef.current.opacity = vis
    }
  })

  return (
    <sprite ref={ref}>
      <spriteMaterial
        ref={matRef}
        map={glowTexture()}
        color={color}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        opacity={0}
      />
    </sprite>
  )
}

/**
 * Der Treffpunkt: ein kurzer, heller Lichtblitz mit expandierendem Ring,
 * ausgelöst zum Kennenlern-Moment.
 */
export function MeetingFlash({ position, color = '#fff4d6' }) {
  const flashRef = useRef()
  const flashMat = useRef()
  const ringRef = useRef()
  const ringMat = useRef()

  useFrame((state) => {
    const ph = journeyPhase(state.clock.elapsedTime)
    const f = ph.flash
    if (flashRef.current) {
      flashRef.current.scale.setScalar(0.6 + f * 3.4)
      if (flashMat.current) flashMat.current.opacity = f
    }
    if (ringRef.current) {
      const r = 0.2 + f * 2.6
      ringRef.current.scale.setScalar(r)
      if (ringMat.current) ringMat.current.opacity = f * 0.6
    }
  })

  return (
    <group position={position}>
      <sprite ref={flashRef}>
        <spriteMaterial
          ref={flashMat}
          map={glowTexture()}
          color={color}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          opacity={0}
        />
      </sprite>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.82, 1, 48]} />
        <meshBasicMaterial
          ref={ringMat}
          color={color}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          opacity={0}
        />
      </mesh>
    </group>
  )
}

/**
 * Eine „passierte“ reale Sternmarke entlang eines Strahls. Leuchtet auf,
 * sobald der Lichtbote sie passiert hat, und lässt sich anklicken.
 */
export function Waypoint({ from, to, wp, phaseKey, onSelect }) {
  const ref = useRef()
  const matRef = useRef()
  const pos = useMemo(() => lerp3(from, to, wp.frac), [from, to, wp.frac])
  const [r, g, b] = wp.color
  const hex = `#${[r, g, b]
    .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0'))
    .join('')}`

  useFrame((state) => {
    const ph = journeyPhase(state.clock.elapsedTime)
    const passed = ph[phaseKey] >= wp.frac
    const target = passed ? 1 : 0.18
    if (matRef.current) {
      const twinkle = 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 3 + wp.frac * 20)
      matRef.current.opacity += (target * twinkle - matRef.current.opacity) * 0.08
    }
    if (ref.current) {
      const s = passed ? 0.28 : 0.16
      ref.current.scale.setScalar(s + (matRef.current ? matRef.current.opacity * 0.05 : 0))
    }
  })

  return (
    <group position={pos}>
      <sprite
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.({
            kind: 'Stern',
            name: wp.name,
            distanceKm: wp.distKm,
            distanceLabel: `${wp.distLy.toFixed(2)} Lj · ${wp.distPc.toFixed(2)} pc`,
            lightTime: lightTimeFromKm(wp.distKm),
            inside: true,
            meta: 'Ein Stern, an dem euer Licht vorbeigezogen ist',
          })
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <spriteMaterial
          ref={matRef}
          map={glowTexture()}
          color={hex}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          opacity={0.18}
        />
      </sprite>
    </group>
  )
}

/** Kleine Textmarke in der Szene (z. B. „Kennenlernen“, „Heute“). */
export function SceneLabel({ position, text, sub, tone = 'text-light-200', fit = 6 }) {
  return (
    <Html center distanceFactor={fit * 0.9} position={position} zIndexRange={[6, 0]}>
      <div className="pointer-events-none select-none whitespace-nowrap text-center">
        <div className={`font-display text-[12px] font-semibold ${tone}`}>{text}</div>
        {sub && <div className="text-[10px] text-light-300/60">{sub}</div>}
      </div>
    </Html>
  )
}
