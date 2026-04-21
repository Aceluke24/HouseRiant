import { useState } from 'react'
import type { Resident, NotableFigure } from '../../types'
import type { FocusPersonType } from '../../context/FocusContext'
import PortraitLightbox from '../PortraitLightbox'

// ── Shared helpers ─────────────────────────────────────────────────────────

function Initials({ name, size = 'normal' }: { name: string; size?: 'normal' | 'small' }) {
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  return (
    <span
      className="detail-portrait-initials"
      style={size === 'small' ? { fontSize: 16 } : undefined}
    >
      {initials.toUpperCase()}
    </span>
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

// ── Resident profile (expanded) ────────────────────────────────────────────

function ResidentProfile({ r }: { r: Resident }) {
  return (
    <>
      <div className="detail-body">
        <DetailRow label="Role" value={r.role} />
        <DetailRow label="Status" value={r.statusOther ?? r.status} />
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
    </>
  )
}

// ── Notable Figure profile (expanded) ─────────────────────────────────────

function NotableFigureProfile({ f }: { f: NotableFigure }) {
  return (
    <>
      <div className="detail-body">
        <DetailRow label="Role" value={f.role} />
        <DetailRow label="Status" value={f.isAlive ? 'Alive' : 'Deceased'} />
        <DetailRow label="Family" value={f.familyName} />
        <DetailRow label="Gender" value={f.gender} />
        <DetailRow label="Age" value={f.age?.toString()} />
        <DetailRow label="Race" value={f.race} />
        <DetailRow label="Type" value={f.type} />
        <DetailRow label="Location" value={f.location} />
        <DetailRow label="Faction" value={f.faction} />
        <DetailRow label="Relationship" value={f.relationship} />
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
    </>
  )
}

// ── Collapsed summary view ─────────────────────────────────────────────────
// Shows just portrait, name, title, role, and type badge — enough to
// identify the person at a glance without taking up much space.

function CollapsedSummary({
  person,
  type,
  imageUrl,
}: {
  person: Resident | NotableFigure
  type: FocusPersonType
  imageUrl?: string
}) {
  const title = 'title' in person ? person.title : undefined
  const role = 'role' in person ? person.role : undefined

  return (
    <div className="focus-collapsed">
      {/* Smaller portrait in collapsed mode */}
      <div className="focus-collapsed-portrait">
        {imageUrl
          ? <img
              src={imageUrl}
              alt={person.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          : <Initials name={person.name} size="small" />
        }
      </div>
      <div className="focus-collapsed-info">
        <div className="focus-collapsed-name">{person.name}</div>
        {title && <div className="focus-collapsed-title">{title}</div>}
        {role && <div className="focus-collapsed-role">{role}</div>}
        <span className="focus-type-badge" style={{ marginTop: 4, display: 'inline-block' }}>
          {type === 'resident' ? '⚔ Resident' : '👑 Notable Figure'}
        </span>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props {
  type: FocusPersonType
  person: Resident | NotableFigure
  onRemove: () => void
}

export default function FocusProfileCard({ type, person, onRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  const imageUrl = person.imageUrl
  const imgSrc = imageUrl ? (imageUrl) : null
  const title = 'title' in person ? person.title : undefined

  return (
    <div className={`focus-profile-card ${collapsed ? 'focus-profile-card-collapsed' : ''}`}>
      {lightbox && imgSrc && (
        <PortraitLightbox src={imgSrc} alt={person.name} onClose={() => setLightbox(false)} />
      )}

      {/* ── Card header: name + collapse toggle + remove button ── */}
      <div className="detail-header">
        <div>
          <h3>{person.name}</h3>
          {title && (
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, fontStyle: 'italic' }}>
              {title}
            </p>
          )}
          <span className="focus-type-badge">
            {type === 'resident' ? '⚔ Resident' : '👑 Notable Figure'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {/* Collapse/expand toggle */}
          <button
            className="btn-ghost"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand profile' : 'Collapse profile'}
            style={{ fontSize: 13, color: 'var(--ink-muted)' }}
          >
            {collapsed ? '▼ Expand' : '▲ Collapse'}
          </button>
          {/* Remove from focus */}
          <button
            className="btn-ghost"
            onClick={onRemove}
            title="Remove from focus"
            style={{ color: 'var(--danger)', fontSize: 13 }}
          >
            ✕ Remove
          </button>
        </div>
      </div>

      {/* ── Body: collapsed shows summary, expanded shows full profile ── */}
      {collapsed ? (
        <CollapsedSummary person={person} type={type} imageUrl={imageUrl} />
      ) : (
        <>
          {/* Portrait */}
          <div className={`detail-portrait${imgSrc ? ' detail-portrait-clickable' : ''}`} onClick={imgSrc ? () => setLightbox(true) : undefined}>
            {imgSrc
              ? <img src={imgSrc} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Initials name={person.name} />
            }
          </div>

          {/* Full profile fields */}
          {type === 'resident'
            ? <ResidentProfile r={person as Resident} />
            : <NotableFigureProfile f={person as NotableFigure} />
          }
        </>
      )}
    </div>
  )
}
