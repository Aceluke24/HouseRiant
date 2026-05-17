import { SEASONS, WEEKS } from '../types'
import { useGameState } from '../hooks/useGameState'

// ── Formatting helpers ─────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function isBron(season: string) {
  return season.startsWith('Brón:')
}

function buildDate(year: number, season: string, week: string, day: number): string {
  const dayPart = isBron(season)
    ? `${ordinal(day)} of ${season}`
    : `${ordinal(day)} of ${week} of ${season}`
  return `${dayPart}, Dr-${year}`
}

/**
 * Parse a formatted date string back into its components.
 * Supports both legacy free-text and the structured format with year.
 * Returns null if unrecognisable.
 */
export function parseCalendarDate(dateStr: string): {
  year: number
  season: string
  week: string
  day: number
} | null {
  const trimmed = dateStr.trim()

  // Extract optional trailing ", Dr-{year}"
  let core = trimmed
  let year = 58
  const yearMatch = trimmed.match(/,\s*Dr-(\d+)\s*$/)
  if (yearMatch) {
    year = parseInt(yearMatch[1])
    core = trimmed.slice(0, trimmed.length - yearMatch[0].length).trim()
  }

  const m = core.match(/^(\d+)(?:st|nd|rd|th) of (.+)$/i)
  if (!m) return null
  const day = parseInt(m[1])
  if (isNaN(day) || day < 1 || day > 9) return null
  const rest = m[2]

  if (rest.startsWith('Brón:')) {
    return SEASONS.includes(rest as typeof SEASONS[number])
      ? { year, day, season: rest, week: WEEKS[0] }
      : null
  }

  const idx = rest.lastIndexOf(' of ')
  if (idx === -1) return null
  const week = rest.slice(0, idx)
  const season = rest.slice(idx + 4)
  return SEASONS.includes(season as typeof SEASONS[number]) && WEEKS.includes(week as typeof WEEKS[number])
    ? { year, day, season, week }
    : null
}

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// ── Component ──────────────────────────────────────────────

interface Props {
  /** The current value — a formatted date string or empty/undefined when not set. */
  value?: string
  onChange: (value: string | undefined) => void
}

/**
 * A controlled date picker for the House Riant custom calendar system.
 * Outputs a formatted string like "5th of Iianu of Ambrik's Thaw, Dr-58".
 * Shows a "Set date" button when empty; shows dropdowns + Clear when a date is chosen.
 */
export default function CalendarDatePicker({ value, onChange }: Props) {
  const { data: gameState } = useGameState()
  const parsed = value ? parseCalendarDate(value) : null

  const fallbackSeason = SEASONS.find(s => !s.startsWith('Brón:')) ?? SEASONS[0]
  const year   = parsed?.year   ?? (gameState?.currentYear   ?? 58)
  const season = parsed?.season ?? (gameState?.currentSeason ?? fallbackSeason)
  const week   = parsed?.week   ?? (gameState?.currentWeek   ?? WEEKS[0])
  const day    = parsed?.day    ?? (gameState?.currentDay    ?? 1)
  const bron   = isBron(season)

  function emit(y: number, s: string, w: string, d: number) {
    onChange(buildDate(y, s, w, d))
  }

  if (!value) {
    return (
      <button
        type="button"
        className="btn-secondary"
        style={{ fontSize: 12, padding: '4px 10px', alignSelf: 'flex-start' }}
        onClick={() => emit(year, season, week, day)}
      >
        Set date
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

      {/* Year */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
          YEAR
        </span>
        <input
          type="number"
          className="form-input"
          value={year}
          min={1}
          style={{ width: 80 }}
          onChange={e => {
            const y = parseInt(e.target.value)
            if (!isNaN(y) && y > 0) emit(y, season, week, day)
          }}
        />
      </div>

      {/* Season */}
      <select className="form-select" value={season} onChange={e => emit(year, e.target.value, week, day)}>
        {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Week (hidden for Brón seasons) */}
      {!bron && (
        <select className="form-select" value={week} onChange={e => emit(year, season, e.target.value, day)}>
          {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      )}

      {/* Day + Clear */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <select
          className="form-select"
          value={day}
          style={{ width: 80 }}
          onChange={e => emit(year, season, week, Number(e.target.value))}
        >
          {DAYS.map(d => <option key={d} value={d}>Day {d}</option>)}
        </select>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: 'var(--ink-muted)', textDecoration: 'underline',
            padding: '2px 4px',
          }}
        >
          Clear
        </button>
      </div>

      {/* Live preview */}
      <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
        {value}
      </span>
    </div>
  )
}
