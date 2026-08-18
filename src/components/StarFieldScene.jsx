import { useEffect, useMemo, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import { STARS, starSize } from '../lib/stars.js'
import { PARSEC_IN_LY } from '../lib/constants.js'
import { lightTimeFromKm, nf } from '../lib/lightTravel.js'
import LightBubble from './LightBubble.jsx'
import HomeSystem from './HomeSystem.jsx'

const vertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float size;
  attribute float inside;
  varying vec3 vColor;
  varying float vInside;
  void main() {
    vColor = aColor;
    vInside = inside;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float boost = 1.0 + inside * 1.6;
    gl_PointSize = size * boost * (260.0 / max(-mv.z, 0.1));
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vInside;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vColor, mix(vColor, vec3(1.0, 0.86, 0.5), 0.6), vInside);
    float a = core * (0.55 + vInside * 0.45);
    if (a < 0.02) discard;
    gl_FragColor = vec4(col, a);
  }
`

function StarPoints({ bubblePc, onSelect }) {
  const geomRef = useRef()
  const { raycaster } = useThree()

  const { positions, colors, sizes } = useMemo(() => {
    const n = STARS.length
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const sizes = new Float32Array(n)
    STARS.forEach((s, i) => {
      positions[i * 3] = s.x
      positions[i * 3 + 1] = s.z // z (galaktisch) als Höhe
      positions[i * 3 + 2] = s.y
      colors[i * 3] = s.color[0]
      colors[i * 3 + 1] = s.color[1]
      colors[i * 3 + 2] = s.color[2]
      sizes[i] = starSize(s.mag)
    })
    return { positions, colors, sizes }
  }, [])

  const inside = useMemo(() => new Float32Array(STARS.length), [])

  // "inside"-Attribut aktualisieren, wenn sich der Blasenradius ändert.
  useEffect(() => {
    for (let i = 0; i < STARS.length; i++) {
      inside[i] = STARS[i].distPc <= bubblePc ? 1 : 0
    }
    if (geomRef.current) {
      const attr = geomRef.current.getAttribute('inside')
      if (attr) attr.needsUpdate = true
    }
  }, [bubblePc, inside])

  // Trefferradius fürs Anklicken proportional zur Kameradistanz halten.
  useFrame(({ camera }) => {
    raycaster.params.Points.threshold = Math.max(0.15, camera.position.length() * 0.012)
  })

  return (
    <points
      onClick={(e) => {
        e.stopPropagation()
        const i = e.index
        if (i == null) return
        const s = STARS[i]
        onSelect({
          kind: 'Stern',
          name: s.name,
          distanceKm: s.distKm,
          distanceLabel: `${nf(2).format(s.distLy)} Lj · ${nf(2).format(s.distPc)} pc`,
          lightTime: lightTimeFromKm(s.distKm),
          inside: s.distPc <= bubblePc,
          meta: s.spect ? `Spektraltyp ${s.spect}${s.con ? ' · ' + s.con : ''}` : s.con,
        })
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" count={STARS.length} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={STARS.length} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={STARS.length} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-inside" count={STARS.length} array={inside} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}

export default function StarFieldScene({ date, bubbleLy, fit, onSelect, selected }) {
  const bubblePc = bubbleLy / PARSEC_IN_LY
  return (
    <group>
      <HomeSystem date={date} fit={fit} onSelect={onSelect} selected={selected} />
      <StarPoints bubblePc={bubblePc} onSelect={onSelect} />
      <LightBubble radius={bubblePc} color="#8ab4ff" opacity={0.85} />
    </group>
  )
}

// Passender Kamera-Abstand: zeigt entweder die Blase oder die nächste
// Sternumgebung – je nachdem, was größer ist.
export function starsFitDistance(bubbleLy) {
  const bubblePc = bubbleLy / PARSEC_IN_LY
  const neighbor = STARS.length > 14 ? STARS[14].distPc : 6
  return Math.max(bubblePc * 1.7, neighbor * 1.5, 6)
}
