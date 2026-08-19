# Lichtreise

Eine interaktive Website, die berechnet, **wie weit das Licht seit einem
eingegebenen Datum gereist ist**, und die Strecke in einer 3D-Szene
visualisiert.

Der zentrale Gedanke: In der Zeit *t* legt Licht die Strecke *c · t* zurück.
In Licht-Einheiten ausgedrückt ist die Distanz numerisch gleich der vergangenen
Zeit – aus einem Tag wird ein Lichttag, aus einem Jahr ein Lichtjahr.

## Funktionen

- **Datum-Eingabe → Live-Ergebnis**: vergangene Zeit, Lichtdistanz (skaliert in
  Lichtsekunden / -minuten / -stunden / -tagen / -jahren) und Kilometer.
- **3D-Visualisierung** (React Three Fiber):
  - **Sonnensystem-Ansicht** bei kurzen Zeiträumen – Planetenpositionen zum
    gewählten Datum, berechnet mit [`astronomy-engine`](https://github.com/cosinekitty/astronomy).
    Der Radius ist logarithmisch skaliert, damit innere Planeten und eine große
    Lichtblase gemeinsam sichtbar bleiben.
  - **Sternenkarten-Ansicht** bei langen Zeiträumen – echte Sternpositionen
    (x/y/z in Parsec) aus der [HYG-Datenbank](https://github.com/astronexus/HYG-Database),
    gefiltert auf die nächsten ≈ 3.600 Sterne.
  - Animierter Kamera-Übergang zwischen beiden Skalen.
  - Die **Lichtblase** mit dem berechneten Radius; erreichte Objekte werden
    hervorgehoben.
  - **Klick auf ein Objekt** öffnet ein Info-Popup mit Name, echter Distanz und
    Lichtlaufzeit.
- **Kontext-Bereich** mit Vergleichswerten (Voyager 1, Proxima Centauri, Sirius,
  Zentrum der Milchstraße …).

## Gemeinsame Reise

Ein eigener Abschnitt (Umschalter „Gemeinsame Reise“ in der Kopfzeile)
visualisiert die geteilte Lichtreise zweier Menschen:

- **Drei Datumsfelder** – Geburtsdatum Person A, Geburtsdatum Person B und das
  Kennenlern-Datum (dazu optionale Namen). Die Lichtdistanz seit jedem Datum
  wird live berechnet (gleiche Logik wie im Hauptfeature).
- **Reisestrahl-Konzept** statt Blasen-Modell: Zwei farblich unterschiedene
  „Lichtboten“ starten an den Geburtsdaten und fliegen durchs Sternenfeld. Am
  Kennenlern-Datum treffen sich beide Bahnen in einem Lichtblitz und
  verschmelzen zu einem gemeinsamen Strahl, der bis heute weiterläuft.
- **Wegmarken** entlang der Strahlen zeigen reale Sterne (HYG), an denen das
  Licht vorbeigezogen ist, und leuchten auf, sobald der Lichtbote sie passiert.
- **Teilen-Funktion**: Ein Link kodiert alle drei Daten (und Namen) als
  URL-Parameter (`?ansicht=gemeinsam&a=…&b=…&t=…`) – die Szene öffnet damit
  direkt mit beiden Personen.

Die Strahllängen sind wurzel-skaliert (rein illustrativ), damit Zeiträume von
Tagen bis Jahrzehnten gemeinsam lesbar bleiben.

## Seitenstruktur

1. **Kopfzeile** – Wortmarke und Umschalter zwischen Einzel- und gemeinsamer Reise.
2. **Hero** – Datum-Eingabe und Live-Ergebnisanzeige (Einzelreise).
3. **Visualisierung** – vollflächige 3D-Szene mit Skalen-Anzeige und Info-Popups.
4. **Kontext** – Vergleichswerte relativ zur zurückgelegten Lichtdistanz.
5. **Gemeinsame Reise** – geteilte Lichtreise zweier Menschen (eigener Abschnitt).
6. **Footer** – Datenquellen-Hinweise.

## Technik

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [drei](https://github.com/pmndrs/drei)
- [astronomy-engine](https://github.com/cosinekitty/astronomy) für Planetenpositionen

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Datenquellen

- **Sternpositionen**: HYG-Datenbank (astronexus), CC-lizenziert.
- **Planetenpositionen**: astronomy-engine.
- **Lichtgeschwindigkeit**: 299.792,458 km/s (exakt, SI).
- **Voyager-1-Distanz**: genähert aus einem linearen Modell (≈ 166 AE Anfang
  2025, 3,57 AE/Jahr).

Alle Distanzen sind Näherungen zu Anschauungszwecken.
