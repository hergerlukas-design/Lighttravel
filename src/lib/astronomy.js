import * as Astronomy from 'astronomy-engine'
import { AU_KM } from './constants.js'

// Anzeige-Metadaten der Planeten. semiMajorAu dient als Bahnradius für die
// Ringe und als Rückfallwert, falls die Positionsberechnung fehlschlägt.
export const PLANETS = [
  { name: 'Merkur', body: 'Mercury', semiMajorAu: 0.387, color: '#b8b0a4', size: 0.38 },
  { name: 'Venus', body: 'Venus', semiMajorAu: 0.723, color: '#e6c88a', size: 0.62 },
  { name: 'Erde', body: 'Earth', semiMajorAu: 1.0, color: '#5b8dd9', size: 0.66 },
  { name: 'Mars', body: 'Mars', semiMajorAu: 1.524, color: '#d1603a', size: 0.5 },
  { name: 'Jupiter', body: 'Jupiter', semiMajorAu: 5.203, color: '#d9b48a', size: 1.5 },
  { name: 'Saturn', body: 'Saturn', semiMajorAu: 9.537, color: '#e8d19a', size: 1.3 },
  { name: 'Uranus', body: 'Uranus', semiMajorAu: 19.191, color: '#9fd8e0', size: 1.0 },
  { name: 'Neptun', body: 'Neptune', semiMajorAu: 30.07, color: '#5a7de0', size: 1.0 },
]

/**
 * Heliozentrische Positionen aller Planeten zum gegebenen Datum,
 * in ekliptikalen Kartesischen Koordinaten (AU). Fällt bei Fehlern auf
 * eine kreisförmige Bahn zurück, damit die Szene nie leer bleibt.
 */
export function planetPositions(date) {
  const d = date instanceof Date ? date : new Date(date)
  return PLANETS.map((p, i) => {
    let x, y, z, r
    try {
      const eqj = Astronomy.HelioVector(Astronomy.Body[p.body], d)
      const ecl = Astronomy.Ecliptic(eqj) // -> { vec, elon, elat }
      x = ecl.vec.x
      y = ecl.vec.y
      z = ecl.vec.z
      r = Math.sqrt(x * x + y * y + z * z)
    } catch {
      // Rückfall: gleichmäßig verteilte Kreisbahn
      const theta = (i / PLANETS.length) * Math.PI * 2
      x = Math.cos(theta) * p.semiMajorAu
      y = Math.sin(theta) * p.semiMajorAu
      z = 0
      r = p.semiMajorAu
    }
    return {
      ...p,
      x,
      y,
      z,
      distanceAu: r,
      distanceKm: r * AU_KM,
    }
  })
}
