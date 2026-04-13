import { useState } from 'react'
import type { NotableFigure } from '../../types'
import PortraitLightbox from '../PortraitLightbox'

interface Props {
  figure: NotableFigure
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)
  return <span className="detail-portrait-initials">{initials.toUpperCase()}</span>
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

export default function NotableFigureDetail({ figure: f, onEdit, onDelete, onClose }: Props) {
  const [lightbox, setLightbox] = useState(false)
  const imgSrc = f.imageUrl ? (f.imageUrl.startsWith('http') ? f.imageUrl : `http://localhost:4000${f.imageUrl}`) : null

  return (
    <div className="detail-panel">
      {lightbox && imgSrc && (
        <PortraitLightbox src={imgSrc} alt={f.name} onClose={() => setLightbox(false)} />
      )}

      <div className="detail-header">
        <div>
          <h3>{f.name}</h3>
          {f.title && <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, fontStyle: 'italic' }}>{f.title}</p>}
        </div>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className={`detail-portrait${imgSrc ? ' detail-portrait-clickable' : ''}`} onClick={imgSrc ? () => setLightbox(true) : undefined}>
        {imgSrc
          ? <img src={imgSrc} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Initials name={f.name} />
        }
      </div>

      <div className="detail-body">
        <DetailRow label="Status" value={f.isAlive ? 'Alive' : 'Deceased'} />
        <DetailRow label="Role" value={f.role} />
        <DetailRow label="Family" value={f.familyName} />
        <DetailRow label="Relationship" value={f.relationship} />
        <DetailRow label="Faction" value={f.faction} />
        <DetailRow label="Location" value={f.location} />
        <DetailRow label="Gender" value={f.gender} />
        <DetailRow label="Age" value={f.age?.toString()} />
        <DetailRow label="Race" value={f.race} />
        <DetailRow label="Krell Tribe" value={f.krellTribe} />
        <DetailRow label="Type" value={f.type} />
        <DetailRow label="First Met" value={f.firstMet} />
        <DetailRow label="Last Seen" value={f.lastSeen} />
      </div>

      {f.appearance && (
        <div className="detail-section">
          <span className="detail-label">Appearance</span>
          <p className="detail-text">{f.appearance}</p>
        </div>
      )}
      {f.skills && (
        <div className="detail-section">
          <span className="detail-label">Skills</span>
          <p className="detail-text">{f.skills}</p>
        </div>
      )}
      {f.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-text">{f.notes}</p>
        </div>
      )}

      <div className="detail-footer">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
