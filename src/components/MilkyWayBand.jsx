import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { BackSide, RepeatWrapping, SRGBColorSpace } from 'three'

// Ausrichtungs-Konstanten (analytisch hergeleitet und gegen bekannte
// Landmarken – galaktisches Zentrum, Carina, Cygnus, Sirius – justiert).
// Die Textur läuft in Rektaszension rechts->links (Himmelskonvention):
// gesampeltes U = repeat·(0.5 - RA/360) + offset, Ziel U = 0.488 - RA/360.
const MIRROR = 1
const OFFSET_X = -0.012

/**
 * Milchstraßen-/Sternenhimmel-Hintergrund aus einer echten, äquirektangulären
 * Sternkarte (NASA/Goddard SVS „Deep Star Map 2020“, Gaia DR2, gemeinfrei),
 * die im äquatorialen J2000-System vorliegt. Als halbtransparente, von innen
 * sichtbare Himmelskugel – rein atmosphärisch, nicht interaktiv, ohne Einfluss
 * auf die Berechnungslogik.
 */
export default function MilkyWayBand({ fit, filters }) {
  const tex = useTexture(`${import.meta.env.BASE_URL}textures/starmap.jpg`)
  useMemo(() => {
    tex.colorSpace = SRGBColorSpace
    tex.wrapS = RepeatWrapping
    tex.repeat.x = MIRROR
    tex.offset.x = OFFSET_X
    tex.needsUpdate = true
  }, [tex])

  if (!filters?.showMilkyWay) return null
  const bgRadius = fit * 9

  return (
    <mesh scale={bgRadius} raycast={() => null} renderOrder={-10}>
      <sphereGeometry args={[1, 64, 40]} />
      <meshBasicMaterial
        map={tex}
        side={BackSide}
        transparent
        opacity={0.6}
        depthWrite={false}
        color="#8f9bc4"
      />
    </mesh>
  )
}
