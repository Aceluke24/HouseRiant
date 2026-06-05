import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useOrganizations, useCreateOrganization, useUpdateOrganization, useDeleteOrganization } from '../hooks/useOrganizations'
import ConfirmModal from '../components/ConfirmModal'
import type { Organization, CreateOrganizationRequest, OrgType, OrgRelationship } from '../types'

// ── Badge helpers ──────────────────────────────────────────────────────────────

const ORG_TYPES: OrgType[] = ['Guild', 'Religious Order', 'Criminal', 'Political', 'Military', 'Merchant', 'Other']
const ORG_RELATIONSHIPS: OrgRelationship[] = ['Allied', 'Neutral', 'Hostile', 'Unknown', 'Member']

function typeBadgeClass(type: string): string {
  switch (type) {
    case 'Guild':          return 'badge badge-guild'
    case 'Religious Order':return 'badge badge-religious-order'
    case 'Criminal':       return 'badge badge-criminal'
    case 'Political':      return 'badge badge-political'
    case 'Military':       return 'badge badge-military'
    case 'Merchant':       return 'badge badge-merchant'
    default:               return 'badge badge-org-other'
  }
}

function relBadgeClass(rel: string): string {
  switch (rel) {
    case 'Allied':  return 'badge badge-allied'
    case 'Hostile': return 'badge badge-hostile'
    case 'Member':  return 'badge badge-member'
    case 'Unknown': return 'badge badge-unknown'
    default:        return 'badge badge-neutral'
  }
}

// ── Form modal ─────────────────────────────────────────────────────────────────

interface OrgFormProps {
  initial?: Organization
  onClose: () => void
  onSave: (data: CreateOrganizationRequest) => void
  saving: boolean
}

