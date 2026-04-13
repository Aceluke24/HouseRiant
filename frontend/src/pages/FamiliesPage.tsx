import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFamilies, useCreateFamily, useUpdateFamily, useDeleteFamily } from '../hooks/useFamilies'
import ConfirmModal from '../components/ConfirmModal'
import type { Family, CreateFamilyRequest } from '../types'

// ── Relationship config ────────────────────────────────────────────────────────

const RELATIONSHIPS = ['Ally', 'Friend', 'Neutral', 'Vassal', 'Rival', 'Foe', 'Unknown'] as const

const RELATIONSHIP_COLORS: Record<string, { bg: string; color: string }> = {
  Ally:    { bg: '#1a3f1a', color: '#5dbe5d' },
  Friend:  { bg: '#1a3a1a', color: '#6fcf6f' },
  Vassal:  { bg: '#1a2f4a', color: '#5b9bd5' },
  Neutral: { bg: '#2a2a1a', color: '#c8b84a' },
  Rival:   { bg: '#3a2a1a', color: '#d4884a' },
  Foe:     { bg: '#3a1a1a', color: '#cf5b5b' },
  Unknown: { bg: '#2a2a2a', color: '#888' },
}

function RelationshipBadge({ value }: { value?: string }) {
  if (!value) return <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem' }}>—</span>
  const style = RELATIONSHIP_COLORS[value] ?? RELATIONSHIP_COLORS.Unknown
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontFamily: 'var(--font-heading)',
      letterSpacing: '0.05em',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.color}44`,
    }}>
      {value}
    </span>
  )
}

// ── Form modal ─────────────────────────────────────────────────────────────────

interface FamilyFormProps {
  initial?: Family
  onClose: () => void
  onSave: (data: CreateFamilyRequest) => void
  saving: boolean
}

function FamilyForm({ initial, onClose, onSave, saving }: FamilyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFamilyRequest>({
    defaultValues: initial
      ? {
          name: initial.name,
          origin: initial.origin ?? '',
          expertise: initial.expertise ?? '',
          motto: initial.motto ?? '',
          headOfFamily: initial.headOfFamily ?? '',
          relationship: initial.relationship ?? '',
          allegiance: initial.allegiance ?? '',
          notes: initial.notes ?? '',
        }
      : { relationship: 'Unknown' },
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Family' : 'Add Family'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="modal-form">

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Family Name *</label>
            <input
              className="form-input"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. House Eldran"
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          {/* Head of family + origin row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Head of Family</label>
              <input
                className="form-input"
                {...register('headOfFamily')}
                placeholder="e.g. Lord Aldric Eldran"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Origin / Region</label>
              <input
                className="form-input"
                {...register('origin')}
                placeholder="e.g. Northern Vales"
              />
            </div>
          </div>

          {/* Expertise + relationship row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Area of Expertise</label>
              <input
                className="form-input"
                {...register('expertise')}
                placeholder="e.g. Mining, Swordsmanship"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Relationship to House Riant</label>
              <select className="form-select" {...register('relationship')}>
                <option value="">— Select —</option>
                {RELATIONSHIPS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Allegiance */}
          <div className="form-group">
            <label className="form-label">Allegiance</label>
            <input
              className="form-input"
              {...register('allegiance')}
              placeholder="e.g. House Riant, The Crown"
            />
          </div>

          {/* Motto */}
          <div className="form-group">
            <label className="form-label">House Motto</label>
            <input
              className="form-input"
              {...register('motto')}
              placeholder="e.g. Through fire we endure"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              {...register('notes')}
              rows={4}
              placeholder="History, lore, additional details..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Family'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function FamilyDetail({
  family,
  onEdit,
  onDelete,
  onClose,
}: {
  family: Family
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2 className="detail-name">{family.name}</h2>
          {family.motto && (
            <p style={{
              fontStyle: 'italic',
              color: 'var(--gold)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              marginTop: '2px',
            }}>
              "{family.motto}"
            </p>
          )}
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-section">
        <RelationshipBadge value={family.relationship} />
      </div>

      <div className="detail-section">
        <div className="detail-grid">
          {family.headOfFamily && (
            <div className="detail-field">
              <span className="detail-label">Head of Family</span>
              <span className="detail-value">{family.headOfFamily}</span>
            </div>
          )}
          {family.origin && (
            <div className="detail-field">
              <span className="detail-label">Origin</span>
              <span className="detail-value">{family.origin}</span>
            </div>
          )}
          {family.expertise && (
            <div className="detail-field">
              <span className="detail-label">Expertise</span>
              <span className="detail-value">{family.expertise}</span>
            </div>
          )}
          {family.allegiance && (
            <div className="detail-field">
              <span className="detail-label">Allegiance</span>
              <span className="detail-value">{family.allegiance}</span>
            </div>
          )}
        </div>
      </div>

      {/* Member counts */}
      <div className="detail-section">
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            flex: 1, background: 'var(--blue-mid)', borderRadius: '8px',
            padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
              {family.residentCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '2px' }}>Residents</div>
          </div>
          <div style={{
            flex: 1, background: 'var(--blue-mid)', borderRadius: '8px',
            padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
              {family.notableFigureCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '2px' }}>Notable Figures</div>
          </div>
        </div>
      </div>

      {family.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-notes">{family.notes}</p>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function FamiliesPage() {
  const { data: families = [], isLoading, isError } = useFamilies()
  const createFamily = useCreateFamily()
  const updateFamily = useUpdateFamily()
  const deleteFamily = useDeleteFamily()

  const [search, setSearch] = useState('')
  const [relationshipFilters, setRelationshipFilters] = useState<string[]>([])
  const [selected, setSelected] = useState<Family | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Family | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Family | null>(null)

  const filtered = useMemo(() => {
    return families.filter(f => {
      const matchSearch = !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.origin?.toLowerCase().includes(search.toLowerCase()) ||
        f.expertise?.toLowerCase().includes(search.toLowerCase())
      const matchRelationship =
        relationshipFilters.length === 0 ||
        relationshipFilters.includes(f.relationship ?? '')
      return matchSearch && matchRelationship
    })
  }, [families, search, relationshipFilters])

  useEffect(() => {
    if (!selected) return
    if (!filtered.some((f) => f.id === selected.id)) {
      setSelected(null)
    }
  }, [filtered, selected])

  const toggleRelationshipFilter = (relationship: string) => {
    if (relationship === 'All') {
      setRelationshipFilters([])
      return
    }
    setRelationshipFilters((prev) =>
      prev.includes(relationship)
        ? prev.filter((r) => r !== relationship)
        : [...prev, relationship]
    )
  }

  const isRelationshipActive = (relationship: string) => (
    relationship === 'All'
      ? relationshipFilters.length === 0
      : relationshipFilters.includes(relationship)
  )

  function handleSave(data: CreateFamilyRequest) {
    if (editTarget) {
      updateFamily.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            setShowForm(false)
            setEditTarget(null)
          },
        }
      )
    } else {
      createFamily.mutate(data, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function handleDelete(family: Family) {
    setConfirmDelete(family)
  }
  function handleConfirmDelete() {
    if (!confirmDelete) return
    deleteFamily.mutate(confirmDelete.id, {
      onSuccess: () => { setSelected(null); setConfirmDelete(null) },
    })
  }

  function openEdit(family: Family) {
    setEditTarget(family)
    setShowForm(true)
    setSelected(null)
  }

  return (
    <div className="page" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>
      {/* Main content area */}
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Families</h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
              {families.length} {families.length === 1 ? 'house' : 'houses'} recorded
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Add Family
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search families, origins, expertise…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="chip-row">
            <button
              className={`chip ${isRelationshipActive('All') ? 'chip-active' : ''}`}
              onClick={() => toggleRelationshipFilter('All')}
            >All</button>
            {RELATIONSHIPS.map(r => (
              <button
                key={r}
                className={`chip ${isRelationshipActive(r) ? 'chip-active' : ''}`}
                onClick={() => toggleRelationshipFilter(r)}
              >{r}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading && <p style={{ color: 'var(--ink-muted)' }}>Loading families…</p>}
        {isError && <p style={{ color: '#cf5b5b' }}>Failed to load families.</p>}

        {!isLoading && !isError && (
          filtered.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏠</div>
                <p>{search || relationshipFilters.length > 0 ? 'No families match your filters.' : 'No families recorded yet.'}</p>
              </div>
            )
            : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Family</th>
                    <th>Head</th>
                    <th>Origin</th>
                    <th>Expertise</th>
                    <th>Relationship</th>
                    <th>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(family => (
                    <tr
                      key={family.id}
                      onClick={() => setSelected(selected?.id === family.id ? null : family)}
                      style={{ cursor: 'pointer' }}
                      className={selected?.id === family.id ? 'row-selected' : ''}
                    >
                      <td>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                          {family.name}
                        </div>
                        {family.motto && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                            "{family.motto}"
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--ink-muted)' }}>{family.headOfFamily || '—'}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{family.origin || '—'}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{family.expertise || '—'}</td>
                      <td><RelationshipBadge value={family.relationship} /></td>
                      <td>
                        <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                          {(family.residentCount ?? 0) + (family.notableFigureCount ?? 0)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginLeft: '4px' }}>
                          ({family.residentCount ?? 0} res / {family.notableFigureCount ?? 0} nf)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <FamilyDetail
          family={selected}
          onEdit={() => openEdit(selected)}
          onDelete={() => handleDelete(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Form modal */}
      {showForm && (
        <FamilyForm
          initial={editTarget ?? undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleSave}
          saving={createFamily.isPending || updateFamily.isPending}
        />
      )}

      {confirmDelete != null && (
        <ConfirmModal
          title="Delete Family"
          message={`Delete ${confirmDelete.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
