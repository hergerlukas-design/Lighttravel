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
      aria-pressed={checked}
      className="flex w-full items-center justify-between gap-3 rounded-lg text-left"
    >
      <span className="text-[13px] text-light-200">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? 'bg-beam/80' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[1.125rem]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

/** Gruppentitel innerhalb des Filterpanels. */
function Group({ title, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="label text-[10px] text-light-300/50">{title}</span>
        {hint && <span className="text-xs tabular-nums text-light-200">{hint}</span>}
      </div>
      {children}
    </div>
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
    <div className="pointer-events-auto flex min-h-0 flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`hud flex shrink-0 items-center justify-between gap-2 transition hover:border-light-400/35 ${
          open ? 'border-light-400/30' : ''
        }`}
      >
        <span className="flex items-center gap-2 text-[13px] font-medium text-light-100">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
          {active > 0 && (
            <span className="rounded-full bg-beam/25 px-1.5 text-[10px] font-semibold tabular-nums text-beam">
              {active}
            </span>
          )}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-light-300/50 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 min-h-0 flex-1 space-y-4 overflow-y-auto rounded-xl border border-light-400/10 bg-space-950/90 p-4 shadow-hud backdrop-blur-md">
          <Toggle
            checked={filters.onlyNamed}
            onChange={(v) => patch({ onlyNamed: v })}
            label="Nur benannte Sterne"
          />

          <Group title="Lichtblasen-Status">
            <div className="grid grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => patch({ status: o.key })}
                  aria-pressed={filters.status === o.key}
                  className={`rounded-md px-2 py-1.5 text-[11px] transition ${
                    filters.status === o.key
                      ? 'bg-beam/20 text-beam ring-1 ring-beam/40'
                      : 'bg-white/[0.06] text-light-300/70 hover:bg-white/10 hover:text-light-100'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Group>

          <Group
            title="Helligkeit"
            hint={
              filters.maxMag >= MAG_MAX ? 'alle' : `bis ${nf(1).format(filters.maxMag)} mag`
            }
          >
            <input
              type="range"
              min={MAG_MIN}
              max={MAG_MAX}
              step={0.5}
              value={filters.maxMag}
              onChange={(e) => patch({ maxMag: parseFloat(e.target.value) })}
              aria-label="Maximale Helligkeit"
              className="w-full"
            />
            <div className="text-[10px] text-light-300/45">
              kleiner = nur hellere Sterne · ≤ {NAKED_EYE_MAG} mit bloßem Auge
            </div>
          </Group>

          <Group title="Sternbild">
            <select
              value={filters.con}
              onChange={(e) => patch({ con: e.target.value })}
              className="w-full rounded-md border border-light-400/20 bg-space-975/80 px-2 py-1.5 text-[13px] text-light-100 outline-none transition hover:border-light-400/35 focus:border-light-400/60"
            >
              <option value="all">Alle Sternbilder</option>
              {PRESENT_CONSTELLATIONS.map((c) => (
                <option key={c} value={c}>
                  {constellationName(c)}
                </option>
              ))}
            </select>
          </Group>

          <Group
            title="Distanz"
            hint={`${nf(0).format(filters.distMin)}–${nf(0).format(filters.distMax)} Lj`}
          >
            <div className="space-y-0.5">
              <input
                type="range"
                min={0}
                max={MAX_DIST_LY}
                step={1}
                value={filters.distMin}
                aria-label="Kleinste Distanz"
                onChange={(e) =>
                  patch({ distMin: Math.min(parseFloat(e.target.value), filters.distMax) })
                }
                className="w-full"
              />
              <input
                type="range"
                min={0}
                max={MAX_DIST_LY}
                step={1}
                value={filters.distMax}
                aria-label="Größte Distanz"
                onChange={(e) =>
                  patch({ distMax: Math.max(parseFloat(e.target.value), filters.distMin) })
                }
                className="w-full"
              />
            </div>
          </Group>

          <div className="space-y-2.5 border-t border-white/[0.07] pt-3">
            <div className="label text-[10px] text-light-300/50">Ebenen</div>
            <Toggle
              checked={filters.showDeepSky}
              onChange={(v) => patch({ showDeepSky: v })}
              label="Deep-Sky-Objekte (Messier)"
            />
            <Toggle
              checked={filters.showClusters}
              onChange={(v) => patch({ showClusters: v })}
              label="Nahe Sternhaufen"
            />
            <Toggle
              checked={filters.showMilkyWay}
              onChange={(v) => patch({ showMilkyWay: v })}
              label="Milchstraßenband"
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
            <span className="text-[11px] tabular-nums text-light-300/60">
              {nf(0).format(matchCount)} von {nf(0).format(STARS.length)} Sternen
            </span>
            {!isDefaultFilters(filters) && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="rounded-md px-2 py-1 text-[11px] text-light-300/70 transition hover:bg-white/10 hover:text-white"
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
