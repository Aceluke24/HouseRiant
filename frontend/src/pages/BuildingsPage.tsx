import { useState } from 'react'
import { useBuildings, useDeleteBuilding } from '../hooks/useBuildings'
import type { BuildingType, BuildingCondition } from '../types'
import BuildingForm from '../components/buildings/BuildingForm'
import BuildingDetail from '../components/buildings/BuildingDetail'
import ConfirmModal from '../components/ConfirmModal'

const BUILDING_TYPES: BuildingType[] = ['Living', 'Storage', 'Defense', 'Agricultural', 'Workshop', 'Religious', 'Other']
const BUILDING_CONDITIONS: BuildingCondition[] = ['Ruined', 'Poor', 'Functional', 'Good', 'Excellent']

const TYPE_COLORS: Record<string, string> = {
  Living: '#1a3f7a',
  Storage: '#5a4a2a',
  Defense: '#6a1a1a',
  Agricultural: '#2a5a1a',
  Workshop: '#4a3a6a',
  Religious: '#1a5a5a',
  Other: '#4a4a4a',
}

const CONDITION_COLORS: Record<string, string> = {
  Ruined: '#8b1a1a',
  Poor: '#b85c00',
  Functional: '#7a90aa',
  Good: '#2a7a2a',
  Excellent: '#c8a020',
}

