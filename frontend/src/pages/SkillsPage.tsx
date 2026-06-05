import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '../hooks/useSkills'
import ConfirmModal from '../components/ConfirmModal'
import type { Skill, CreateSkillRequest } from '../types'

const CATEGORIES = ['Arcane', 'Communication', 'Knowledge', 'Military and Survival', 'Physical', 'Trade'] as const

type TrainedFilter = 'all' | 'trained' | 'untrained'

// ── Form modal ─────────────────────────────────────────────────────────────────

interface SkillFormProps {
  initial?: Skill
  onClose: () => void
  onSave: (data: CreateSkillRequest) => void
  saving: boolean
}

function SkillForm({ initial, onClose, onSave, saving }: SkillFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateSkillRequest>({
    defaultValues: initial
      ? {
          name: initial.name,
          category: initial.category,
          trained: initial.trained,
          xpCost: initial.xpCost,
          coreAttribute: initial.coreAttribute ?? '',
          description: initial.description ?? '',
          notes: initial.notes ?? '',
        }
      : { category: 'Knowledge', trained: false, xpCost: 0 },
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Skill' : 'Add Skill'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="modal-form">

          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Stealth"
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" {...register('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Core Attribute</label>
              <input
                className="form-input"
                {...register('coreAttribute')}
                placeholder="e.g. Agility"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">XP Cost</label>
              <input
                className="form-input"
                type="number"
                min={0}
                {...register('xpCost', { valueAsNumber: true })}
              />
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingTop: '24px' }}>
                <input type="checkbox" {...register('trained')} />
                <span className="form-label" style={{ margin: 0 }}>Trained only</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              {...register('description')}
              rows={3}
              placeholder="What this skill does..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              {...register('notes')}
              rows={2}
              placeholder="House rules, special cases..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function SkillDetail({
  skill,
  onEdit,
  onDelete,
  onClose,
}: {
  skill: Skill
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2 className="detail-name">{skill.name}</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginTop: '2px' }}>{skill.category}</p>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-section" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span className={`badge ${skill.trained ? 'badge-success' : 'badge-neutral'}`}>
          {skill.trained ? 'Trained' : 'Untrained'}
        </span>
        <span className="badge badge-info">{skill.xpCost} XP</span>
        {skill.coreAttribute && (
          <span className="badge badge-neutral">{skill.coreAttribute}</span>
        )}
      </div>

      <div className="detail-section">
        <div className="detail-grid">
          <div className="detail-field">
            <span className="detail-label">Category</span>
            <span className="detail-value">{skill.category}</span>
          </div>
          <div className="detail-field">
            <span className="detail-label">XP Cost</span>
            <span className="detail-value">{skill.xpCost}</span>
          </div>
          {skill.coreAttribute && (
            <div className="detail-field">
              <span className="detail-label">Core Attribute</span>
              <span className="detail-value">{skill.coreAttribute}</span>
            </div>
          )}
        </div>
      </div>

      {skill.description && (
        <div className="detail-section">
          <span className="detail-label">Description</span>
          <p className="detail-notes">{skill.description}</p>
        </div>
      )}

      {skill.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-notes">{skill.notes}</p>
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

export default function SkillsPage() {
  const { data: skills = [], isLoading, isError } = useSkills()
  const createSkill = useCreateSkill()
  const updateSkill = useUpdateSkill()
  const deleteSkill = useDeleteSkill()

  const [search, setSearch] = useState('')
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [trainedFilter, setTrainedFilter] = useState<TrainedFilter>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Skill | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const selected = useMemo(() => skills.find(s => s.id === selectedId) ?? null, [skills, selectedId])

  const filtered = useMemo(() => {
    return skills.filter(s => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        s.coreAttribute?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilters.length === 0 || categoryFilters.includes(s.category)
      const matchTrained =
        trainedFilter === 'all' ||
        (trainedFilter === 'trained' && s.trained) ||
        (trainedFilter === 'untrained' && !s.trained)
      return matchSearch && matchCategory && matchTrained
    })
  }, [skills, search, categoryFilters, trainedFilter])

  function toggleCategory(cat: string) {
    if (cat === 'All') { setCategoryFilters([]); return }
    setCategoryFilters(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  function handleSave(data: CreateSkillRequest) {
    if (editTarget) {
      updateSkill.mutate({ id: editTarget.id, data }, {
        onSuccess: () => { setShowForm(false); setEditTarget(null) },
      })
    } else {
      createSkill.mutate(data, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function openEdit(skill: Skill) {
    setEditTarget(skill)
    setShowForm(true)
    setSelectedId(null)
  }

  const confirmTarget = useMemo(() => skills.find(s => s.id === confirmDeleteId) ?? null, [skills, confirmDeleteId])

  return (
    <div className="page" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>

        <div className="page-header">
          <div>
            <h1>Skills</h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
              {skills.length} {skills.length === 1 ? 'skill' : 'skills'} available
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Add Skill
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search skills, attributes, categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="chip-row">
            <button
              className={`chip ${categoryFilters.length === 0 ? 'chip-active' : ''}`}
              onClick={() => toggleCategory('All')}
            >All</button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`chip ${categoryFilters.includes(c) ? 'chip-active' : ''}`}
                onClick={() => toggleCategory(c)}
              >{c}</button>
            ))}
          </div>
          <div className="chip-row">
            {(['all', 'trained', 'untrained'] as TrainedFilter[]).map(v => (
              <button
                key={v}
                className={`chip ${trainedFilter === v ? 'chip-active' : ''}`}
                onClick={() => setTrainedFilter(v)}
              >
                {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p style={{ color: 'var(--ink-muted)' }}>Loading skills…</p>}
        {isError && <p style={{ color: '#cf5b5b' }}>Failed to load skills.</p>}

        {!isLoading && !isError && (
          filtered.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📚</div>
                <p>{search || categoryFilters.length > 0 || trainedFilter !== 'all' ? 'No skills match your filters.' : 'No skills recorded yet.'}</p>
              </div>
            )
            : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Category</th>
                    <th>Training</th>
                    <th>XP Cost</th>
                    <th>Core Attribute</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(skill => (
                    <tr
                      key={skill.id}
                      onClick={() => setSelectedId(selectedId === skill.id ? null : skill.id)}
                      style={{ cursor: 'pointer' }}
                      className={selectedId === skill.id ? 'row-selected' : ''}
                    >
                      <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{skill.name}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{skill.category}</td>
                      <td>
                        <span className={`badge ${skill.trained ? 'badge-success' : 'badge-neutral'}`}>
                          {skill.trained ? 'Trained' : 'Untrained'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>{skill.xpCost}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{skill.coreAttribute || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>

      {selected && (
        <SkillDetail
          skill={selected}
          onEdit={() => openEdit(selected)}
          onDelete={() => setConfirmDeleteId(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showForm && (
        <SkillForm
          initial={editTarget ?? undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleSave}
          saving={createSkill.isPending || updateSkill.isPending}
        />
      )}

      {confirmTarget && (
        <ConfirmModal
          title="Delete Skill"
          message={`Delete ${confirmTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            deleteSkill.mutate(confirmTarget.id, {
              onSuccess: () => { setSelectedId(null); setConfirmDeleteId(null) },
            })
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
