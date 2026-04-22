import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateCalendarEvent, useUpdateCalendarEvent, useCreateRecurringCalendarEvents } from '../../hooks/useCalendar'
import { calendarApi } from '../../api'
import type { CalendarEvent, CreateCalendarEventRequest, CalendarEventType } from '../../types'
import { SEASONS, WEEKS } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'Deadline',  label: 'Deadline' },
  { value: 'Battle',    label: 'Battle' },
  { value: 'Festival',  label: 'Festival' },
  { value: 'Note',      label: 'Note' },
  { value: 'TaskEvent', label: 'Task' },
  { value: 'Other',     label: 'Other' },
]

type RecurPattern = 'weekly' | 'biweekly' | 'triweekly' | 'seasonal'

const RECUR_PATTERN_OPTIONS: { value: RecurPattern; label: string; description: string }[] = [
  { value: 'weekly',    label: 'Every week',          description: 'One event per week (9 events per season)' },
  { value: 'biweekly',  label: 'Every other week',    description: 'Alternating weeks — weeks 1, 3, 5, 7, 9' },
  { value: 'triweekly', label: 'Every 3rd week',       description: 'Weeks 1, 4, 7 of each season' },
  { value: 'seasonal',  label: 'Once per season',      description: 'Same week & day, one event per season this year' },
]

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function isBronSeason(season: string): boolean {
  return season.startsWith('Brón:')
}

function buildDisplayDate(season: string, week: string | undefined, day: number): string {
  if (isBronSeason(season)) return `${ordinal(day)} of ${season}`
  return `${ordinal(day)} of ${week} of ${season}`
}

function buildSortOrder(season: string, week: string | undefined, day: number): number {
  const seasonIndex = SEASONS.indexOf(season as typeof SEASONS[number])
  const weekIndex = week ? WEEKS.indexOf(week as typeof WEEKS[number]) : 0
  return seasonIndex * 1000 + weekIndex * 10 + day
}

function weeksForPattern(pattern: RecurPattern): readonly string[] {
  if (pattern === 'biweekly')  return WEEKS.filter((_, i) => i % 2 === 0)
  if (pattern === 'triweekly') return WEEKS.filter((_, i) => i % 3 === 0)
  return WEEKS  // weekly (and seasonal doesn't use this)
}

interface FormFields {
  name: string
  shortLabel: string
  description: string
  type: CalendarEventType
  year: number
  season: string
  week: string
  day: number
  endWeek: string
  endDay: string
  notes: string
  isRecurring: boolean
  recurPattern: RecurPattern
  recurScope: string  // season name or '__all__'
}

interface Props {
  event?: CalendarEvent
  prefill?: { season?: string; week?: string; day?: number; year?: number }
  linkedTaskId?: number
  initialName?: string
  onClose: () => void
}

