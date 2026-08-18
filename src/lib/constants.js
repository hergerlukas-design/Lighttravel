// Physikalische Konstanten – SI-nah, in praktischen Einheiten.

// Lichtgeschwindigkeit im Vakuum
export const C_KM_S = 299792.458 // km pro Sekunde

// Ein Lichtsekunde in Kilometern
export const KM_PER_LIGHT_SECOND = C_KM_S

// Zeitspannen in Sekunden
export const SEC_PER_MINUTE = 60
export const SEC_PER_HOUR = 3600
export const SEC_PER_DAY = 86400
export const SEC_PER_YEAR = 365.25 * SEC_PER_DAY // julianisches Jahr

// Längen in Kilometern
export const AU_KM = 149597870.7 // Astronomische Einheit
export const LIGHT_YEAR_KM = C_KM_S * SEC_PER_YEAR // ≈ 9.4607e12 km
export const PARSEC_KM = 3.0856775814913673e13

// Umrechnungen
export const PARSEC_IN_LY = PARSEC_KM / LIGHT_YEAR_KM // ≈ 3.2616
export const AU_IN_LIGHT_SECONDS = AU_KM / KM_PER_LIGHT_SECOND // ≈ 499.0 s
export const LY_IN_AU = LIGHT_YEAR_KM / AU_KM // ≈ 63241 AU

// Schwelle für den Szenenwechsel (Sonnensystem <-> Sternenkarte),
// ausgedrückt als zurückgelegte Lichtdistanz in Lichtjahren.
// Darunter: Sonnensystem-Ansicht. Darüber: Sternenkarten-Ansicht.
export const SCENE_THRESHOLD_LY = 0.5 // ≈ 6 Monate Lichtlaufzeit

// Referenzdaten für Kontext-Vergleiche.
// Voyager 1: lineares Modell, verankert an einem bekannten Punkt.
export const VOYAGER1 = {
  name: 'Voyager 1',
  epoch: Date.UTC(2025, 0, 1), // 2025-01-01
  distanceAuAtEpoch: 166.0, // AU von der Sonne (≈ NASA-Wert Anfang 2025)
  speedAuPerYear: 3.57, // ≈ 17,0 km/s
}
