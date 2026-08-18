import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'

/**
 * Animiert den Kamera-Abstand weich auf einen Zielwert (fit), während die
 * vom Nutzer per OrbitControls gewählte Blickrichtung erhalten bleibt.
 * Sorgt für den fließenden Übergang zwischen den Skalen (Sonnensystem ↔
 * Sternenkarte) und beim Ändern der Lichtblasen-Größe.
 */
export default function CameraRig({ distance, controlsRef }) {
  const { camera } = useThree()
  const target = useRef(distance)
  const animating = useRef(true)
  const dir = useRef(new Vector3(0.6, 0.4, 1).normalize())

  useEffect(() => {
    target.current = distance
    animating.current = true
  }, [distance])

  useFrame(() => {
    if (!animating.current) return
    const cur = camera.position.length() || 0.001
    // aktuelle Richtung beibehalten (vom Nutzer gedreht)
    dir.current.copy(camera.position).normalize()
    if (!isFinite(dir.current.x)) dir.current.set(0.6, 0.4, 1).normalize()

    const next = MathUtils.lerp(cur, target.current, 0.06)
    camera.position.copy(dir.current.multiplyScalar(next))
    camera.updateProjectionMatrix()
    if (controlsRef?.current) controlsRef.current.update()

    if (Math.abs(next - target.current) < target.current * 0.008) {
      animating.current = false
    }
  })

  return null
}
