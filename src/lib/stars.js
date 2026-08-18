import starsRaw from '../data/stars.json'
import { PARSEC_IN_LY, PARSEC_KM } from './constants.js'

/**
 * Farbe eines Sterns aus dem Farbindex B–V (ci). Näherung, die von
 * bläulich (heiß) über weiß bis rötlich (kühl) verläuft. Fällt auf die
 * Spektralklasse zurück, wenn kein Farbindex vorliegt.
 */
function colorFromBV(ci, spect) {
  let bv = ci
  if (bv == null || Number.isNaN(bv)) {
    const c = (spect || '').charAt(0).toUpperCase()
    bv = { O: -0.3, B: -0.2, A: 0.0, F: 0.4, G: 0.6, K: 1.0, M: 1.6 }[c]
    if (bv == null) bv = 0.6
  }
  bv = Math.max(-0.4, Math.min(2.0, bv))
  // grobe, aber ansprechende Zuordnung
  let r, g, b
  if (bv < 0.0) {
    r = 0.61 + 0.28 * (bv + 0.4) / 0.4
    g = 0.7 + 0.2 * (bv + 0.4) / 0.4
    b = 1.0
  } else if (bv < 0.6) {
    r = 0.9 + 0.1 * (bv / 0.6)
    g = 0.9
    b = 1.0 - 0.35 * (bv / 0.6)
  } else if (bv < 1.2) {
    r = 1.0
    g = 0.9 - 0.35 * ((bv - 0.6) / 0.6)
    b = 0.65 - 0.35 * ((bv - 0.6) / 0.6)
  } else {
    r = 1.0
    g = 0.55 - 0.25 * ((bv - 1.2) / 0.8)
    b = 0.3 - 0.15 * ((bv - 1.2) / 0.8)
  }
  return [Math.min(1, r), Math.min(1, g), Math.min(1, b)]
}

/** Anzeigename: Eigenname > Bayer/Flamsteed > HYG-ID. */
function displayName(s) {
  if (s.proper) return s.proper
  if (s.bf) return s.bf.trim()
  return `HYG ${s.id}`
}

// Vorverarbeiteter Sternkatalog. x/y/z liegen in Parsec vor (HYG-Konvention).
export const STARS = starsRaw.map((s) => {
  const [r, g, b] = colorFromBV(s.ci, s.spect)
  return {
    id: s.id,
    name: displayName(s),
    named: Boolean(s.proper),
    x: s.x,
    y: s.y,
    z: s.z,
    distPc: s.dist,
    distLy: s.dist * PARSEC_IN_LY,
    distKm: s.dist * PARSEC_KM,
    mag: s.mag,
    absmag: s.absmag,
    spect: s.spect,
    con: s.con,
    color: [r, g, b],
  }
})

// Nach scheinbarer Helligkeit: hellere Sterne (kleinere mag) zuerst.
export const STARS_BY_BRIGHTNESS = [...STARS].sort((a, b) => a.mag - b.mag)

/** Punktgröße aus scheinbarer Helligkeit (heller = größer). */
export function starSize(mag) {
  return Math.max(0.6, 2.6 - mag * 0.42)
}
