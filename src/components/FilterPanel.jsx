import { useMemo, useState } from 'react'
import { STARS } from '../lib/stars.js'
import {
  DEFAULT_FILTERS,
  MAG_MIN,
  MAG_MAX,
  MAX_DIST_LY,
  NAKED_EYE_MAG,
  matchesStar,
  activeFilterCount,
  isDefaultFilters,
  PRESENT_CONSTELLATIONS,
} from '../lib/starFilter.js'
import { constellationName } from '../lib/constellations.js'
import { nf } from '../lib/lightTravel.js'

const STATUS_OPTIONS = [
  { key: 'all', label: 'Alle' },
  { key: 'inside', label: 'Im Lichtkegel' },
  { key: 'boundary', label: 'An der Grenze' },
  { key: 'outside', label: 'Nicht erreicht' },
]

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-sm text-light-200">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? 'bg-beam/80' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? 'left-[1.125rem]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export default function FilterPanel({ filters, setFilters, bubblePc }) {
  const [open, setOpen] = useState(false)

  const matchCount = useMemo(
    () => STARS.reduce((acc, s) => acc + (matchesStar(s, filters, bubblePc) ? 1 : 0), 0),
    [filters, bubblePc],
  )

  const active = activeFilterCount(filters)
  const patch = (p) => setFilters((f) => ({ ...f, ...p }))

  return (
    <div className="pointer-events-auto absolute left-4 top-[6.5rem] w-[min(17rem,calc(100%-2rem))]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-light-400/15 bg-space-900/80 px-3 py-2 backdrop-blur-md transition hover:border-light-400/35"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-light-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
          {active > 0 && (
            <span className="rounded-full bg-beam/25 px-1.5 text-[10px] font-semibold text-beam">
              {active}
            </span>
          )}
        </span>
        <span className="text-light-300/50">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2 max-h-[min(60vh,30rem)] space-y-4 overflow-y-auto rounded-xl border border-light-400/15 bg-space-900/85 p-4 backdrop-blur-md shadow-2xl">
          {/* Nur benannte */}
          <Toggle
            checked={filters.onlyNamed}
            onChange={(v) => patch({ onlyNamed: v })}
            label="Nur benannte Sterne"
          />

          {/* Status */}
          <div>
            <div className="mb-1.5 text-[11px] uppercase tracking-wider text-light-300/50">
              Lichtblasen-Status
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => patch({ status: o.key })}
                  className={`rounded-md px-2 py-1.5 text-xs transition ${
                    filters.status === o.key
                      ? 'bg-beam/20 text-beam ring-1 ring-beam/40'
                      : 'bg-white/5 text-light-300/70 hover:bg-white/10'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Helligkeit */}
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-wider text-light-300/50">
                Helligkeit
              </span>
              <span className="text-xs text-light-200">
                {filters.maxMag >= MAG_MAX
                  ? 'alle'
                  : `bis ${nf(1).format(filters.maxMag)} mag`}
              </span>
            </div>
            <input
              type="range"
              min={MAG_MIN}
              max={MAG_MAX}
              step={0.5}
              value={filters.maxMag}
              onChange={(e) => patch({ maxMag: parseFloat(e.target.value) })}
              className="w-full accent-beam"
            />
            <div className="mt-0.5 text-[10px] text-light-300/40">
              kleiner = nur hellere Sterne · ≤ {NAKED_EYE_MAG} mit bloßem Auge
            </div>
          </div>

          {/* Sternbild */}
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-light-300/50">
              Sternbild
            </div>
            <select
              value={filters.con}
              onChange={(e) => patch({ con: e.target.value })}
              className="w-full rounded-md border border-light-400/20 bg-space-950/70 px-2 py-1.5 text-sm text-light-200 outline-none focus:border-light-400/50"
            >
              <option value="all">Alle Sternbilder</option>
              {PRESENT_CONSTELLATIONS.map((c) => (
                <option key={c} value={c}>
                  {constellationName(c)}
                </option>
              ))}
            </select>
          </div>

          {/* Distanz-Bereich */}
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-wider text-light-300/50">
                Distanz
              </span>
              <span className="text-xs text-light-200">
                {nf(0).format(filters.distMin)}–{nf(0).format(filters.distMax)} Lj
              </span>
            </div>
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={MAX_DIST_LY}
                step={1}
                value={filters.distMin}
                onChange={(e) =>
                  patch({ distMin: Math.min(parseFloat(e.target.value), filters.distMax) })
                }
                className="w-full accent-beam"
              />
              <input
                type="range"
                min={0}
                max={MAX_DIST_LY}
                step={1}
                value={filters.distMax}
                onChange={(e) =>
                  patch({ distMax: Math.max(parseFloat(e.target.value), filters.distMin) })
                }
                className="w-full accent-beam"
              />
            </div>
          </div>

          {/* Fußzeile */}
          <div className="flex items-center justify-between border-t border-light-400/10 pt-3">
            <span className="text-xs text-light-300/60">
              {nf(0).format(matchCount)} von {nf(0).format(STARS.length)} Sternen
            </span>
            {!isDefaultFilters(filters) && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="rounded-md px-2 py-1 text-xs text-light-300/70 transition hover:bg-white/10 hover:text-white"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
