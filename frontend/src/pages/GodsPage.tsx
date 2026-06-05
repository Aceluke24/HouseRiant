import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useGods, useCreateGod, useUpdateGod, useDeleteGod } from '../hooks/useGods'
import ConfirmModal from '../components/ConfirmModal'
import type { God, CreateGodRequest, GodTier } from '../types'

const TIERS: GodTier[] = ['Primal', 'Chadarim', 'Amadí', 'Maru']

function tierBadgeClass(tier: string): string {
  switch (tier) {
    case 'Primal':   return 'badge badge-primal'
    case 'Chadarim': return 'badge badge-chadarim'
    case 'Amadí':    return 'badge badge-amadi'
    case 'Maru':     return 'badge badge-maru'
    default:         return 'badge badge-neutral'
  }
}

// ── Form modal ─────────────────────────────────────────────────────────────────

interface GodFormProps {
  initial?: God
  onClose: () => void
  onSave: (data: CreateGodRequest) => void
  saving: boolean
}

function GodForm({ initial, onClose, onSave, saving }: GodFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGodRequest>({
    defaultValues: initial
      ? {
          name: initial.name,
          tier: initial.tier,
          primaryDomain: initial.primaryDomain ?? '',
          description: initial.description ?? '',
          notes: initial.notes ?? '',
          isActive: initial.isActive,
        }
      : { tier: 'Primal', isActive: true },
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit God' : 'Add God'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="modal-form">

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. Aumma"
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Tier</label>
              <select className="form-select" {...register('tier')}>
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Domain</label>
            <input
              className="form-input"
              {...register('primaryDomain')}
              placeholder="e.g. Life, Death, Fate"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              {...register('description')}
              rows={5}
              placeholder="Lore, sacred symbols, followers..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              {...register('notes')}
              rows={3}
              placeholder="Campaign notes, house rules..."
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" {...register('isActive')} />
              <span className="form-label" style={{ margin: 0 }}>Active (worshipped)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save God'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function GodDetail({
  god,
  onEdit,
  onDelete,
  onClose,
}: {
  god: God
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2 className="detail-name">{god.name}</h2>
          {god.primaryDomain && (
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
              {god.primaryDomain}
            </p>
          )}
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-section" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className={tierBadgeClass(god.tier)}>{god.tier}</span>
        <span className={`badge ${god.isActive ? 'badge-success' : 'badge-neutral'}`}>
          {god.isActive ? 'Active' : 'Lost'}
        </span>
      </div>

      {god.description && (
        <div className="detail-section">
          <span className="detail-label">Description</span>
          <p className="detail-notes">{god.description}</p>
        </div>
      )}

      {god.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-notes">{god.notes}</p>
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

export default function GodsPage() {
  const { data: gods = [], isLoading, isError } = useGods()
  const createGod = useCreateGod()
  const updateGod = useUpdateGod()
  const deleteGod = useDeleteGod()

  const [search, setSearch] = useState('')
  const [tierFilters, setTierFilters] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<God | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const selected = useMemo(() => gods.find(g => g.id === selectedId) ?? null, [gods, selectedId])

  const filtered = useMemo(() => {
    return gods.filter(g => {
      const matchSearch = !search ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.primaryDomain?.toLowerCase().includes(search.toLowerCase()) ||
        g.description?.toLowerCase().includes(search.toLowerCase())
      const matchTier = tierFilters.length === 0 || tierFilters.includes(g.tier)
      return matchSearch && matchTier
    })
  }, [gods, search, tierFilters])

  function toggleTier(tier: string) {
    if (tier === 'All') { setTierFilters([]); return }
    setTierFilters(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier])
  }

  function handleSave(data: CreateGodRequest) {
    if (editTarget) {
      updateGod.mutate({ id: editTarget.id, data }, {
        onSuccess: () => { setShowForm(false); setEditTarget(null) },
      })
    } else {
      createGod.mutate(data, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function openEdit(god: God) {
    setEditTarget(god)
    setShowForm(true)
    setSelectedId(null)
  }

  const confirmTarget = useMemo(() => gods.find(g => g.id === confirmDeleteId) ?? null, [gods, confirmDeleteId])

  return (
    <div className="page" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>

        <div className="page-header">
          <div>
            <h1>Gods</h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
              {gods.length} {gods.length === 1 ? 'deity' : 'deities'} recorded
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Add God
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search gods, domains, descriptions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="chip-row">
            <button
              className={`chip ${tierFilters.length === 0 ? 'chip-active' : ''}`}
              onClick={() => toggleTier('All')}
            >All</button>
            {TIERS.map(t => (
              <button
                key={t}
                className={`chip ${tierFilters.includes(t) ? 'chip-active' : ''}`}
                onClick={() => toggleTier(t)}
              >{t}</button>
            ))}
          </div>
        </div>

        {isLoading && <p style={{ color: 'var(--ink-muted)' }}>Loading gods…</p>}
        {isError && <p style={{ color: '#cf5b5b' }}>Failed to load gods.</p>}

        {!isLoading && !isError && (
          filtered.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✦</div>
                <p>{search || tierFilters.length > 0 ? 'No gods match your filters.' : 'No gods recorded yet.'}</p>
              </div>
            )
            : (
              <div className="card-grid">
                {filtered.map(god => (
                  <div
                    key={god.id}
                    className={`person-card${selectedId === god.id ? ' selected' : ''}`}
                    onClick={() => setSelectedId(selectedId === god.id ? null : god.id)}
                  >
                    <div className="card-portrait" style={{ width: 60, height: 60, fontSize: '1.4rem' }}>
                      <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
                        {god.name.charAt(0)}
                      </span>
                    </div>
                    <div className="card-name">{god.name}</div>
                    {god.primaryDomain && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: '6px', textAlign: 'center' }}>
                        {god.primaryDomain}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <span className={tierBadgeClass(god.tier)} style={{ fontSize: '0.7rem' }}>{god.tier}</span>
                      <span className={`badge ${god.isActive ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                        {god.isActive ? 'Active' : 'Lost'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}
      </div>

      {selected && (
        <GodDetail
          god={selected}
          onEdit={() => openEdit(selected)}
          onDelete={() => setConfirmDeleteId(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showForm && (
        <GodForm
          initial={editTarget ?? undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleSave}
          saving={createGod.isPending || updateGod.isPending}
        />
      )}

      {confirmTarget && (
        <ConfirmModal
          title="Delete God"
          message={`Delete ${confirmTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            deleteGod.mutate(confirmTarget.id, {
              onSuccess: () => { setSelectedId(null); setConfirmDeleteId(null) },
            })
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
