# UI/UX-Beschreibung – Lichtreise

Eine strukturierte Beschreibung der Benutzeroberfläche (UI) und des
Nutzungserlebnisses (UX) der Website **Lichtreise**. Sie berechnet, wie weit
das Licht seit einem eingegebenen Datum gereist ist, und visualisiert die
Strecke in einer interaktiven 3D-Szene.

---

## 1. Konzept & Nutzungsziel

Die zentrale Idee ist so einfach wie überraschend: In der Zeit *t* legt Licht
die Strecke *c · t* zurück – in Licht-Einheiten ist die Distanz numerisch gleich
der vergangenen Zeit (aus 1 Tag wird 1 Lichttag, aus 1 Jahr 1 Lichtjahr).

Die Nutzer:innen wählen ein Datum aus der Vergangenheit, und die Anwendung
beantwortet die Leitfrage:

> **„Wie weit ist das Licht seit deinem Datum gereist?"**

Das Ziel ist kein Werkzeug für Fachleute, sondern ein **emotionales
Anschauungserlebnis** – ein Gefühl für die Dimensionen des Kosmos. Alle Werte
sind bewusst als Näherungen zu Anschauungszwecken deklariert.

**Primärer Nutzungsablauf (Happy Path):**

1. Datum wählen (Eingabefeld oder Schnellauswahl-Chip).
2. Live-Ergebnis ablesen (Lichtdistanz, Zeitspanne, Kilometer).
3. Die berechnete Lichtblase in der 3D-Szene erkunden (Drehen, Zoomen).
4. Objekte anklicken für Detailinformationen.
5. Im Kontext-Bereich die Distanz mit bekannten Wegmarken vergleichen.

---

## 2. Seitenaufbau (Informationsarchitektur)

Die Website ist eine **Single-Page-Anwendung** mit vier vertikal gestapelten
Bereichen – ohne Navigation, ohne Menü. Der Nutzungsfluss ergibt sich rein aus
dem Scrollen von oben nach unten.

| # | Bereich          | Aufgabe                                                        |
|---|------------------|----------------------------------------------------------------|
| 1 | **Hero**         | Datumseingabe + Live-Ergebnisanzeige                           |
| 2 | **Visualisierung** | Vollflächige 3D-Szene mit Overlays und Info-Popups           |
| 3 | **Kontext**      | Vergleich der Lichtdistanz mit bekannten kosmischen Wegmarken  |
| 4 | **Footer**       | Datenquellen, technischer Hinweis, Haftungshinweis             |

Der Anwendungszustand ist bewusst minimal: **das gewählte Datum** und **das
aktuell selektierte Objekt**. Alle angezeigten Werte werden daraus abgeleitet
und aktualisieren sich sofort bei jeder Datumsänderung.

---

## 3. Bereich für Bereich

### 3.1 Hero – Eingabe & Ergebnis

Der Einstieg gliedert sich in eine zentrierte Kopfzeile und darunter zwei
gleichwertige Karten (auf großen Screens nebeneinander, auf kleinen gestapelt).

**Kopfzeile**
- Ein dezenter Status-Chip mit pulsierendem Punkt: „Eine Reise mit
  Lichtgeschwindigkeit" – signalisiert Lebendigkeit, ohne abzulenken.
- Große, ausbalancierte Überschrift (`text-balance`) mit der Leitfrage.
- Erklärender Unterzeile im ruhigen Gedämpft-Ton.

**Eingabekarte (links)**
- Beschriftetes natives Datumsfeld (`type="date"`), stilistisch an das dunkle
  Theme angepasst (invertiertes Kalender-Icon).
- **Begrenzter Eingaberaum:** `min = 1900-01-01`, `max = heute` – zukünftige
  Daten sind gar nicht erst wählbar.
- **Schnellauswahl-Chips** als Abkürzungen: *Vor 1 Woche*, *Vor 1 Monat*,
  *Vor 1 Jahr*, *Mondlandung 1969*, *Vor 10 Jahren*, *Vor 100 Jahren*. Sie
  senken die Einstiegshürde und liefern sofort eindrucksvolle Ergebnisse.

