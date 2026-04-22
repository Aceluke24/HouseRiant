import { Fragment, forwardRef, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCalendar, useCreateCalendarEvent, useDeleteCalendarEvent, useDeleteCalendarEventGroup } from '../hooks/useCalendar'
import { useGameState, useUpdateGameDate } from '../hooks/useGameState'
import CalendarForm from '../components/calendar/CalendarForm'
import CalendarDetail from '../components/calendar/CalendarDetail'
import TaskForm from '../components/tasks/TaskForm'
import ConfirmModal from '../components/ConfirmModal'
import type { CalendarEvent, EstateTask } from '../types'
import { SEASONS, WEEKS } from '../types'
import { parseCalendarDate } from '../components/CalendarDatePicker'

// ── Today date shape ───────────────────────────────────────────────────────

interface TodayDate {
  year: number
  season: string
  week: string | undefined
  day: number
}

const DEFAULT_TODAY: TodayDate = { year: 58, season: "Brón: Bás", week: undefined, day: 3 }

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function formatToday(t: TodayDate): string {
  const week = t.week ? `${t.week} of ` : ''
  return `${ordinal(t.day)} of ${week}${t.season}, Dr-${t.year}`
}

// ── Misc helpers ───────────────────────────────────────────────────────────

const TYPE_CHIP: { [key: string]: string } = {
  Deadline:  'cal-chip cal-chip-deadline',
  Battle:    'cal-chip cal-chip-battle',
  Festival:  'cal-chip cal-chip-festival',
  Note:      'cal-chip cal-chip-note',
  TaskEvent: 'cal-chip cal-chip-task',
  Other:     'cal-chip cal-chip-other',
}

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

// Convert (week, day) to a linear index within a season for span comparison.
// Brón seasons have no week so we just use day-1.
function weekDayIndex(week: string | undefined, day: number): number {
  if (!week) return day - 1
  const wi = WEEKS.indexOf(week as typeof WEEKS[number])
  if (wi === -1) return day - 1  // unknown week treated like Brón (no named week)
  return wi * 9 + (day - 1)
}

// Returns whether an event occupies a given (week, day) cell.
function eventCoversCell(ev: CalendarEvent, cellWeek: string | undefined, cellDay: number): boolean {
  const start = weekDayIndex(ev.week, ev.day)
  const end   = weekDayIndex(ev.endWeek ?? ev.week, ev.endDay ?? ev.day)
  const cell  = weekDayIndex(cellWeek, cellDay)
  return cell >= start && cell <= end
}

// Whether this cell is the start of the event span.
function isSpanStart(ev: CalendarEvent, cellWeek: string | undefined, cellDay: number): boolean {
  return ev.week === (cellWeek ?? undefined) && ev.day === cellDay
}

// Whether this cell is the end of the event span.
function isSpanEnd(ev: CalendarEvent, cellWeek: string | undefined, cellDay: number): boolean {
  return (ev.endWeek ?? ev.week) === (cellWeek ?? undefined) && (ev.endDay ?? ev.day) === cellDay
}

function isBron(season: string) {
  return season.startsWith('Brón:')
}

// ── Today editor modal ─────────────────────────────────────────────────────

interface TodayEditorProps {
  current: TodayDate
  onSave: (t: TodayDate) => void
  onClose: () => void
}

interface TodayFields {
  year: number
  season: string
  week: string
  day: number
}

