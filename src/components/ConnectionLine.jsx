import { Line } from '@react-three/drei'

/**
 * Rote Verbindungslinie von der Erde zum aktuell gewählten Objekt.
 * Zwei Linien übereinander: eine breite, transparente als Glühen und eine
 * schmale, kräftige darüber. Wird nichts (oder ein zu nahes Objekt)
 * ausgewählt, rendert die Komponente nichts.
 */
export default function ConnectionLine({ from, to }) {
  if (!from || !to) return null
  const dx = from[0] - to[0]
  const dy = from[1] - to[1]
  const dz = from[2] - to[2]
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (!isFinite(len) || len < 1e-6) return null

  const points = [from, to]
  return (
    <group renderOrder={5}>
      <Line
        points={points}
        color="#ff5a5a"
        lineWidth={6}
        transparent
        opacity={0.22}
        depthWrite={false}
      />
      <Line
        points={points}
        color="#ff3b3b"
        lineWidth={2}
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </group>
  )
}