**Ergebniskarte (rechts)**
- Die zurückgelegte Lichtdistanz als **dominante Kennzahl** (große, tabellarisch
  ausgerichtete Ziffern in der Akzentfarbe), mit automatisch gewählter Einheit.
- Drei kompakte Kennwerte: *Vergangene Zeit*, *aktive Ansicht*
  (Sonnensystem / Sternenkarte) und *Distanz in Kilometern*.
- **Fehlerzustand:** Bei einem (theoretisch) zukünftigen Datum erscheint statt
  der Zahlen ein freundlicher Hinweis „Bitte wähle ein Datum in der
  Vergangenheit."

**Automatische Einheitenwahl:** Die Distanz wird immer in der lesbarsten
Licht-Einheit dargestellt – Lichtsekunden, -minuten, -stunden, -tage oder
-jahre – abhängig vom Zeitraum. Die Nutzer:innen müssen nie selbst umrechnen.

### 3.2 Visualisierung – die interaktive 3D-Szene

Eine große, abgerundete Karte (70 % der Viewport-Höhe, mind. 460 px) mit einem
React-Three-Fiber-Canvas auf tiefschwarzem Hintergrund.

**Zwei Skalen, ein nahtloser Übergang**

Je nach Ergebnis wechselt die Szene automatisch zwischen zwei Maßstäben
(Schwelle: 0,5 Lichtjahre ≈ 6 Monate Lichtlaufzeit):

- **Sonnensystem-Ansicht** (kurze Zeiträume): Planetenpositionen zum gewählten
  Datum, berechnet mit `astronomy-engine`. Der Radius ist **logarithmisch
  skaliert**, damit die inneren Planeten und eine große Lichtblase gleichzeitig
  sichtbar bleiben.
- **Sternenkarten-Ansicht** (lange Zeiträume): echte Sternpositionen (x/y/z in
  Parsec) aus der HYG-Datenbank, gefiltert auf die nächsten ≈ 3.600 Sterne.

Beim Umschalten fährt die Kamera per `CameraRig` **weich auf den passenden
Abstand** (Lerp-Animation), während die vom Nutzer gewählte Blickrichtung
erhalten bleibt – der Skalensprung wirkt dadurch als fließende Fahrt, nicht als
harter Schnitt.

**Die Lichtblase**

Das Kernelement: eine Kugel mit dem berechneten Lichtdistanz-Radius. Objekte
*innerhalb* dieser Blase gelten als „vom Licht erreicht" und werden
hervorgehoben; Objekte außerhalb sind gedämpft dargestellt.

**Interaktion (OrbitControls)**
- **Ziehen** dreht die Kamera, **Scrollen** zoomt. Panning ist bewusst
  deaktiviert, um das Objekt im Fokus zu halten.
- Sanftes Nachlaufen (Damping) und begrenzte Zoom-Distanzen verhindern, dass man
  sich „verirrt".
- **Klick auf ein Objekt** öffnet das Info-Popup; ein Klick ins Leere schließt
  es wieder.

**Overlays über der Szene** (durchgreichend/pointer-transparent, außer den
interaktiven Elementen):
- **Skalen-Badge** (oben links): aktive Ansicht + aktueller Lichtblasenradius.
- **Legende** (oben rechts, ab `sm` sichtbar): erklärt „im Lichtkegel" vs.
  „noch nicht erreicht" und den jeweiligen Skalierungshinweis.
- **Bedienhinweis** (unten mittig): „Ziehen zum Drehen · Scrollen zum Zoomen ·
  Objekt anklicken für Details" – erscheint nur, solange kein Objekt gewählt ist.
- **Ladezustand:** Ein Spinner mit „Szene wird geladen …" überbrückt das
  asynchrone Laden (React `Suspense`).

