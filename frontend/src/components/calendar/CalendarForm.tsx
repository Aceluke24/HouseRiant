import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateCalendarEvent, useUpdateCalendarEvent } from '../../hooks/useCalendar'
import type { CalendarEvent, CreateCalendarEventRequest, CalendarEventType } from '../../types'
import { SEASONS, WEEKS } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

const EVENT_TYPES: CalendarEventType[] = ['Deadline', 'Battle', 'Festival', 'TaskEvent', 'Note', 'Other']
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
  endDay: string   // empty string = same day
  notes: string
}

interface Props {
  event?: CalendarEvent
  prefill?: { season?: string; week?: string; day?: number; year?: number }
  onClose: () => void
}

export default function CalendarForm({ event, prefill, onClose }: Props) {
  const isEdit = !!event
  const create = useCreateCalendarEvent()
  const update = useUpdateCalendarEvent()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const defaultSeason = event?.season ?? prefill?.season ?? SEASONS[0]

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormFields>({
    defaultValues: {
      name:        event?.name ?? '',
      shortLabel:  event?.shortLabel ?? '',
      description: event?.description ?? '',
      type:        event?.type ?? 'Note',
      year:        event?.year ?? prefill?.year ?? 58,
      season:      defaultSeason,
      week:        event?.week ?? prefill?.week ?? WEEKS[0],
      day:         event?.day ?? prefill?.day ?? 1,
      endWeek:     event?.endWeek ?? '',
      endDay:      event?.endDay != null ? String(event.endDay) : '',
      notes:       event?.notes ?? '',
    },
  })

  const watchedSeason = watch('season')
  const watchedDay = watch('day')
  const isBron = isBronSeason(watchedSeason)

  const onSubmit = handleSubmit(async (raw) => {
    setSubmitError(null)
    const week    = isBronSeason(raw.season) ? undefined : raw.week || undefined
    const endDay  = raw.endDay  !== '' ? Number(raw.endDay)  : undefined
    const endWeek = isBronSeason(raw.season) ? undefined : (raw.endWeek !== '' ? raw.endWeek : undefined)

    const payload: CreateCalendarEventRequest = {
      name:        raw.name.trim(),
      shortLabel:  raw.shortLabel.trim() || undefined,
      description: raw.description.trim() || undefined,
      type:        raw.type,
      year:        Number(raw.year),
      season:      raw.season,
      week,
      day:         Number(raw.day),
      endWeek,
      endDay,
      displayDate: buildDisplayDate(raw.season, week, Number(raw.day)),
      sortOrder:   buildSortOrder(raw.season, week, Number(raw.day)),
      notes:       raw.notes.trim() || undefined,
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: event.id, data: payload })
      } else {
        await create.mutateAsync(payload)
      }
      onClose()
    } catch (e) {
      setSubmitError(getApiErrorMessage(e))
    }
  })

  const busy = create.isPending || update.isPending

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
            <label>Calendar Label <span style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', textTransform: 'none', fontSize: 11, color: 'var(--ink-muted)' }}>(short text shown in grid — leave blank to use name)</span></label>
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
                  <option key={t} value={t}>{t}</option>
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

          {/* End date — only shown if the user wants a multi-day span */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <div className="form-grid-2">
              {!isBron && (
                <div className="form-group">
                  <label>End Week <span style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', textTransform: 'none', fontSize: 11, color: 'var(--ink-muted)' }}>(optional)</span></label>
                  <select className="form-select" {...register('endWeek')}>
                    <option value="">— same week —</option>
                    {WEEKS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>End Day <span style={{ fontFamily: 'EB Garamond', fontStyle: 'italic', textTransform: 'none', fontSize: 11, color: 'var(--ink-muted)' }}>(optional)</span></label>
                <select className="form-select" {...register('endDay')}>
                  <option value="">— single day —</option>
                  {DAYS.filter(d => d >= Number(watchedDay)).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
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
              {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
