import { useMemo, useState } from 'react'
import Hero from './components/Hero.jsx'
import Visualization from './components/Visualization.jsx'
import ContextSection from './components/ContextSection.jsx'
import Footer from './components/Footer.jsx'
import ModeNav from './components/ModeNav.jsx'
import SharedJourney from './components/SharedJourney.jsx'
import { Shell, SectionHeading } from './components/Section.jsx'
import { computeLightTravel } from './lib/lightTravel.js'
import { readJourneyFromLocation } from './lib/journey.js'

// Startwert: vor 30 Tagen – zeigt direkt die Sonnensystem-Ansicht.
function defaultDate() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export default function App() {
  // Startzustand aus der URL: ?ansicht=gemeinsam öffnet die gemeinsame Reise.
  const initialJourney = useMemo(() => readJourneyFromLocation(), [])
  const [mode, setMode] = useState(initialJourney.isShared ? 'gemeinsam' : 'einzel')

  const [dateStr, setDateStr] = useState(defaultDate)
  const [selected, setSelected] = useState(null)

  // "now" pro Datumsänderung fixieren, damit Werte stabil bleiben.
  const result = useMemo(() => {
    const from = new Date(`${dateStr}T00:00:00`)
    return computeLightTravel(from, new Date())
  }, [dateStr])

  const switchMode = (m) => {
    setMode(m)
    // Einzelreise trägt keine Parameter – URL aufräumen. Die gemeinsame Reise
    // spiegelt ihren Zustand selbst in die URL.
    if (m === 'einzel') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  return (
    <div className="min-h-full bg-space-975">
      <ModeNav mode={mode} setMode={switchMode} />

      <main>
        {mode === 'einzel' ? (
          <>
            <Hero dateStr={dateStr} setDateStr={setDateStr} result={result} />

            <section className="pb-4 pt-6">
              <Shell>
                <div className="relative h-[min(70vh,42rem)] min-h-[26rem] w-full overflow-hidden rounded-3xl border border-light-400/10 bg-space-975 shadow-panel">
                  {result.isFuture ? (
                    <div className="grid h-full place-items-center px-6 text-center text-sm text-light-300/60">
                      Wähle ein Datum in der Vergangenheit, um die Lichtreise zu
                      sehen.
                    </div>
                  ) : (
                    <Visualization
                      result={result}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  )}
                </div>
              </Shell>
            </section>

            <section className="relative py-16 sm:py-20">
              <Shell>
                <SectionHeading
                  eyebrow="Maßstab"
                  title="Ein Gefühl für die Distanz"
                  description="Die zurückgelegte Lichtdistanz im Vergleich zu bekannten Wegmarken im Kosmos. Grün bedeutet: dein Lichtstrahl hat diese Marke bereits überholt."
                />
                <ContextSection result={result} />
              </Shell>
            </section>
          </>
        ) : (
          <SharedJourney initial={initialJourney} />
        )}
      </main>

      <Footer />
    </div>
  )
}
