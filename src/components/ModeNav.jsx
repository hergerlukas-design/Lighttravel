import { Shell } from './Section.jsx'

const TABS = [
  { id: 'einzel', label: 'Einzelreise', short: 'Einzeln' },
  { id: 'gemeinsam', label: 'Gemeinsame Reise', short: 'Gemeinsam' },
]

/** Kopfzeile mit Wortmarke und Umschalter zwischen den beiden Reisen. */
export default function ModeNav({ mode, setMode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-light-400/10 bg-space-975/80 backdrop-blur-xl">
      <Shell>
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <button
            onClick={() => setMode('einzel')}
            className="group flex items-center gap-2.5 rounded-lg text-left"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-beam/30 blur-[3px] transition group-hover:bg-beam/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-beam" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-light-100">
              Lichtreise
            </span>
          </button>

          <nav
            aria-label="Ansicht wählen"
            className="flex items-center gap-1 rounded-full border border-light-400/10 bg-space-900/70 p-1"
          >
            {TABS.map((t) => {
              const active = mode === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${
                    active
                      ? 'bg-light-400/20 text-white shadow-[0_0_18px_-6px_rgba(138,180,255,0.8)]'
                      : 'text-light-300/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </Shell>
    </header>
  )
}