export default function CalendarForm({ event, prefill, linkedTaskId, initialName, onClose }: Props) {
  const isEdit = !!event
  const create = useCreateCalendarEvent()
  const update = useUpdateCalendarEvent()
  const createRecurring = useCreateRecurringCalendarEvents()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const resolvedLinkedTaskId = event?.linkedTaskId ?? linkedTaskId

  const defaultSeason = event?.season ?? prefill?.season ?? SEASONS[0]
  const defaultRecurScope = SEASONS.filter(s => !s.startsWith('Brón:'))[0]

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormFields>({
    defaultValues: {
      name:         event?.name ?? initialName ?? '',
      shortLabel:   event?.shortLabel ?? '',
      description:  event?.description ?? '',
      type:         event?.type ?? 'Note',
      year:         event?.year ?? prefill?.year ?? 58,
      season:       defaultSeason,
      week:         event?.week ?? prefill?.week ?? WEEKS[0],
      day:          event?.day ?? prefill?.day ?? 1,
      endWeek:      event?.endWeek ?? '',
      endDay:       event?.endDay != null ? String(event.endDay) : '',
      notes:        event?.notes ?? '',
      isRecurring:  false,
      recurPattern: 'weekly',
      recurScope:   defaultRecurScope,
    },
  })

  const watchedSeason     = watch('season')
  const watchedDay        = watch('day')
  const watchedIsRecurring = watch('isRecurring')
  const watchedPattern    = watch('recurPattern')
  const isBron = isBronSeason(watchedSeason)

  const onSubmit = handleSubmit(async (raw) => {
    setSubmitError(null)
    const week    = isBronSeason(raw.season) ? undefined : raw.week || undefined
    const endDay  = raw.endDay  !== '' ? Number(raw.endDay)  : undefined
    const endWeek = isBronSeason(raw.season) ? undefined : (raw.endWeek !== '' ? raw.endWeek : undefined)

    const basePayload: CreateCalendarEventRequest = {
      name:         raw.name.trim(),
      shortLabel:   raw.shortLabel.trim() || undefined,
      description:  raw.description.trim() || undefined,
      type:         raw.type,
      year:         Number(raw.year),
      season:       raw.season,
      week,
      day:          Number(raw.day),
      endWeek,
      endDay,
      displayDate:  buildDisplayDate(raw.season, week, Number(raw.day)),
      sortOrder:    buildSortOrder(raw.season, week, Number(raw.day)),
      notes:        raw.notes.trim() || undefined,
      linkedTaskId: resolvedLinkedTaskId,
    }

    try {
      if (raw.isRecurring && !isBronSeason(raw.season)) {
        // Build list of events for the series
        const events: CreateCalendarEventRequest[] = []

        if (raw.recurPattern === 'seasonal') {
          // One event per non-Brón season, same week + day
          for (const season of SEASONS.filter(s => !isBronSeason(s))) {
            events.push({
              ...basePayload,
              season,
              displayDate: buildDisplayDate(season, week, Number(raw.day)),
              sortOrder:   buildSortOrder(season, week, Number(raw.day)),
            })
          }
        } else {
          // weekly / biweekly / triweekly across the selected scope
          const scopeSeasons = raw.recurScope === '__all__'
            ? SEASONS.filter(s => !isBronSeason(s))
            : [raw.recurScope]
          const patternWeeks = weeksForPattern(raw.recurPattern)
          for (const season of scopeSeasons) {
            for (const w of patternWeeks) {
              events.push({
                ...basePayload,
                season,
                week: w,
                displayDate: buildDisplayDate(season, w, Number(raw.day)),
                sortOrder:   buildSortOrder(season, w, Number(raw.day)),
              })
            }
          }
        }

        if (isEdit) {
          // Delete the current single event, then recreate as a full series
          await calendarApi.delete(event.id)
        }
        await createRecurring.mutateAsync(events)
      } else if (isEdit) {
        await update.mutateAsync({ id: event.id, data: basePayload })
      } else {
        await create.mutateAsync(basePayload)
      }
      onClose()
    } catch (e) {
      setSubmitError(getApiErrorMessage(e))
    }
  })

  const busy = create.isPending || update.isPending || createRecurring.isPending
  const showRecurring = !isBron

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Event' : 'New Calendar Event'}</h2>
          <button className="modal-close btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={onSubmit}>
          {submitError && <div className="form-submit-error">{submitError}</div>}

          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Festival of the Amber Moon"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>
              Calendar Label{' '}
              <span style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', textTransform: 'none', fontSize: 11, color: 'var(--ink-muted)' }}>
                (short text shown in grid — leave blank to use name)
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Amber Festival"
              maxLength={20}
              {...register('shortLabel')}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Type</label>
              <select className="form-select" {...register('type')}>
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                className="form-input"
                placeholder="58"
                {...register('year', { required: true, min: 1 })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Season</label>
              <select className="form-select" {...register('season')}>
                {SEASONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Start Day</label>
              <select className="form-select" {...register('day', { valueAsNumber: true })}>
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {!isBron && (
            <div className="form-group">
              <label>Start Week</label>
              <select className="form-select" {...register('week')}>
                {WEEKS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          )}

          {/* End date span */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <div className="form-grid-2">
              {!isBron && (
                <div className="form-group">
                  <label>
                    End Week{' '}
                    <span style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', textTransform: 'none', fontSize: 11, color: 'var(--ink-muted)' }}>
                      (optional)
                    </span>
                  </label>
                  <select className="form-select" {...register('endWeek')}>
                    <option value="">— same week —</option>
                    {WEEKS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>
                  End Day{' '}
                  <span style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', textTransform: 'none', fontSize: 11, color: 'var(--ink-muted)' }}>
                    (optional)
                  </span>
                </label>
                <select className="form-select" {...register('endDay')}>
                  <option value="">— single day —</option>
                  {DAYS.filter(d => d >= Number(watchedDay)).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recurring events */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            {showRecurring ? (
              <>
                <div className="form-group">
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    textTransform: 'none', fontSize: 13, letterSpacing: 0, color: 'var(--ink-mid)',
                  }}>
                    <input type="checkbox" style={{ width: 'auto' }} {...register('isRecurring')} />
                    Make this a recurring event
                  </label>
                </div>

                {watchedIsRecurring && (
                  <>
                    {isEdit && (
                      <p style={{ fontSize: 12, color: 'var(--gold)', fontStyle: 'italic', marginBottom: '0.75rem', background: 'rgba(200,160,32,0.08)', padding: '0.4rem 0.6rem', borderRadius: 4 }}>
                        This will replace the current event with a full recurring series.
                      </p>
                    )}

                    <div className="form-group">
                      <label>Recurrence pattern</label>
                      <select className="form-select" {...register('recurPattern')}>
                        {RECUR_PATTERN_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: 11, color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: 2, display: 'block' }}>
                        {RECUR_PATTERN_OPTIONS.find(o => o.value === watchedPattern)?.description}
                      </span>
                    </div>

                    {watchedPattern !== 'seasonal' && (
                      <div className="form-group">
                        <label>Season scope</label>
                        <select className="form-select" {...register('recurScope')}>
                          <option value="__all__">All seasons this year (non-Brón)</option>
                          {SEASONS.filter(s => !s.startsWith('Brón:')).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                Brón transitions have no named weeks — recurring events are not available for this season.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="form-textarea" rows={2} placeholder="Short description…" {...register('description')} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-textarea" rows={2} placeholder="Additional notes…" {...register('notes')} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? 'Saving…'
                : isEdit && watchedIsRecurring
                  ? 'Convert to Series'
                  : isEdit
                    ? 'Save Changes'
                    : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
