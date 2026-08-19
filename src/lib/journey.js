import { computeLightTravel } from './lightTravel.js'
import { STARS } from './stars.js'
import { PARSEC_IN_LY } from './constants.js'

/**
 * "Gemeinsame Reise" – die geteilte Lichtreise zweier Menschen.
 *
 * Grundgedanke: Das Licht jeder Person reist seit ihrem Geburtsdatum. Am
 * Kennenlern-Datum treffen sich beide Lichtboten – ab da fliegen sie als ein
 * gemeinsamer Strahl weiter bis heute.
 *
 *   Gesamtstrecke A = Lichtdistanz seit Geburt A            (lyA)
 *   Gemeinsam       = Lichtdistanz seit dem Kennenlernen    (common = lyMeet)
 *   Solo-Strecke A  = lyA − common                          (soloA)
 *
 * Weil man sich immer nach der Geburt beider Personen kennenlernt, gilt
 * lyMeet ≤ lyA und lyMeet ≤ lyB, die Solo-Strecken sind also nie negativ.
 */

function toDate(str) {
  if (str instanceof Date) return str
  return new Date(`${str}T00:00:00`)
}

/**
 * Berechnet alle Größen der gemeinsamen Reise.
 * @param {{ birthA:string, birthB:string, meeting:string, nameA?:string, nameB?:string }} input
 * @param {Date} now Bezugszeitpunkt (Standard: jetzt)
 */
export function computeSharedJourney(input, now = new Date()) {
  const { birthA, birthB, meeting, nameA = '', nameB = '' } = input || {}
  const nowD = now instanceof Date ? now : new Date(now)

  const dA = toDate(birthA)
  const dB = toDate(birthB)
  const dM = toDate(meeting)

  const parseable = [dA, dB, dM].every(
    (d) => d instanceof Date && Number.isFinite(d.getTime()),
  )

  const a = computeLightTravel(dA, nowD)
  const b = computeLightTravel(dB, nowD)
  const m = computeLightTravel(dM, nowD)

  // Validierung mit sprechenden Meldungen.
  const errors = []
  if (!parseable) {
    errors.push('Bitte gültige Datumsangaben wählen.')
  } else {
    if (a.isFuture) errors.push('Das Geburtsdatum von Person A liegt in der Zukunft.')
    if (b.isFuture) errors.push('Das Geburtsdatum von Person B liegt in der Zukunft.')
    if (m.isFuture) errors.push('Das Kennenlern-Datum liegt in der Zukunft.')
    if (!a.isFuture && !m.isFuture && dM.getTime() < dA.getTime())
      errors.push('Ihr könnt euch erst nach der Geburt von Person A kennengelernt haben.')
    if (!b.isFuture && !m.isFuture && dM.getTime() < dB.getTime())
      errors.push('Ihr könnt euch erst nach der Geburt von Person B kennengelernt haben.')
  }

  const valid = errors.length === 0

  const soloA = Math.max(0, a.lightYears - m.lightYears)
  const soloB = Math.max(0, b.lightYears - m.lightYears)
  const common = m.lightYears

  return {
    valid,
    errors,
    now: nowD,
    nameA: nameA.trim(),
    nameB: nameB.trim(),
    a, // computeLightTravel-Ergebnis für Person A
    b,
    m, // seit dem Kennenlernen
    soloA, // Lichtjahre, die A allein unterwegs war
    soloB,
    common, // gemeinsame Lichtjahre seit dem Kennenlernen
  }
}

/**
 * Geometrie der Szene: zwei einlaufende Strahlen (A, B), die sich am
 * Treffpunkt M vereinen und als gemeinsamer Strahl nach vorn (T = „Heute“)
 * weiterlaufen. Bildet die λ-/Y-Form.
 *
 * Die Längen sind wurzel-skaliert, damit sehr unterschiedliche Zeiträume
 * (Tage bis Jahrzehnte) gemeinsam lesbar bleiben – rein illustrativ. Die
 * Reihenfolge und grobe Proportion bleibt erhalten.
 */
