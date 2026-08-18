import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, FrontSide } from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vPosV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPosV = mv.xyz;
    vNormalV = normalMatrix * normal;
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormalV;
  varying vec3 vPosV;
  void main() {
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(-vPosV);
    // Fresnel: nur an der Silhouette (streifender Blickwinkel) hell,
    // zur Kamera hin nahezu transparent -> klarer Umriss ohne Gitter.
    float f = 1.0 - abs(dot(N, V));
    float rim = pow(f, 2.6);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.4);
    float a = rim * uOpacity * pulse;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a);
  }
`

/** Ein dünner Kreisring (great circle) als dezenter Grenz-Hinweis. */
function BoundaryRing({ radius, color, tilt = 0, opacity = 0.22 }) {
  const positions = useMemo(() => {
    const seg = 128
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
    <line rotation={[tilt, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </line>
  )
}

/**
 * Die "Lichtblase": zeigt als glühender Kugel-Umriss, wie weit das Licht
 * gereist ist. Statt eines dichten Drahtgitters nur eine Fresnel-Hülle
 * (Randglühen) plus zwei dezente Ringe – so bleiben die Sterne im Inneren
 * gut sichtbar.
 */
export default function LightBubble({ radius = 1, color = '#ffd76a', opacity = 0.9 }) {
  const matRef = useRef()
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
    }),
    // Farbe/Opacity nur beim Mount; Updates unten
    [],
  )

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
      matRef.current.uniforms.uColor.value.set(color)
      matRef.current.uniforms.uOpacity.value = opacity
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 64, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={FrontSide}
          blending={AdditiveBlending}
        />
      </mesh>
      <BoundaryRing radius={radius} color={color} tilt={0} opacity={0.22} />
      <BoundaryRing radius={radius} color={color} tilt={Math.PI / 2.4} opacity={0.12} />
    </group>
  )
}
