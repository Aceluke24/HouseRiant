import type { InventoryItem } from '../../types'

interface Props {
  item: InventoryItem
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null
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

export default function InventoryDetail({ item: i, onEdit, onDelete, onClose }: Props) {
  const conditionClass = i.condition
    ? `badge badge-${i.condition.toLowerCase()}`
    : undefined

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div style={{ flex: 1, marginRight: 8 }}>
          <h3 style={{ lineHeight: 1.35 }}>{i.name}</h3>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
            <span className="badge badge-neutral">{i.category}</span>
            {conditionClass && (
              <span className={conditionClass}>{i.condition}</span>
            )}
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        <DetailRow
          label="Quantity"
          value={i.unit ? `${i.quantity} ${i.unit}` : String(i.quantity)}
        />
        <DetailRow label="Location" value={i.location} />
        <DetailRow
          label="Est. Value"
          value={i.estimatedValue != null ? `${i.estimatedValue} tin` : undefined}
        />
      </div>

      <TextSection label="Description" value={i.description} />
      <TextSection label="Notes" value={i.notes} />

      <div className="detail-footer">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