export function journeyLayout({ soloA, soloB, common }, size = 6.2) {
  const sq = (ly) => Math.sqrt(Math.max(0, ly))
  const maxRaw = Math.max(sq(soloA), sq(soloB), sq(common), 1e-6)
  const scale = size / maxRaw
  // Mindestlänge, damit jedes Segment sichtbar bleibt.
  const floor = size * 0.14
  const lenOf = (ly, hasValue) =>
    hasValue ? Math.max(sq(ly) * scale, floor) : 0

  const lenA = lenOf(soloA, soloA > 0)
  const lenB = lenOf(soloB, soloB > 0)
  // Der gemeinsame Stamm ist der emotionale Fokus – immer sichtbar.
  const lenC = Math.max(sq(common) * scale, size * 0.4)

  const spread = (34 * Math.PI) / 180 // Öffnungswinkel der beiden Strahlen
  const yOff = size * 0.16

  const M = [0, 0, 0]
  const A0 = [-Math.sin(spread) * lenA, yOff, -Math.cos(spread) * lenA]
  const B0 = [Math.sin(spread) * lenB, -yOff, -Math.cos(spread) * lenB]
  const T = [0, 0, lenC]

  const boundR = Math.max(lenA, lenB, lenC, size)
  return { M, A0, B0, T, lenA, lenB, lenC, size, boundR }
}

const CYCLE = 11 // Sekunden pro Animationszyklus

function smoother(t) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * x * (x * (x * 6 - 15) + 10)
}

/**
 * Zeitliche Phase der Animation, rein aus der verstrichenen Zeit berechnet –
 * so laufen alle Teilkomponenten (Strahlen, Lichtboten, Blitz) synchron.
 * Liefert Fortschrittswerte 0…1.
 */
export function journeyPhase(elapsed) {
  const u = ((elapsed % CYCLE) + CYCLE) % CYCLE / CYCLE

  // Zeitfenster im Zyklus.
  const soloStart = 0.06
  const soloEnd = 0.5
  const mergeStart = 0.58
  const mergeEnd = 0.92

  const solo = smoother((u - soloStart) / (soloEnd - soloStart))
  const merged = smoother((u - mergeStart) / (mergeEnd - mergeStart))

  // Kurzer Lichtblitz um den Treffpunkt.
  let flash = 0
  if (u > soloEnd - 0.04 && u < mergeStart + 0.1) {
    const c = (u - (soloEnd + 0.02)) / 0.09
    flash = Math.exp(-c * c * 2.2)
  }

  return { u, solo, merged, flash, met: u >= soloEnd }
}

/**
 * Wählt reale Sterne (aus dem HYG-Katalog), deren Lichtdistanz in ein
 * Segment fällt – als „passierte“ Wegmarken entlang eines Strahls.
 * @returns {{ name:string, distLy:number, distKm:number, color:number[], frac:number }[]}
 */
export function pickWaypoints(fromLy, toLy, max = 4) {
  if (!(toLy > fromLy)) return []
  const span = toLy - fromLy
  const inRange = STARS.filter((s) => s.distLy > fromLy && s.distLy <= toLy)
  // benannte Sterne bevorzugen, dann die hellsten
  inRange.sort((p, q) => {
    if (p.named !== q.named) return p.named ? -1 : 1
    return p.mag - q.mag
  })
  const chosen = []
  const used = []
  for (const s of inRange) {
    const frac = (s.distLy - fromLy) / span
    // Wegmarken entlang des Strahls verteilen (nicht zu dicht).
    if (used.some((f) => Math.abs(f - frac) < 0.12)) continue
    chosen.push({
      name: s.name,
      distLy: s.distLy,
      distKm: s.distKm,
      distPc: s.distPc,
      color: s.color,
      con: s.con,
      spect: s.spect,
      frac,
    })
    used.push(frac)
    if (chosen.length >= max) break
  }
  chosen.sort((p, q) => p.frac - q.frac)
  return chosen
}

// ── URL-Codierung für die Teilen-Funktion ──────────────────────────────────

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '')

/** Baut die Query-Parameter für einen Teilen-Link. */
export function encodeJourneyParams({ birthA, birthB, meeting, nameA, nameB }) {
  const p = new URLSearchParams()
  p.set('ansicht', 'gemeinsam')
  if (isDate(birthA)) p.set('a', birthA)
  if (isDate(birthB)) p.set('b', birthB)
  if (isDate(meeting)) p.set('t', meeting)
  if (nameA && nameA.trim()) p.set('na', nameA.trim().slice(0, 40))
  if (nameB && nameB.trim()) p.set('nb', nameB.trim().slice(0, 40))
  return p.toString()
}

/** Liest die gemeinsame Reise aus der aktuellen URL (falls vorhanden). */
export function readJourneyFromLocation(search = window.location.search) {
  const p = new URLSearchParams(search)
  const isShared = p.get('ansicht') === 'gemeinsam'
  const out = {
    isShared,
    birthA: isDate(p.get('a')) ? p.get('a') : '',
    birthB: isDate(p.get('b')) ? p.get('b') : '',
    meeting: isDate(p.get('t')) ? p.get('t') : '',
    nameA: (p.get('na') || '').slice(0, 40),
    nameB: (p.get('nb') || '').slice(0, 40),
  }
  return out
}

export { PARSEC_IN_LY }
