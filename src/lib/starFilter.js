import { STARS } from './stars.js'

// Grenzen für die Filter-Regler, abgeleitet aus dem Datensatz.
export const MAG_MIN = -1.5
export const MAG_MAX = 21 // heller Regler: alle einschließen
export const MAX_DIST_LY = Math.ceil(Math.max(...STARS.map((s) => s.distLy)))
export const NAKED_EYE_MAG = 6.5 // mit bloßem Auge sichtbar

export const DEFAULT_FILTERS = {
  onlyNamed: false,
  maxMag: MAG_MAX,
  status: 'all', // all | inside | boundary | outside
  con: 'all',
  distMin: 0,
  distMax: MAX_DIST_LY,
}

// Inhaltliche Filter (unabhängig von der Lichtblase).
export function matchesContent(s, f) {
  if (f.onlyNamed && !s.named) return false
  if (s.mag > f.maxMag) return false
  if (f.con !== 'all' && s.con !== f.con) return false
  if (s.distLy < f.distMin || s.distLy > f.distMax) return false
  return true
}

// Statusfilter relativ zur aktuellen Lichtblase (Radius in Parsec).
export function matchesStatus(s, f, bubblePc) {
  switch (f.status) {
    case 'inside':
      return s.distPc <= bubblePc
    case 'outside':
      return s.distPc > bubblePc
    case 'boundary':
      return s.distPc >= bubblePc * 0.9 && s.distPc <= bubblePc * 1.08
    default:
      return true
  }
}

export function matchesStar(s, f, bubblePc) {
  return matchesContent(s, f) && matchesStatus(s, f, bubblePc)
}

export function isDefaultFilters(f) {
  return (
    !f.onlyNamed &&
    f.maxMag >= MAG_MAX &&
    f.status === 'all' &&
    f.con === 'all' &&
    f.distMin <= 0 &&
    f.distMax >= MAX_DIST_LY
  )
}

export function activeFilterCount(f) {
  let n = 0
  if (f.onlyNamed) n++
  if (f.maxMag < MAG_MAX) n++
  if (f.status !== 'all') n++
  if (f.con !== 'all') n++
  if (f.distMin > 0 || f.distMax < MAX_DIST_LY) n++
  return n
}

// Im Datensatz vorhandene Sternbild-Kürzel (sortiert).
export const PRESENT_CONSTELLATIONS = [...new Set(STARS.map((s) => s.con).filter(Boolean))].sort()
