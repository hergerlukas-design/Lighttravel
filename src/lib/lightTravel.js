import {
  KM_PER_LIGHT_SECOND,
  SEC_PER_MINUTE,
  SEC_PER_HOUR,
  SEC_PER_DAY,
  SEC_PER_YEAR,
  AU_KM,
  LIGHT_YEAR_KM,
  PARSEC_KM,
  SCENE_THRESHOLD_LY,
  VOYAGER1,
} from './constants.js'

/**
 * Ein zentraler Zusammenhang: In der Zeit t legt Licht die Strecke c·t zurück.
 * In Licht-Einheiten ausgedrückt ist die zurückgelegte Distanz numerisch gleich
 * der vergangenen Zeit – 1 Tag Zeit ⇒ 1 Lichttag Distanz. Deshalb ist die
 * Lichtdistanz in Lichtsekunden schlicht die Anzahl vergangener Sekunden.
 */

const nf = (max = 2) =>
  new Intl.NumberFormat('de-DE', { maximumFractionDigits: max })

/** Wählt eine gut lesbare Licht-Zeiteinheit für eine Sekundenzahl. */
export function formatLightDistance(lightSeconds) {
  const s = Math.max(0, lightSeconds)
  if (s < SEC_PER_MINUTE) {
    return { value: s, unit: 'Lichtsekunden', short: 'Ls', display: nf(1).format(s) }
  }
  if (s < SEC_PER_HOUR) {
    const v = s / SEC_PER_MINUTE
    return { value: v, unit: 'Lichtminuten', short: 'Lmin', display: nf(2).format(v) }
  }
  if (s < SEC_PER_DAY) {
    const v = s / SEC_PER_HOUR
    return { value: v, unit: 'Lichtstunden', short: 'Lh', display: nf(2).format(v) }
  }
  if (s < SEC_PER_YEAR) {
    const v = s / SEC_PER_DAY
    return { value: v, unit: 'Lichttage', short: 'Ld', display: nf(2).format(v) }
  }
  const v = s / SEC_PER_YEAR
  return {
    value: v,
    unit: 'Lichtjahre',
    short: 'Lj',
    display: nf(v < 100 ? 3 : 1).format(v),
  }
}

/** Menschliche Beschreibung der vergangenen Zeitspanne. */
export function formatElapsed(seconds) {
  const s = Math.max(0, seconds)
  const days = s / SEC_PER_DAY
  if (days < 1) {
    const h = s / SEC_PER_HOUR
    return `${nf(1).format(h)} Stunden`
  }
  if (days < 60) return `${nf(0).format(days)} Tage`
  const years = s / SEC_PER_YEAR
  if (years < 1) {
    const months = days / 30.4375
    return `${nf(1).format(months)} Monate`
  }
  if (years < 1000) return `${nf(1).format(years)} Jahre`
  return `${nf(0).format(years)} Jahre`
}

/** Geschätzte Voyager-1-Distanz von der Sonne (in km) zu einem Zeitpunkt. */
export function voyager1DistanceKm(atDate = new Date()) {
  const t = atDate instanceof Date ? atDate.getTime() : atDate
  const years = (t - VOYAGER1.epoch) / (SEC_PER_YEAR * 1000)
  const au = VOYAGER1.distanceAuAtEpoch + VOYAGER1.speedAuPerYear * years
  return Math.max(0, au) * AU_KM
}

/**
 * Kernberechnung. Nimmt ein Startdatum und (optional) ein Bezugsdatum "jetzt".
 * Liefert alle abgeleiteten Größen für Anzeige und Visualisierung.
 */
export function computeLightTravel(fromDate, now = new Date()) {
  const from = fromDate instanceof Date ? fromDate : new Date(fromDate)
  const to = now instanceof Date ? now : new Date(now)

  const elapsedMs = to.getTime() - from.getTime()
  const valid = Number.isFinite(elapsedMs)
  const isFuture = elapsedMs < 0
  const elapsedSeconds = Math.max(0, elapsedMs / 1000)

  // Lichtdistanz
  const lightSeconds = elapsedSeconds
  const km = lightSeconds * KM_PER_LIGHT_SECOND
  const au = km / AU_KM
  const lightYears = km / LIGHT_YEAR_KM
  const parsec = km / PARSEC_KM

  const distance = formatLightDistance(lightSeconds)
  const scene = lightYears < SCENE_THRESHOLD_LY ? 'solar' : 'stars'

  return {
    valid,
    isFuture,
    from,
    to,
    elapsedSeconds,
    elapsedText: formatElapsed(elapsedSeconds),
    lightSeconds,
    km,
    au,
    lightYears,
    parsec,
    distance, // { value, unit, short, display }
    scene, // 'solar' | 'stars'
  }
}

/** Lichtlaufzeit für eine gegebene Distanz (km) als lesbarer Text. */
export function lightTravelTimeText(km) {
  const seconds = km / KM_PER_LIGHT_SECOND
  return formatElapsed(seconds).replace('Tage', 'Lichttage') // kontextabhängig überschrieben
}

/** Distanz in km → grob lesbare Lichtlaufzeit ("3,2 Jahre", "8,3 Minuten"). */
export function lightTimeFromKm(km) {
  const s = km / KM_PER_LIGHT_SECOND
  if (s < SEC_PER_MINUTE) return `${nf(1).format(s)} Sekunden`
  if (s < SEC_PER_HOUR) return `${nf(1).format(s / SEC_PER_MINUTE)} Minuten`
  if (s < SEC_PER_DAY) return `${nf(1).format(s / SEC_PER_HOUR)} Stunden`
  if (s < SEC_PER_YEAR) return `${nf(1).format(s / SEC_PER_DAY)} Tage`
  return `${nf(2).format(s / SEC_PER_YEAR)} Jahre`
}

/**
 * Sehr große Kilometerwerte lesbar machen. 40174991951814 km sagt niemandem
 * etwas – "40,17 Billionen km" schon. Der exakte Wert bleibt über
 * `kmExact` verfügbar und wird in der Oberfläche als Tooltip gezeigt.
 */
const KM_SCALES = [
  { at: 1e18, word: 'Trillionen' },
  { at: 1e15, word: 'Billiarden' },
  { at: 1e12, word: 'Billionen' },
  { at: 1e9, word: 'Milliarden' },
  { at: 1e6, word: 'Millionen' },
]

export function kmCompact(km) {
  const v = Math.max(0, km)
  for (const s of KM_SCALES) {
    if (v >= s.at) return `${nf(2).format(v / s.at)} ${s.word} km`
  }
  return `${nf(0).format(Math.round(v))} km`
}

/** Vollständige Kilometerzahl mit Tausenderpunkten. */
export function kmExact(km) {
  return `${nf(0).format(Math.round(Math.max(0, km)))} km`
}

/**
 * Verhältnis "so weit wie". Kleine Werte dürfen nicht auf 0 gerundet werden –
 * bis zum Zentrum der Milchstraße liegen sechs Zehnerpotenzen dazwischen.
 */
export function formatRatio(x) {
  if (!Number.isFinite(x) || x <= 0) return '0×'
  if (x >= 100) return `${nf(0).format(x)}×`
  if (x >= 1) return `${nf(1).format(x)}×`
  if (x >= 0.01) return `${nf(2).format(x)}×`
  const digits = new Intl.NumberFormat('de-DE', {
    maximumSignificantDigits: 2,
  }).format(x)
  return `${digits}×`
}

export { nf }
