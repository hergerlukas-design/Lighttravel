import { useMemo } from 'react'
import { AdditiveBlending, Vector3 } from 'three'

// Galaktische Basis im äquatorialen J2000-System (Grad).
const POLE = { ra: 192.85948, dec: 27.12825 } // galaktischer Nordpol (b = 90°)
const CENTER = { ra: 266.405, dec: -28.93617 } // galaktisches Zentrum (l = 0)

function dirFromRaDec(raDeg, decDeg) {
  const ra = (raDeg * Math.PI) / 180
  const dec = (decDeg * Math.PI) / 180
  return new Vector3(Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec))
}

/**
 * Atmosphärisches Milchstraßenband: ein halbtransparenter Partikelgürtel
 * entlang der galaktischen Ebene, korrekt gegen das äquatoriale System
 * geneigt und zum galaktischen Zentrum hin heller. Nicht interaktiv, ohne
 * Einfluss auf die Berechnungslogik – reine Tiefenwirkung.
 */
function buildBand() {
  const zGal = dirFromRaDec(POLE.ra, POLE.dec)
  let xGal = dirFromRaDec(CENTER.ra, CENTER.dec)
  // orthonormalisieren
  xGal = xGal.sub(zGal.clone().multiplyScalar(xGal.dot(zGal))).normalize()
  const yGal = new Vector3().crossVectors(zGal, xGal)

  const N = 5200
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  const warm = [1.0, 0.94, 0.82]
  const pale = [0.8, 0.85, 1.0]
  const tmp = new Vector3()
  let k = 0
  let guard = 0
  while (k < N && guard < N * 40) {
    guard++
    const l = Math.random() * Math.PI * 2
    // dünnes Band: gaußartige Streuung um die Ebene
    const b = (Math.random() + Math.random() + Math.random() - 1.5) * 0.14
    // Helligkeits-/Dichtegewicht: hell zum Zentrum (l = 0), schwächer zum Antizentrum
    const w = 0.3 + 0.7 * (0.5 + 0.5 * Math.cos(l))
    if (Math.random() > w) continue
    const cb = Math.cos(b)
    tmp
      .copy(xGal).multiplyScalar(cb * Math.cos(l))
      .add(yGal.clone().multiplyScalar(cb * Math.sin(l)))
      .add(zGal.clone().multiplyScalar(Math.sin(b)))
    // Szenen-Mapping wie bei den Sternen: [x, z, y]
    pos[k * 3] = tmp.x
    pos[k * 3 + 1] = tmp.z
    pos[k * 3 + 2] = tmp.y
    const mix = Math.max(0, Math.min(1, (w - 0.3) / 0.7))
    col[k * 3] = pale[0] + (warm[0] - pale[0]) * mix
    col[k * 3 + 1] = pale[1] + (warm[1] - pale[1]) * mix
    col[k * 3 + 2] = pale[2] + (warm[2] - pale[2]) * mix
    k++
  }
  return { pos: pos.slice(0, k * 3), col: col.slice(0, k * 3), count: k }
}

export default function MilkyWayBand({ fit, filters }) {
  const { pos, col, count } = useMemo(() => buildBand(), [])
  if (!filters?.showMilkyWay) return null
  const bgRadius = fit * 7
  return (
    <points scale={bgRadius} raycast={() => null} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={col} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={2}
        sizeAttenuation={false}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
