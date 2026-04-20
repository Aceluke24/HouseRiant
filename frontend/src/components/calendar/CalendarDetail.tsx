import type { CalendarEvent } from '../../types'

interface Props {
  event: CalendarEvent
  onEdit: () => void
  onDelete: () => void
  onDeleteGroup?: () => void
  onClose: () => void
}

const TYPE_BADGE: { [key: string]: string } = {
  Deadline:  'badge badge-danger',
  Battle:    'badge badge-battle',
  Festival:  'badge badge-warning',
  Note:      'badge badge-info',
  TaskEvent: 'badge badge-task',
  Other:     'badge badge-other',
}

const TYPE_LABELS: { [key: string]: string } = {
  TaskEvent: 'Task',
}

export default function CalendarDetail({ event: e, onEdit, onDelete, onDeleteGroup, onClose }: Props) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h3>{e.name}</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{e.displayDate}</p>
        </div>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        <div className="detail-row">
          <span className="detail-label">Type</span>
          <span className={TYPE_BADGE[e.type] ?? 'badge badge-other'}>{TYPE_LABELS[e.type] ?? e.type}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Year</span>
          <span className="detail-value">Dr-{e.year}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Season</span>
          <span className="detail-value">{e.season}</span>
        </div>
        {e.week && (
          <div className="detail-row">
            <span className="detail-label">Week</span>
            <span className="detail-value">{e.week}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Day</span>
          <span className="detail-value">
            {e.endDay != null
              ? `${e.day}–${e.endDay}${e.endWeek && e.endWeek !== e.week ? ` (ends ${e.endWeek})` : ''}`
              : e.day}
          </span>
        </div>
        {e.shortLabel && (
          <div className="detail-row">
            <span className="detail-label">Label</span>
            <span className="detail-value" style={{ fontStyle: 'italic' }}>{e.shortLabel}</span>
          </div>
        )}
        {e.linkedTaskId && (
          <div className="detail-row">
            <span className="detail-label">Linked Task</span>
            <span className="detail-value" style={{ color: 'var(--blue-mid)' }}>#{e.linkedTaskId}</span>
          </div>
        )}
        {e.recurrenceGroupId != null && (
          <div className="detail-row">
            <span className="detail-label">Recurring</span>
            <span className="detail-value" style={{ color: 'var(--ink-muted)', fontSize: 12 }}>
              ↻ Series #{e.recurrenceGroupId}
            </span>
          </div>
        )}
      </div>

      {e.description && (
        <div className="detail-section">
          <span className="detail-label">Description</span>
          <p className="detail-text">{e.description}</p>
        </div>
      )}
      {e.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-text">{e.notes}</p>
        </div>
      )}

      <div className="detail-footer">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        {e.recurrenceGroupId != null && onDeleteGroup && (
          <button className="btn-secondary" onClick={onDeleteGroup} title="Delete all events in this series">
            Delete Series
          </button>
        )}
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