function OrgForm({ initial, onClose, onSave, saving }: OrgFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrganizationRequest>({
    defaultValues: initial
      ? {
          name: initial.name,
          type: initial.type,
          description: initial.description ?? '',
          headquarters: initial.headquarters ?? '',
          leader: initial.leader ?? '',
          relationship: initial.relationship,
          allegiance: initial.allegiance ?? '',
          isActive: initial.isActive,
          notes: initial.notes ?? '',
        }
      : { type: 'Guild', relationship: 'Unknown', isActive: true },
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Organization' : 'Add Organization'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="modal-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. The Iron Covenant"
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" {...register('type')}>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Relationship</label>
              <select className="form-select" {...register('relationship')}>
                {ORG_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Headquarters</label>
              <input
                className="form-input"
                {...register('headquarters')}
                placeholder="e.g. Kesswick City"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Leader</label>
              <input
                className="form-input"
                {...register('leader')}
                placeholder="e.g. Guildmaster Brynn"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Allegiance</label>
            <input
              className="form-input"
              {...register('allegiance')}
              placeholder="e.g. The Crown, House Riant"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              {...register('description')}
              rows={4}
              placeholder="Purpose, history, notable activities..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              {...register('notes')}
              rows={2}
              placeholder="Campaign notes..."
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              <span className="form-label" style={{ margin: 0 }}>Active</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function OrgDetail({
  org,
  onEdit,
  onDelete,
  onClose,
}: {
  org: Organization
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2 className="detail-name">{org.name}</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginTop: '2px' }}>{org.type}</p>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-section" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className={relBadgeClass(org.relationship)}>{org.relationship}</span>
        <span className={`badge ${org.isActive ? 'badge-success' : 'badge-neutral'}`}>
          {org.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="detail-section">
        <div className="detail-grid">
          {org.headquarters && (
            <div className="detail-field">
              <span className="detail-label">Headquarters</span>
              <span className="detail-value">{org.headquarters}</span>
            </div>
          )}
          {org.leader && (
            <div className="detail-field">
              <span className="detail-label">Leader</span>
              <span className="detail-value">{org.leader}</span>
            </div>
          )}
          {org.allegiance && (
            <div className="detail-field">
              <span className="detail-label">Allegiance</span>
              <span className="detail-value">{org.allegiance}</span>
            </div>
          )}
        </div>
      </div>

      {org.description && (
        <div className="detail-section">
          <span className="detail-label">Description</span>
          <p className="detail-notes">{org.description}</p>
        </div>
      )}

      {org.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-notes">{org.notes}</p>
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

export default function OrganizationsPage() {
  const { data: organizations = [], isLoading, isError } = useOrganizations()
  const createOrganization = useCreateOrganization()
  const updateOrganization = useUpdateOrganization()
  const deleteOrganization = useDeleteOrganization()

  const [search, setSearch] = useState('')
  const [typeFilters, setTypeFilters] = useState<string[]>([])
  const [relationshipFilters, setRelationshipFilters] = useState<string[]>([])
  const [selected, setSelected] = useState<Organization | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Organization | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Organization | null>(null)

  const filtered = useMemo(() => {
    return organizations.filter(o => {
      const matchSearch = !search ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.headquarters?.toLowerCase().includes(search.toLowerCase()) ||
        o.leader?.toLowerCase().includes(search.toLowerCase()) ||
        o.description?.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilters.length === 0 || typeFilters.includes(o.type)
      const matchRel = relationshipFilters.length === 0 || relationshipFilters.includes(o.relationship)
      return matchSearch && matchType && matchRel
    })
  }, [organizations, search, typeFilters, relationshipFilters])

  useEffect(() => {
    if (!selected) return
    if (!filtered.some(o => o.id === selected.id)) setSelected(null)
  }, [filtered, selected])

  function toggleType(type: string) {
    if (type === 'All') { setTypeFilters([]); return }
    setTypeFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  function toggleRelationship(rel: string) {
    if (rel === 'All') { setRelationshipFilters([]); return }
    setRelationshipFilters(prev => prev.includes(rel) ? prev.filter(r => r !== rel) : [...prev, rel])
  }

  function handleSave(data: CreateOrganizationRequest) {
    if (editTarget) {
      updateOrganization.mutate({ id: editTarget.id, data }, {
        onSuccess: () => { setShowForm(false); setEditTarget(null) },
      })
    } else {
      createOrganization.mutate(data, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function openEdit(org: Organization) {
    setEditTarget(org)
    setShowForm(true)
    setSelected(null)
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return
    deleteOrganization.mutate(confirmDelete.id, {
      onSuccess: () => { setSelected(null); setConfirmDelete(null) },
    })
  }

  return (
    <div className="page" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>

        <div className="page-header">
          <div>
            <h1>Organizations</h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
              {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'} recorded
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Add Organization
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search organizations, leaders, headquarters…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="chip-row">
            <button
              className={`chip ${typeFilters.length === 0 ? 'chip-active' : ''}`}
              onClick={() => toggleType('All')}
            >All Types</button>
            {ORG_TYPES.map(t => (
              <button
                key={t}
                className={`chip ${typeFilters.includes(t) ? 'chip-active' : ''}`}
                onClick={() => toggleType(t)}
              >{t}</button>
            ))}
          </div>
          <div className="chip-row">
            <button
              className={`chip ${relationshipFilters.length === 0 ? 'chip-active' : ''}`}
              onClick={() => toggleRelationship('All')}
            >All Relations</button>
            {ORG_RELATIONSHIPS.map(r => (
              <button
                key={r}
                className={`chip ${relationshipFilters.includes(r) ? 'chip-active' : ''}`}
                onClick={() => toggleRelationship(r)}
              >{r}</button>
            ))}
          </div>
        </div>

        {isLoading && <p style={{ color: 'var(--ink-muted)' }}>Loading organizations…</p>}
        {isError && <p style={{ color: '#cf5b5b' }}>Failed to load organizations.</p>}

        {!isLoading && !isError && (
          filtered.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚔</div>
                <p>{search || typeFilters.length > 0 || relationshipFilters.length > 0
                  ? 'No organizations match your filters.'
                  : 'No organizations recorded yet.'}
                </p>
              </div>
            )
            : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Type</th>
                    <th>Relationship</th>
                    <th>Headquarters</th>
                    <th>Leader</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(org => (
                    <tr
                      key={org.id}
                      onClick={() => setSelected(selected?.id === org.id ? null : org)}
                      style={{ cursor: 'pointer' }}
                      className={selected?.id === org.id ? 'row-selected' : ''}
                    >
                      <td>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{org.name}</div>
                      </td>
                      <td><span className={typeBadgeClass(org.type)}>{org.type}</span></td>
                      <td><span className={relBadgeClass(org.relationship)}>{org.relationship}</span></td>
                      <td style={{ color: 'var(--ink-muted)' }}>{org.headquarters || '—'}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{org.leader || '—'}</td>
                      <td>
                        <span className={`badge ${org.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {org.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>

      {selected && (
        <OrgDetail
          org={selected}
          onEdit={() => openEdit(selected)}
          onDelete={() => setConfirmDelete(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      {showForm && (
        <OrgForm
          initial={editTarget ?? undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleSave}
          saving={createOrganization.isPending || updateOrganization.isPending}
        />
      )}

      {confirmDelete != null && (
        <ConfirmModal
          title="Delete Organization"
          message={`Delete ${confirmDelete.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