export default function BuildingsPage() {
  const { data: buildings = [], isLoading } = useBuildings()
  const deleteBuilding = useDeleteBuilding()

  const [search, setSearch] = useState('')
  const [typeFilters, setTypeFilters] = useState<BuildingType[]>([])
  const [conditionFilters, setConditionFilters] = useState<BuildingCondition[]>([])
  // Store id only — derive the full object from live data so detail panel stays in sync after mutations
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTargetId, setEditTargetId] = useState<number | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const selectedBuilding = selectedId != null ? (buildings.find(b => b.id === selectedId) ?? null) : null
  const editTarget = editTargetId != null ? buildings.find(b => b.id === editTargetId) : undefined

  function toggleType(t: BuildingType) {
    setTypeFilters(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function toggleCondition(c: BuildingCondition) {
    setConditionFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const filtered = buildings.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q)
    const matchType = typeFilters.length === 0 || typeFilters.includes(b.type)
    const matchCondition = conditionFilters.length === 0 || conditionFilters.includes(b.condition)
    return matchSearch && matchType && matchCondition
  })

  function handleEdit(id: number) {
    setEditTargetId(id)
    setShowForm(true)
  }

  function handleDelete(id: number) {
    setConfirmDeleteId(id)
  }

  async function handleConfirmDelete() {
    if (confirmDeleteId == null) return
    await deleteBuilding.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditTargetId(undefined)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Buildings</h1>
        <button
          className="btn-primary"
          onClick={() => { setEditTargetId(undefined); setShowForm(true) }}
        >
          + Add Building
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search buildings…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="filter-chips">
          <button
            className={typeFilters.length === 0 ? 'chip chip-active' : 'chip'}
            onClick={() => setTypeFilters([])}
          >
            All
          </button>
          {BUILDING_TYPES.map(t => (
            <button
              key={t}
              className={typeFilters.includes(t) ? 'chip chip-active' : 'chip'}
              onClick={() => toggleType(t)}
              style={typeFilters.includes(t) ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] } : undefined}
            >
              {t}
            </button>
          ))}

          <span className="filter-sep">|</span>

          <button
            className={conditionFilters.length === 0 ? 'chip chip-active' : 'chip'}
            onClick={() => setConditionFilters([])}
          >
            All
          </button>
          {BUILDING_CONDITIONS.map(c => (
            <button
              key={c}
              className={conditionFilters.includes(c) ? 'chip chip-active' : 'chip'}
              onClick={() => toggleCondition(c)}
              style={conditionFilters.includes(c) ? { borderColor: CONDITION_COLORS[c], color: CONDITION_COLORS[c] } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading && <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>Loading…</p>}

          {!isLoading && filtered.length === 0 && (
            <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
              {buildings.length === 0 ? 'No buildings yet. Add one to get started.' : 'No buildings match your filters.'}
            </p>
          )}

          <div className="cards-grid">
            {filtered.map(b => {
              const residentCount = b.residents?.length ?? 0
              const capacity = b.capacityPersons
              const isFull = capacity != null && residentCount >= capacity
              const capacityPct = capacity != null && capacity > 0 ? Math.min(residentCount / capacity, 1) : null

              return (
                <div
                  key={b.id}
                  className={`person-card${selectedId === b.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(b.id)}
                  style={{ padding: 0, overflow: 'hidden' }}
                >
                  {/* Building image */}
                  {b.imageUrl && (
                    <div style={{ width: '100%', height: 120, overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={`http://localhost:4000${b.imageUrl}`}
                        alt={b.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: b.imagePosition || 'center' }}
                      />
                    </div>
                  )}

                  {/* Card body */}
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--ink)', margin: 0, fontSize: '1rem' }}>{b.name}</h3>
                    </div>

                    {/* Badges row */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: TYPE_COLORS[b.type] ?? '#4a4a4a',
                        color: '#f7f2e8',
                        padding: '0.1rem 0.55rem',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}>
                        {b.type}
                      </span>
                      <span style={{
                        border: `1px solid ${CONDITION_COLORS[b.condition] ?? '#7a90aa'}`,
                        color: CONDITION_COLORS[b.condition] ?? '#7a90aa',
                        padding: '0.1rem 0.55rem',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}>
                        {b.condition}
                      </span>
                      {b.isLivable && (
                        <span style={{
                          border: '1px solid var(--gold)',
                          color: 'var(--gold)',
                          padding: '0.1rem 0.55rem',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.7rem',
                          letterSpacing: '0.05em',
                        }}>
                          Livable
                        </span>
                      )}
                      {isFull && (
                        <span style={{
                          background: '#8b1a1a',
                          color: '#f7f2e8',
                          padding: '0.1rem 0.55rem',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.7rem',
                          letterSpacing: '0.05em',
                        }}>
                          Full
                        </span>
                      )}
                    </div>

                    {/* Capacity bar + info */}
                    {capacity != null && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: isFull ? '#8b1a1a' : 'var(--ink-muted)' }}>
                            👥 {residentCount} / {capacity}
                          </span>
                          {b.storageCapacityLbs != null && (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                              📦 {b.storageCapacityLbs.toLocaleString()} lbs
                            </span>
                          )}
                        </div>
                        {capacityPct != null && (
                          <div style={{ height: 3, background: 'var(--blue-pale, #e8eef7)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${capacityPct * 100}%`,
                              background: isFull ? '#8b1a1a' : 'var(--gold)',
                              borderRadius: 2,
                            }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Resident avatars */}
                    {b.residents && b.residents.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        {b.residents.slice(0, 6).map(r => (
                          <div key={r.id} title={r.name} style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'var(--blue-royal)',
                            border: '1px solid var(--gold)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {r.imageUrl
                              ? <img src={`http://localhost:4000${r.imageUrl}`} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ color: '#f7f2e8', fontFamily: 'Cinzel, serif', fontSize: '0.55rem' }}>
                                  {r.name.charAt(0).toUpperCase()}
                                </span>
                            }
                          </div>
                        ))}
                        {b.residents.length > 6 && (
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'var(--ink-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-body)', fontSize: '0.6rem', color: '#f7f2e8',
                          }}>
                            +{b.residents.length - 6}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tasks preview */}
                    {b.tasks && b.tasks.length > 0 && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: 'var(--ink-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                          TASKS
                        </div>
                        {b.tasks.slice(0, 2).map(t => (
                          <div key={t.id} style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--ink)', lineHeight: 1.4 }}>
                            • {t.name}
                          </div>
                        ))}
                        {b.tasks.length > 2 && (
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                            +{b.tasks.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedBuilding && (
          <BuildingDetail
            building={selectedBuilding}
            onEdit={() => handleEdit(selectedBuilding.id)}
            onDelete={() => handleDelete(selectedBuilding.id)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      {showForm && (
        <BuildingForm
          building={editTarget}
          onClose={handleFormClose}
        />
      )}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Delete Building"
          message="Delete this building? This cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
