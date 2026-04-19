import type { EstateTask } from '../../types'

const STATUS_LABELS: Record<string, string> = { InProgress: 'In Progress' }

interface Props {
  task: EstateTask
  onEdit: () => void
  onDelete: () => void
  onAddToCalendar: () => void
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

function TextSection({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="detail-section">
      <span className="detail-label">{label}</span>
      <p className="detail-text">{value}</p>
    </div>
  )
}

export default function TaskDetail({ task: t, onEdit, onDelete, onAddToCalendar, onClose }: Props) {
  const statusClass = `badge badge-${t.status.toLowerCase()}`
  const priorityClass = `badge badge-${t.priority.toLowerCase()}`

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div style={{ flex: 1, marginRight: 8 }}>
          <h3 style={{ lineHeight: 1.35 }}>{t.name}</h3>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
            <span className={statusClass}>{STATUS_LABELS[t.status] ?? t.status}</span>
            <span className={priorityClass}>{t.priority}</span>
            <span className="badge badge-neutral">{t.category}</span>
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        <DetailRow label="Building" value={t.buildingName} />
        <DetailRow label="Family" value={t.assignedFamilyName} />
        <DetailRow label="Resident" value={t.assignedResidentName} />
        <DetailRow
          label="Cost"
          value={t.costTin != null ? `${t.costTin} tin` : undefined}
        />
        <DetailRow label="Payment" value={t.paymentMethod} />
        <DetailRow label="Target Date" value={t.targetDate} />
        <DetailRow label="Completed" value={t.completedDate} />
      </div>

      <TextSection label="Payment Notes" value={t.paymentNotes} />
      <TextSection label="Description" value={t.description} />
      <TextSection label="Requirements" value={t.requirements} />
      <TextSection label="Outcome" value={t.outcome} />
      <TextSection label="Notes" value={t.notes} />

      <div className="detail-footer">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-secondary" onClick={onAddToCalendar} title="Add this task to the calendar">
          + Calendar
        </button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
