import { useMemo, useState } from 'react'
import Hero from './components/Hero.jsx'
import Visualization from './components/Visualization.jsx'
import ContextSection from './components/ContextSection.jsx'
import Footer from './components/Footer.jsx'
import ModeNav from './components/ModeNav.jsx'
import SharedJourney from './components/SharedJourney.jsx'
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
    <div className="min-h-full">
      <ModeNav mode={mode} setMode={switchMode} />

      {mode === 'einzel' ? (
        <>
          <Hero dateStr={dateStr} setDateStr={setDateStr} result={result} />

          <section className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6">
            <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden rounded-3xl border border-light-400/15 bg-space-950 shadow-2xl">
              {result.isFuture ? (
                <div className="grid h-full place-items-center px-6 text-center text-light-300/60">
                  Wähle ein Datum in der Vergangenheit, um die Lichtreise zu sehen.
                </div>
              ) : (
                <Visualization
                  result={result}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}
            </div>
          </section>

          <ContextSection result={result} />
        </>
      ) : (
        <SharedJourney initial={initialJourney} />
      )}

      <Footer />
    </div>
  )
}
