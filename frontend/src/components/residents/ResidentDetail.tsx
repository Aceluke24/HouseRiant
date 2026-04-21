import { useState } from 'react'
import type { Resident } from '../../types'
import PortraitLightbox from '../PortraitLightbox'

interface Props {
  resident: Resident
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)
  return <span className="detail-portrait-initials">{initials.toUpperCase()}</span>
}

export default function ResidentDetail({ resident: r, onEdit, onDelete, onClose }: Props) {
  const [lightbox, setLightbox] = useState(false)
  const imgSrc = r.imageUrl ?? null

  return (
    <div className="detail-panel">
      {lightbox && imgSrc && (
        <PortraitLightbox src={imgSrc} alt={r.name} onClose={() => setLightbox(false)} />
      )}

      <div className="detail-header">
        <div>
          <h3>{r.name}</h3>
          {r.title && <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, fontStyle: 'italic' }}>{r.title}</p>}
        </div>
        <button className="btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className={`detail-portrait${imgSrc ? ' detail-portrait-clickable' : ''}`} onClick={imgSrc ? () => setLightbox(true) : undefined}>
        {imgSrc
          ? <img src={imgSrc} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Initials name={r.name} />
        }
      </div>

      <div className="detail-body">
        <DetailRow label="Role" value={r.role} />
        <DetailRow label="Estate Status" value={r.statusOther ?? r.status} />
        <DetailRow label="Family" value={r.familyName} />
        <DetailRow label="Gender" value={r.gender} />
        <DetailRow label="Age" value={r.age?.toString()} />
        <DetailRow label="Race" value={r.race} />
        <DetailRow label="Krell Tribe" value={r.krellTribe} />
        <DetailRow label="Type" value={r.type} />
        <DetailRow label="Daily Pay" value={r.dailyPayRate != null ? `${r.dailyPayRate} tin` : undefined} />
        <DetailRow label="Land Owned" value={r.landOwned} />
        <DetailRow label="Troop Type" value={r.troopType} />
        <DetailRow label="Level of Role" value={r.levelOfRole} />
      </div>

      {r.appearance && (
        <div className="detail-section">
          <span className="detail-label">Appearance</span>
          <p className="detail-text">{r.appearance}</p>
        </div>
      )}
      {r.skills && (
        <div className="detail-section">
          <span className="detail-label">Skills</span>
          <p className="detail-text">{r.skills}</p>
        </div>
      )}
      {r.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-text">{r.notes}</p>
        </div>
      )}

      <div className="detail-footer">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
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