**Info-Popup** (unten links, beim Anklicken eines Objekts):
- Kategorie (Planet/Stern) und ggf. Badge „im Lichtkegel".
- Objektname als Überschrift, optionale Zusatzinfo.
- Distanz (in passender Einheit **und** in Kilometern) sowie die Lichtlaufzeit
  in der Akzentfarbe.
- Erläuternder Merksatz: „Das Licht dieses Objekts, das dich jetzt erreicht, ist
  so lange unterwegs gewesen."
- Schließen per ✕-Button (mit `aria-label`) oder Klick in den leeren Raum.

### 3.3 Kontext – ein Gefühl für die Distanz

Ein zentrierter Abschnitt mit responsivem Karten-Raster (1 / 2 / 3 Spalten je
nach Breite). Jede Karte stellt eine bekannte kosmische Wegmarke dar:

*Sonne → Erde*, *Sonne → Neptun*, *Voyager 1*, *Proxima Centauri*, *Sirius*,
*Zentrum der Milchstraße (Sgr A\*)*.

Pro Karte:
- Name + kurze Einordnung.
- **Status-Badge**: „überholt" (grün) oder „noch nicht" (neutral) – je nachdem,
  ob der eigene Lichtstrahl diese Marke bereits passiert hat.
- Kennwerte: Entfernung (km), Lichtlaufzeit und ein direktes Verhältnis
  („x-mal so weit").
- **Visuelles Feedback:** Erreichte Marken färben sich grün ein (Rahmen,
  Hintergrund, Badge, Verhältniswert) – so wird der Fortschritt der Lichtreise
  auf einen Blick lesbar.

Der Voyager-1-Wert ist datumsabhängig (lineares Modell) und wird transparent als
Näherung ausgewiesen.

### 3.4 Footer – Herkunft & Vertrauen

Zweispaltig: links eine kurze Selbstbeschreibung des Projekts, rechts die
**Datenquellen** (HYG-Datenbank, astronomy-engine, exakte Lichtgeschwindigkeit,
Voyager-Distanz). Darunter der Technik-Hinweis und der ehrliche Zusatz „Alle
Distanzen sind Näherungen zu Anschauungszwecken." Externe Links öffnen in neuem
Tab mit `rel="noreferrer"`.

---

## 4. Visuelles Designsystem

**Grundstimmung:** Ein durchgehend dunkles, „kosmisches" Theme (`color-scheme:
dark`) – der schwarze Weltraum ist Bühne und Metapher zugleich.

**Farbpalette (Tailwind-Theme)**

| Rolle              | Token           | Wert       | Verwendung                          |
|--------------------|-----------------|------------|-------------------------------------|
| Hintergrund tief   | `space-950`     | `#04040c`  | Seiten- und Canvas-Hintergrund      |
| Flächen/Karten     | `space-900/800` | `#080814` … | Karten, Badges, Popups             |
| Text hell          | `light-200/300` | `#cfe0ff` … | Überschriften, Fließtext           |
| Akzent (Licht)     | `light-400`     | `#8ab4ff`  | Rahmen, Fokus, Highlights           |
| **Signal „Licht"** | `beam`          | `#ffd76a`  | Kennzahlen, Lichtblase, Lichtlaufzeit |
| Erfolg „überholt"  | Emerald         | `#34d399`… | erreichte Wegmarken                 |

Das warme Gelb (`beam`) ist die einzige „warme" Farbe und trägt konsequent die
Bedeutung *Licht/erreicht* – ein klares, wiedererkennbares Signalfarben-System
gegen das kühle Blau-Schwarz.

**Typografie**
- **Space Grotesk** (Display) für Überschriften und Kennzahlen – markant,
  technisch-elegant.
- **Inter** (Body) für Fließtext – hohe Lesbarkeit.
- Kennzahlen nutzen `tabular-nums` für ruhiges, springfreies Aktualisieren.

**Formsprache & Oberflächen**
- Weiche, große Radien (`rounded-2xl`/`3xl`), halbtransparente Karten mit
  `backdrop-blur` – ein „Glas-über-Weltraum"-Look.
- Dezente Rahmen mit niedriger Deckkraft (`border-light-400/15`) statt harter
  Linien.
- Ambient-Details: ein CSS-Sternenfeld hinter dem Hero, ein radialer
  Lichtschein von oben, ausgedünnte Scrollbars in Akzentfarbe.

**Bewegung (zurückhaltend)**
- `fade-in` beim ersten Erscheinen von Inhalten.
- `pulse-slow` für den Status-Punkt.
- Weiche Kamerafahrten und OrbitControls-Damping in der 3D-Szene.

Bewegung wird sparsam und funktional eingesetzt – sie lenkt Aufmerksamkeit und
verdeutlicht Skalenwechsel, statt zu dekorieren.

---

## 5. Responsives Verhalten

- **Hero:** Eingabe- und Ergebniskarte liegen ab `md` nebeneinander, darunter
  gestapelt. Überschrift skaliert von `4xl` auf `6xl`.
- **Visualisierung:** stets vollbreit (bis 1400 px), feste relative Höhe;
  die **Legende** wird auf sehr kleinen Screens ausgeblendet, um die Szene nicht
  zu überladen.
- **Kontext-Raster:** 1 → 2 → 3 Spalten je nach Breite.
- **Info-Popup:** Breite über `min(20rem, calc(100% − 2rem))` gedeckelt, damit es
  auf schmalen Screens nicht überläuft.

---

## 6. Zugänglichkeit & Umgang mit Grenzfällen

**Bereits vorhanden**
- Sinnvolle Beschriftung des Datumsfeldes (`<label htmlFor>`).
- `aria-label` am Schließen-Button des Popups.
- Semantische Struktur (`section`, `footer`, `h1`–`h3`, `dl`).
- Hoher Kontrast des hellen Textes auf dunklem Grund.
- Fokuszustände am Eingabefeld (Ring + Rahmenfarbe).
- Robuste Zustände: Lade-Spinner, Zukunfts-Hinweis, gedeckelte Zoom-Distanzen.

**Mögliche nächste Schritte (Empfehlungen)**
- Fokus-Sichtbarkeit auch an Chips/Buttons und an den Ergebniskarten prüfen.
- Tastatur- bzw. Nicht-Zeiger-Alternative zur rein maus-/touch-basierten
  3D-Interaktion (Objektauswahl per Tastatur, Textzusammenfassung der Szene).
- `prefers-reduced-motion` respektieren (Kamerafahrten/Animationen reduzieren).
- Screenreader-Beschreibung der 3D-Szene bzw. der aktiven Lichtblase.

---

## 7. UX-Leitprinzipien (Zusammenfassung)

1. **Eine Frage, eine Antwort.** Der ganze Aufbau dient einer einzigen Leitfrage
   – ohne Menüs, ohne Umwege.
2. **Sofortiges, lebendiges Feedback.** Jede Datumsänderung aktualisiert Zahlen
   *und* Szene augenblicklich.
3. **Niedrige Einstiegshürde.** Presets liefern beeindruckende Ergebnisse mit
   einem Klick; niemand muss rechnen.
4. **Größe erfahrbar machen.** Der Wechsel Sonnensystem ↔ Sterne und die
   Vergleichs-Wegmarken übersetzen abstrakte Zahlen in ein Gefühl.
5. **Ruhige, fokussierte Ästhetik.** Dunkles Theme, eine klare Signalfarbe,
   sparsame Bewegung – der Kosmos steht im Mittelpunkt, nicht die Oberfläche.
6. **Ehrlichkeit.** Näherungen und Datenquellen werden offen ausgewiesen.

---

*Technische Basis: React + Vite, Tailwind CSS, React Three Fiber & drei,
astronomy-engine. Diese Beschreibung bezieht sich auf den aktuellen Stand der
Komponenten unter `src/`.*