function TodayEditor({ current, onSave, onClose }: TodayEditorProps) {
  const { register, handleSubmit, watch } = useForm<TodayFields>({
    defaultValues: {
      year:   current.year,
      season: current.season,
      week:   current.week ?? WEEKS[0],
      day:    current.day,
    },
  })

  const watchedSeason = watch('season')
  const bron = isBron(watchedSeason)

  function onSubmit(raw: TodayFields) {
    onSave({
      year:   Number(raw.year),
      season: raw.season,
      week:   bron ? undefined : raw.week,
      day:    Number(raw.day),
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h2>Set Current Date</h2>
          <button className="modal-close btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Year</label>
              <input type="number" className="form-input" {...register('year', { min: 1 })} />
            </div>
            <div className="form-group">
              <label>Day (1–9)</label>
              <select className="form-select" {...register('day', { valueAsNumber: true })}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Season</label>
            <select className="form-select" {...register('season')}>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {!bron && (
            <div className="form-group">
              <label>Week</label>
              <select className="form-select" {...register('week')}>
                {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Set Date</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Cell ───────────────────────────────────────────────────────────────────

interface CellProps {
  day: number
  week: string | undefined   // undefined for Brón rows
  events: CalendarEvent[]    // all events that cover this cell (spanning included)
  isToday: boolean
  onSelect: (e: CalendarEvent) => void
  onAdd: () => void
  onSetToday: () => void
}

function CalendarCell({ day, week, events, isToday, onSelect, onAdd, onSetToday }: CellProps) {
  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('.cal-set-today-btn')) return
    if ((e.target as HTMLElement).closest('.cal-chip')) return  // chips have their own handler
    if (events.length > 0) onSelect(events[0])
    else onAdd()
  }

  return (
    <div
      className={`cal-cell${isToday ? ' cal-cell-today' : ''}${events.length > 0 ? ' cal-cell-has-events' : ''}`}
      onClick={handleClick}
      title={events.length > 0 ? undefined : `Day ${day} — click to add event`}
    >
      <span className="cal-day-num">{day}</span>
      {!isToday && (
        <button
          className="cal-set-today-btn"
          onClick={e => { e.stopPropagation(); onSetToday() }}
          title="Set as today"
        >
          📌
        </button>
      )}
      <div className="cal-chips">
        {events.map(ev => {
          const start = isSpanStart(ev, week, day)
          const end   = isSpanEnd(ev, week, day)
          const solo  = start && end
          const label = ev.shortLabel || ev.name
          const shape = solo ? 'cal-chip-solo' : start ? 'cal-chip-start' : end ? 'cal-chip-end' : 'cal-chip-mid'
          return (
            <div
              key={ev.id}
              className={`${TYPE_CHIP[ev.type] ?? 'cal-chip cal-chip-other'} ${shape}`}
              title={ev.name}
              onClick={e => { e.stopPropagation(); onSelect(ev) }}
            >
              {(start || solo) && (
                <span className="cal-chip-label">
                  {ev.recurrenceGroupId != null && <span style={{ marginRight: 2, opacity: 0.8 }}>↻</span>}
                  {label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Season grid ────────────────────────────────────────────────────────────

interface SeasonGridProps {
  season: string
  events: CalendarEvent[]
  year: number
  today: TodayDate
  onSelect: (e: CalendarEvent) => void
  onAdd: (prefill: { season: string; week?: string; day: number; year: number }) => void
  onSetToday: (t: TodayDate) => void
}

const SeasonGrid = forwardRef<HTMLDivElement, SeasonGridProps>(function SeasonGrid({ season, events, year, today, onSelect, onAdd, onSetToday }, ref) {
  const bron = isBron(season)
  const isCurrentSeason = year === today.year && season === today.season

  // Events that belong to this season (may span into other cells within it)
  const seasonEvents = events.filter(e => e.season === season)

  function eventsFor(week: string | undefined, day: number): CalendarEvent[] {
    return seasonEvents.filter(ev => eventCoversCell(ev, week, day))
  }

  function isToday(week: string | undefined, day: number) {
    return year === today.year &&
      season === today.season &&
      (week ?? undefined) === (today.week ?? undefined) &&
      day === today.day
  }

  return (
    <div className="cal-season-block" ref={ref}>
      <div className={`cal-season-heading${isCurrentSeason ? ' cal-season-heading-current' : ''}`}>
        {season}
        {bron && <span className="cal-season-tag">transition</span>}
        {isCurrentSeason && <span className="cal-season-tag cal-season-tag-current">current season</span>}
      </div>

      <div className={`cal-grid${bron ? ' cal-grid-bron' : ''}`}>
        <div className="cal-week-label" />
        {DAYS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}

        {bron ? (
          <>
            <div className="cal-week-label" />
            {DAYS.map(d => (
              <CalendarCell
                key={d}
                day={d}
                week={undefined}
                events={eventsFor(undefined, d)}
                isToday={isToday(undefined, d)}
                onSelect={onSelect}
                onAdd={() => onAdd({ season, day: d, year })}
                onSetToday={() => onSetToday({ year, season, week: undefined, day: d })}
              />
            ))}
          </>
        ) : (
          WEEKS.map(week => {
            const isCurrentWeek = isCurrentSeason && week === today.week
            return (
            <Fragment key={week}>
              <div className={`cal-week-label${isCurrentWeek ? ' cal-week-label-current' : ''}`}>{week}</div>
              {DAYS.map(d => (
                <CalendarCell
                  key={`${week}-${d}`}
                  day={d}
                  week={week}
                  events={eventsFor(week, d)}
                  isToday={isToday(week, d)}
                  onSelect={onSelect}
                  onAdd={() => onAdd({ season, week, day: d, year })}
                  onSetToday={() => onSetToday({ year, season, week, day: d })}
                />
              ))}
            </Fragment>
            )
          })
        )}
      </div>
    </div>
  )
})

// ── Page ───────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { data: allEvents = [], isLoading } = useCalendar()
  const { data: gameState } = useGameState()
  const updateGameDate = useUpdateGameDate()
  const createCalendarEvent = useCreateCalendarEvent()
  const deleteEvent = useDeleteCalendarEvent()
  const deleteGroup = useDeleteCalendarEventGroup()

  // Derive today from the DB-backed game state record
  const today: TodayDate = gameState
    ? { year: gameState.currentYear, season: gameState.currentSeason ?? DEFAULT_TODAY.season, week: gameState.currentWeek ?? undefined, day: gameState.currentDay }
    : DEFAULT_TODAY

  const [showTodayEditor, setShowTodayEditor] = useState(false)
  const [year, setYear] = useState(DEFAULT_TODAY.year)
  const [seasonFilter, setSeasonFilter] = useState<Set<string>>(new Set())

  // Once game state loads for the first time, jump the view to today's year and scroll to today's season
  const initializedRef = useRef(false)
  const currentSeasonRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (gameState && !initializedRef.current) {
      setYear(gameState.currentYear)
      if (gameState.currentSeason) setSeasonFilter(new Set([gameState.currentSeason]))
      initializedRef.current = true
      // Scroll after the season grids have rendered
      requestAnimationFrame(() => {
        currentSeasonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [gameState])

  const pendingJumpRef = useRef(false)

  // When a cross-year jump completes, scroll to the current season
  useEffect(() => {
    if (pendingJumpRef.current) {
      pendingJumpRef.current = false
      requestAnimationFrame(() => {
        currentSeasonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [year])

  function jumpToToday() {
    if (year !== today.year) {
      pendingJumpRef.current = true
      setYear(today.year)
    } else {
      currentSeasonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<CalendarEvent | undefined>()
  const [prefill, setPrefill] = useState<{ season?: string; week?: string; day?: number; year?: number } | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<number | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)

  function handleSetToday(t: TodayDate) {
    updateGameDate.mutate({
      currentYear:   t.year,
      currentSeason: t.season,
      currentWeek:   t.week,
      currentDay:    t.day,
    })
    setYear(t.year)   // jump calendar view to the new year immediately
    setShowTodayEditor(false)
  }

  const yearEvents = allEvents.filter(e => e.year === year)
  const visibleSeasons = seasonFilter.size > 0 ? SEASONS.filter(s => seasonFilter.has(s)) : SEASONS

  // Derive selected from live data so edits are reflected immediately
  const selected = selectedId != null ? allEvents.find(e => e.id === selectedId) ?? null : null

  function handleAdd(pre?: { season?: string; week?: string; day?: number; year?: number }) {
    setEditTarget(undefined)
    setPrefill(pre ?? { year })
    setShowForm(true)
  }

  function handleEdit(e: CalendarEvent) {
    setEditTarget(e)
    setPrefill(undefined)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditTarget(undefined)
    setPrefill(undefined)
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId == null) return
    await deleteEvent.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }

  async function handleConfirmDeleteGroup() {
    if (confirmDeleteGroupId == null) return
    await deleteGroup.mutateAsync(confirmDeleteGroupId)
    if (selected?.recurrenceGroupId === confirmDeleteGroupId) setSelectedId(null)
    setConfirmDeleteGroupId(null)
  }

  function handleTaskCreated(task: EstateTask) {
    const parsed = task.targetDate ? parseCalendarDate(task.targetDate) : null
    const eventYear   = parsed?.year   ?? today.year
    const eventSeason = parsed?.season ?? today.season
    const eventWeek   = parsed?.week   ?? today.week
    const eventDay    = parsed?.day    ?? today.day
    const displayDate = task.targetDate ?? formatToday(today)
    createCalendarEvent.mutate({
      name:        task.name,
      description: task.description,
      type:        'TaskEvent',
      year:        eventYear,
      season:      eventSeason,
      week:        eventWeek,
      day:         eventDay,
      displayDate,
      sortOrder:   0,
      linkedTaskId: task.id,
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Calendar</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setShowTaskForm(true)}>+ Add Task</button>
          <button className="btn-primary" onClick={() => handleAdd()}>+ Add Event</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Row 1: year nav + today indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="cal-year-nav">
            <button className="btn-ghost cal-year-btn" onClick={() => setYear(y => y - 1)}>‹</button>
            <span className="cal-year-label">Dr-{year}</span>
            <button className="btn-ghost cal-year-btn" onClick={() => setYear(y => y + 1)}>›</button>
          </div>

          <div className="cal-today-display">
            <span className="cal-today-label">Today:</span>
            <span className="cal-today-date">{formatToday(today)}</span>
            <button
              className="btn-ghost cal-today-edit-btn"
              onClick={() => setShowTodayEditor(true)}
              title="Change current date"
            >
              ✏
            </button>
            <button
              className="btn-ghost cal-jump-today-btn"
              onClick={jumpToToday}
              title="Scroll to current season"
            >
              Jump to Today
            </button>
          </div>
        </div>

        {/* Row 2: season filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`chip${seasonFilter.size === 0 ? ' chip-active' : ''}`}
            onClick={() => setSeasonFilter(new Set())}
          >
            All
          </button>
          {SEASONS.map(s => (
            <button
              key={s}
              className={`chip${seasonFilter.has(s) ? ' chip-active' : ''}${isBron(s) ? ' chip-bron' : ''}`}
              onClick={() => setSeasonFilter(prev => {
                const next = new Set(prev)
                next.has(s) ? next.delete(s) : next.add(s)
                return next
              })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Consulting the annals…</div>
      ) : (
        <div className="list-layout" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {visibleSeasons.map(season => {
              const isCurrentSeason = year === today.year && season === today.season
              return (
                <SeasonGrid
                  key={season}
                  ref={isCurrentSeason ? currentSeasonRef : undefined}
                  season={season}
                  events={yearEvents}
                  year={year}
                  today={today}
                  onSelect={e => setSelectedId(e.id)}
                  onAdd={pre => handleAdd(pre)}
                  onSetToday={handleSetToday}
                />
              )
            })}

            {yearEvents.length === 0 && !isLoading && (
              <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '2rem' }}>
                No events recorded for Dr-{year}.
              </p>
            )}
          </div>

          {selected && (
            <CalendarDetail
              event={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => setConfirmDeleteId(selected.id)}
              onDeleteGroup={selected.recurrenceGroupId != null
                ? () => setConfirmDeleteGroupId(selected.recurrenceGroupId!)
                : undefined}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}

      {showTodayEditor && (
        <TodayEditor
          current={today}
          onSave={handleSetToday}
          onClose={() => setShowTodayEditor(false)}
        />
      )}

      {showForm && (
        <CalendarForm
          event={editTarget}
          prefill={prefill}
          onClose={handleFormClose}
        />
      )}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Delete Event"
          message="Remove this event from the calendar? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmDeleteGroupId != null && (
        <ConfirmModal
          title="Delete Entire Series"
          message="This will delete all recurring events in this series. This cannot be undone."
          confirmLabel="Delete Series"
          onConfirm={handleConfirmDeleteGroup}
          onCancel={() => setConfirmDeleteGroupId(null)}
        />
      )}

      {showTaskForm && <TaskForm onClose={() => setShowTaskForm(false)} onTaskCreated={handleTaskCreated} />}
    </div>
  )
}
