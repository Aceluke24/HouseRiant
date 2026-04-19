import { useState } from 'react'
import { useCreateCalendarEvent } from '../../hooks/useCalendar'
import type { EstateTask } from '../../types'
import { SEASONS, WEEKS } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'
import { parseCalendarDate } from '../CalendarDatePicker'

// ── Formatting helpers ─────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function buildDisplayDate(season: string, week: string | undefined, day: number): string {
  if (season.startsWith('Brón:')) return `${ordinal(day)} of ${season}`
  return `${ordinal(day)} of ${week} of ${season}`
}

function buildSortOrder(season: string, week: string | undefined, day: number): number {
  const seasonIndex = SEASONS.indexOf(season as typeof SEASONS[number])
  const weekIndex = week ? WEEKS.indexOf(week as typeof WEEKS[number]) : 0
  return seasonIndex * 1000 + weekIndex * 10 + day
}

// ── Component ──────────────────────────────────────────────

type DateSource = 'target' | 'completed' | 'custom'

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const DEFAULT_SEASON = SEASONS.find(s => !s.startsWith('Brón:')) ?? SEASONS[0]

interface Props {
  task: EstateTask
  onClose: () => void
}

export default function AddToCalendarModal({ task, onClose }: Props) {
  const create = useCreateCalendarEvent()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const targetParsed    = task.targetDate    ? parseCalendarDate(task.targetDate)    : null
  const completedParsed = task.completedDate ? parseCalendarDate(task.completedDate) : null

  const defaultSource: DateSource =
    targetParsed    ? 'target'    :
    completedParsed ? 'completed' : 'custom'

  const [source, setSource]             = useState<DateSource>(defaultSource)
  const [customYear, setCustomYear]     = useState(58)
  const [customSeason, setCustomSeason] = useState(DEFAULT_SEASON)
  const [customWeek, setCustomWeek]     = useState<string>(WEEKS[0])
  const [customDay, setCustomDay]       = useState(1)
  const isBron = customSeason.startsWith('Brón:')

  function getDateFields(): { year: number; season: string; week?: string; day: number } {
    if (source === 'target'    && targetParsed)    return { ...targetParsed,    week: targetParsed.week }
    if (source === 'completed' && completedParsed) return { ...completedParsed, week: completedParsed.week }
    return { year: customYear, season: customSeason, week: isBron ? undefined : customWeek, day: customDay }
  }

  const submitDisabled =
    create.isPending ||
    (source === 'target'    && !targetParsed) ||
    (source === 'completed' && !completedParsed)

  async function handleAdd() {
    setSubmitError(null)
    const { year, season, week, day } = getDateFields()
    try {
      await create.mutateAsync({
        name:         task.name,
        type:         'TaskEvent',
        year,
        season,
        week,
        day,
        displayDate:  buildDisplayDate(season, week, day),
        sortOrder:    buildSortOrder(season, week, day),
        linkedTaskId: task.id,
      })
      onClose()
    } catch (e) {
      setSubmitError(getApiErrorMessage(e))
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>Add to Calendar</h2>
          <button className="modal-close btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="modal-form">
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: '1.25rem', fontFamily: 'var(--font-body)' }}>
            Adding <strong style={{ color: 'var(--ink)' }}>{task.name}</strong> as a Task event.
            Which date should be used?
          </p>

          {submitError && <div className="form-submit-error">{submitError}</div>}

          {/* Target date */}
          <DateOption
            id="source-target"
            label="Target Date"
            dateText={task.targetDate}
            parsed={targetParsed}
            checked={source === 'target'}
            onChange={() => setSource('target')}
          />

          {/* Completion date */}
          <DateOption
            id="source-completed"
            label="Completion Date"
            dateText={task.completedDate}
            parsed={completedParsed}
            checked={source === 'completed'}
            onChange={() => setSource('completed')}
          />

          {/* Custom date */}
          <label
            htmlFor="source-custom"
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: '0.5rem' }}
          >
            <input
              type="radio"
              id="source-custom"
              name="date-source"
              checked={source === 'custom'}
              onChange={() => setSource('custom')}
              style={{ width: 'auto' }}
            />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, letterSpacing: '0.05em' }}>
              Custom Date
            </span>
          </label>

          {source === 'custom' && (
            <div style={{ paddingLeft: 26, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    value={customYear}
                    onChange={e => { const y = parseInt(e.target.value); if (!isNaN(y) && y > 0) setCustomYear(y) }}
                  />
                </div>
                <div className="form-group">
                  <label>Day</label>
                  <select className="form-select" value={customDay} onChange={e => setCustomDay(Number(e.target.value))}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Season</label>
                <select className="form-select" value={customSeason} onChange={e => setCustomSeason(e.target.value)}>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {!isBron && (
                <div className="form-group">
                  <label>Week</label>
                  <select className="form-select" value={customWeek} onChange={e => setCustomWeek(e.target.value)}>
                    {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={create.isPending}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd} disabled={submitDisabled}>
            {create.isPending ? 'Adding…' : 'Add to Calendar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DateOption sub-component ───────────────────────────────

interface DateOptionProps {
  id: string
  label: string
  dateText?: string | null
  parsed: { year: number; season: string; week: string; day: number } | null
  checked: boolean
  onChange: () => void
}

function DateOption({ id, label, dateText, parsed, checked, onChange }: DateOptionProps) {
  const hasDate  = !!dateText
  const canParse = !!parsed
  const disabled = !hasDate || !canParse

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        cursor: disabled ? 'default' : 'pointer',
        marginBottom: '0.75rem',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <input
        type="radio"
        id={id}
        name="date-source"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ marginTop: 3, width: 'auto' }}
      />
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
          {hasDate ? dateText : 'Not set'}
          {hasDate && !canParse && (
            <span style={{ color: 'var(--danger)', marginLeft: 6, fontSize: 11 }}>
              (unrecognised format — use Custom)
            </span>
          )}
        </div>
      </div>
    </label>
  )
}
