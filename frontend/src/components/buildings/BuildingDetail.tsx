import { useState } from 'react'
import { useResidents } from '../../hooks/useResidents'
import { useAssignResident, useUnassignResident, useAddAssignment, useRemoveAssignment } from '../../hooks/useBuildings'
import type { Building } from '../../types'
import PortraitLightbox from '../PortraitLightbox'

interface Props {
  building: Building
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

const CONDITION_COLORS: Record<string, string> = {
  Ruined: '#8b1a1a',
  Poor: '#b85c00',
  Functional: '#7a90aa',
  Good: '#2a7a2a',
  Excellent: '#c8a020',
}

const TYPE_COLORS: Record<string, string> = {
  Living: '#1a3f7a',
  Storage: '#5a4a2a',
  Defense: '#6a1a1a',
  Agricultural: '#2a5a1a',
  Workshop: '#4a3a6a',
  Religious: '#1a5a5a',
  Other: '#4a4a4a',
}

export default function BuildingDetail({ building, onEdit, onDelete, onClose }: Props) {
  const { data: allResidents = [] } = useResidents()
  const assign = useAssignResident()
  const unassign = useUnassignResident()
  const [addingResident, setAddingResident] = useState(false)
  const [selectedResidentId, setSelectedResidentId] = useState<string>('')
  const [residentsExpanded, setResidentsExpanded] = useState(true)

  const addAssignment = useAddAssignment()
  const removeAssignment = useRemoveAssignment()
  const [lightbox, setLightbox] = useState(false)
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(true)
  const [addingAssignment, setAddingAssignment] = useState(false)
  const [assignmentResidentId, setAssignmentResidentId] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<string>('')
  const [assignmentSearch, setAssignmentSearch] = useState('')
  const [assignmentDropdownOpen, setAssignmentDropdownOpen] = useState(false)

  const assignedIds = new Set((building.residents ?? []).map(r => r.id))
  const unassignedResidents = allResidents.filter(r => !assignedIds.has(r.id))

  const typeColor = TYPE_COLORS[building.type] ?? '#4a4a4a'
  const condColor = CONDITION_COLORS[building.condition] ?? '#7a90aa'

  const residentCount = building.residents?.length ?? 0
  const capacity = building.capacityPersons
  const isFull = capacity != null && residentCount >= capacity
  const capacityPct = capacity != null && capacity > 0 ? Math.min(residentCount / capacity, 1) : null

  async function handleAssign() {
    const id = Number(selectedResidentId)
    if (!id) return
    await assign.mutateAsync({ buildingId: building.id, residentId: id })
    setSelectedResidentId('')
    setAddingResident(false)
  }

  async function handleUnassign(residentId: number) {
    await unassign.mutateAsync({ buildingId: building.id, residentId })
  }

  // Residents eligible for secondary assignment: exclude primary residents and already-assigned
  const primaryIds = new Set((building.residents ?? []).map(r => r.id))
  const assignedResidentIds = new Set((building.assignments ?? []).map(a => a.residentId))
  const eligibleForAssignment = allResidents.filter(r => !primaryIds.has(r.id) && !assignedResidentIds.has(r.id))

  async function handleAddAssignment() {
    const id = Number(assignmentResidentId)
    if (!id) return
    await addAssignment.mutateAsync({ buildingId: building.id, residentId: id, assignmentType: assignmentType || undefined })
    setAssignmentResidentId('')
    setAssignmentType('')
    setAssignmentSearch('')
    setAssignmentDropdownOpen(false)
    setAddingAssignment(false)
  }

  async function handleRemoveAssignment(assignmentId: number) {
    await removeAssignment.mutateAsync({ buildingId: building.id, assignmentId })
  }

  const imgSrc = building.imageUrl ? `http://localhost:4000${building.imageUrl}` : null

  return (
    <div className="detail-panel">
      {lightbox && imgSrc && (
        <PortraitLightbox src={imgSrc} alt={building.name} onClose={() => setLightbox(false)} />
      )}

      {/* Header */}
      <div className="detail-header">
        <h2>{building.name}</h2>
        <button className="btn-secondary" onClick={onClose}>✕</button>
      </div>

      {/* Building image */}
      {imgSrc && (
        <div
          onClick={() => setLightbox(true)}
          style={{ width: '100%', height: 160, overflow: 'hidden', borderRadius: '6px', marginBottom: '1rem', border: '1px solid var(--gold)', cursor: 'zoom-in' }}
        >
          <img
            src={imgSrc}
            alt={building.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: building.imagePosition || 'center' }}
          />
        </div>
      )}

      {/* Core fields */}
      <div className="detail-body">
        <div className="detail-row">
          <span className="detail-label">Type</span>
          <span style={{
            background: typeColor,
            color: '#f7f2e8',
            padding: '0.15rem 0.6rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          }}>
            {building.type}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Condition</span>
          <span style={{ color: condColor, fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600 }}>
            {building.condition}
          </span>
        </div>

        <DetailRow label="Livable" value={building.isLivable ? 'Yes' : 'No'} />
        <DetailRow
          label="Storage"
          value={building.storageCapacityLbs != null ? `${building.storageCapacityLbs.toLocaleString()} lbs` : undefined}
        />
      </div>

      {/* Residents section */}
      <div className="detail-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: residentsExpanded ? '0.5rem' : 0 }}>
          {/* Clickable header to collapse */}
          <button
            type="button"
            onClick={() => setResidentsExpanded(v => !v)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--ink-muted)', letterSpacing: '0.07em' }}>
              RESIDENTS
            </span>
            {capacity != null && (
              <span style={{ color: isFull ? '#8b1a1a' : 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
                {residentCount}/{capacity}
              </span>
            )}
            <span style={{ color: 'var(--ink-muted)', fontSize: '0.7rem', lineHeight: 1 }}>
              {residentsExpanded ? '▲' : '▼'}
            </span>
          </button>
          {residentsExpanded && !addingResident && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              onClick={() => setAddingResident(true)}
              disabled={unassignedResidents.length === 0}
            >
              + Add
            </button>
          )}
        </div>

        {residentsExpanded && capacityPct != null && (
          <div style={{ height: 4, background: 'var(--blue-pale, #e8eef7)', borderRadius: 2, marginBottom: '0.6rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${capacityPct * 100}%`,
              background: isFull ? '#8b1a1a' : 'var(--gold)',
              borderRadius: 2,
              transition: 'width 0.3s',
            }} />
          </div>
        )}

        {/* Add resident row */}
        {residentsExpanded && addingResident && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ flex: 1, fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
              value={selectedResidentId}
              onChange={e => setSelectedResidentId(e.target.value)}
            >
              <option value="">Select a resident…</option>
              {unassignedResidents.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={handleAssign}
              disabled={!selectedResidentId || assign.isPending}
            >
              {assign.isPending ? '…' : 'Add'}
            </button>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              onClick={() => { setAddingResident(false); setSelectedResidentId('') }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Assigned residents list */}
        {residentsExpanded && building.residents && building.residents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {building.residents.map(r => (
              <div key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--parchment)',
                border: '1px solid var(--blue-pale, #d0d8e8)',
                borderRadius: '6px',
                padding: '0.3rem 0.5rem',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--blue-royal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--gold)',
                }}>
                  {r.imageUrl
                    ? <img src={`http://localhost:4000${r.imageUrl}`} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#f7f2e8', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink)' }}>
                  {r.name}
                </span>
                <button
                  onClick={() => handleUnassign(r.id)}
                  disabled={unassign.isPending}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-muted)',
                    fontSize: '0.8rem',
                    padding: '0 0.2rem',
                    lineHeight: 1,
                  }}
                  title="Remove from building"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : residentsExpanded ? (
          <div style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            No residents assigned
          </div>
        ) : null}
      </div>

      {/* Assigned — secondary assignments (many-to-many) */}
      <div className="detail-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: assignmentsExpanded ? '0.5rem' : 0 }}>
          <button
            type="button"
            onClick={() => setAssignmentsExpanded(v => !v)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', color: 'var(--ink-muted)', letterSpacing: '0.07em' }}>
              ASSIGNED
            </span>
            <span style={{ color: 'var(--ink-muted)', fontSize: '0.65rem' }}>
              {building.assignments && building.assignments.length > 0 ? `(${building.assignments.length})` : ''}
            </span>
            <span style={{ color: 'var(--ink-muted)', fontSize: '0.7rem', lineHeight: 1 }}>
              {assignmentsExpanded ? '▲' : '▼'}
            </span>
          </button>
          {assignmentsExpanded && !addingAssignment && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              onClick={() => setAddingAssignment(true)}
              disabled={eligibleForAssignment.length === 0}
            >
              + Add
            </button>
          )}
        </div>

        {assignmentsExpanded && addingAssignment && (
          <div style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'center' }}>
              {/* Searchable resident dropdown */}
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search residents…"
                  value={assignmentSearch}
                  onChange={e => { setAssignmentSearch(e.target.value); setAssignmentResidentId(''); setAssignmentDropdownOpen(true) }}
                  onFocus={() => setAssignmentDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setAssignmentDropdownOpen(false), 150)}
                  style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                />
                {assignmentDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: 'var(--white)', border: '1px solid var(--border-mid)',
                    borderRadius: 'var(--radius)', maxHeight: 180, overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  }}>
                    {eligibleForAssignment
                      .filter(r => r.name.toLowerCase().includes(assignmentSearch.toLowerCase()))
                      .map(r => (
                        <div
                          key={r.id}
                          onMouseDown={() => {
                            setAssignmentResidentId(String(r.id))
                            setAssignmentSearch(r.name)
                            setAssignmentDropdownOpen(false)
                          }}
                          style={{ padding: '0.4rem 0.6rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--parchment)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          {r.name}
                        </div>
                      ))
                    }
                    {eligibleForAssignment.filter(r =>
                      r.name.toLowerCase().includes(assignmentSearch.toLowerCase())
                    ).length === 0 && (
                      <div style={{ padding: '0.4rem 0.6rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                        No residents found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                className="form-input"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                placeholder="Role (e.g. Workplace, Stationed…)"
                value={assignmentType}
                onChange={e => setAssignmentType(e.target.value)}
              />
              <button
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', whiteSpace: 'nowrap' }}
                onClick={handleAddAssignment}
                disabled={!assignmentResidentId || addAssignment.isPending}
              >
                {addAssignment.isPending ? '…' : 'Add'}
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                onClick={() => { setAddingAssignment(false); setAssignmentResidentId(''); setAssignmentType(''); setAssignmentSearch(''); setAssignmentDropdownOpen(false) }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {assignmentsExpanded && building.assignments && building.assignments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {building.assignments.map(a => (
              <div key={a.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--parchment)',
                border: '1px solid var(--blue-pale, #d0d8e8)',
                borderRadius: '6px',
                padding: '0.3rem 0.5rem',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  background: 'var(--blue-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--gold)',
                }}>
                  {a.residentImageUrl
                    ? <img src={`http://localhost:4000${a.residentImageUrl}`} alt={a.residentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#f7f2e8', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>
                        {a.residentName.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  {a.residentName}
                </span>
                {a.assignmentType && (
                  <span style={{
                    background: 'var(--blue-pale, #e8eef7)',
                    color: 'var(--ink-muted)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.04em',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}>
                    {a.assignmentType}
                  </span>
                )}
                <button
                  onClick={() => handleRemoveAssignment(a.id)}
                  disabled={removeAssignment.isPending}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: '0.8rem', padding: '0 0.2rem', lineHeight: 1 }}
                  title="Remove assignment"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {assignmentsExpanded && (!building.assignments || building.assignments.length === 0) && !addingAssignment && (
          <div style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            No secondary assignments
          </div>
        )}
      </div>

      {/* Linked tasks */}
      {building.tasks && building.tasks.length > 0 && (
        <div className="detail-section">
          <div className="detail-label">Linked Tasks</div>
          <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem' }}>
            {building.tasks.map(t => (
              <li key={t.id} style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', marginBottom: '0.2rem' }}>
                {t.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {building.description && (
        <div className="detail-section">
          <div className="detail-label">Description</div>
          <div className="detail-notes">{building.description}</div>
        </div>
      )}

      {building.notes && (
        <div className="detail-section">
          <div className="detail-label">Notes</div>
          <div className="detail-notes">{building.notes}</div>
        </div>
      )}

      <div className="detail-actions" style={{ marginTop: '1.5rem' }}>
        <button className="btn-primary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
