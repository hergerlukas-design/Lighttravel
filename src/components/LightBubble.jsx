import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, AdditiveBlending } from 'three'

/**
 * Die "Lichtblase": eine durchscheinende Kugel mit dem übergebenen Radius
 * (in Szenen-Einheiten), die zeigt, wie weit das Licht gereist ist.
 * Besteht aus einem weichen Innenglühen, einer Fresnel-artigen Hülle und
 * einem hellen Randring.
 */
export default function LightBubble({ radius = 1, color = '#ffd76a' }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (ringRef.current) {
      // sanftes Pulsieren des Randes
      const t = state.clock.elapsedTime
      ringRef.current.material.opacity = 0.5 + Math.sin(t * 1.5) * 0.18
    }
  })

  return (
    <group>
      {/* Weiches Innenvolumen */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {/* Hülle von innen sichtbar → Randglühen */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          side={BackSide}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {/* Drahtgitter-Rand als Orientierung */}
      <mesh ref={ringRef}>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
