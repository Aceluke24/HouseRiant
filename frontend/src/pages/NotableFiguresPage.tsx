import { useEffect, useMemo, useRef, useState } from 'react'
import { useNotableFigures, useDeleteNotableFigure } from '../hooks/useNotableFigures'
import { usePersonGroups, useGroupMembers } from '../hooks/usePersonGroups'
import { notableFiguresApi } from '../api'
import NotableFigureDetail from '../components/notableFigures/NotableFigureDetail'
import NotableFigureForm from '../components/notableFigures/NotableFigureForm'
import ConfirmModal from '../components/ConfirmModal'
import type { NotableFigure } from '../types'

const RELATIONSHIP_FILTERS = ['All', 'Ally', 'Friend', 'Neutral', 'Foe', 'Vassal', 'Rival', 'Unknown']

type SortField = 'custom' | 'name' | 'family' | 'relationship' | 'faction' | 'location' | 'age'

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  return <span className="card-portrait-initials">{initials.toUpperCase()}</span>
}

function Portrait({ name, imageUrl, size = 80 }: { name: string; imageUrl?: string; size?: number }) {
  const cls = size > 50 ? 'card-portrait' : 'card-portrait card-portrait-sm'
  return (
    <div className={cls} style={{ width: size, height: size }}>
      {imageUrl
        ? <img src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:4000${imageUrl}`} alt={name} />
        : <Initials name={name} />
      }
    </div>
  )
}

function sortFigures(figures: NotableFigure[], sortBy: SortField): NotableFigure[] {
  if (sortBy === 'custom') return figures
  return [...figures].sort((a, b) => {
    switch (sortBy) {
      case 'name':         return a.name.localeCompare(b.name)
      case 'family':       return (a.familyName ?? 'zzz').localeCompare(b.familyName ?? 'zzz')
      case 'relationship': return (a.relationship ?? 'zzz').localeCompare(b.relationship ?? 'zzz')
      case 'faction':      return (a.faction ?? 'zzz').localeCompare(b.faction ?? 'zzz')
      case 'location':     return (a.location ?? 'zzz').localeCompare(b.location ?? 'zzz')
      case 'age':          return (a.age ?? 9999) - (b.age ?? 9999)
      default:             return 0
    }
  })
}

export default function NotableFiguresPage() {
  const [search, setSearch] = useState('')
  const [relFilters, setRelFilters] = useState<string[]>([])
  const [aliveFilters, setAliveFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortField>('custom')
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<NotableFigure | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // Drag state
  const [localOrder, setLocalOrder] = useState<NotableFigure[] | null>(null)
  const dragIdRef = useRef<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const { data: figures = [], isLoading } = useNotableFigures({ search: search || undefined })
  const { data: groups = [] } = usePersonGroups()
  const { data: groupMembers = [] } = useGroupMembers(activeGroupId)

  const groupMemberIds = useMemo(() => {
    if (activeGroupId == null) return null
    return new Set(groupMembers.map(m => m.notableFigureId).filter((id): id is number => id != null))
  }, [activeGroupId, groupMembers])

  const filteredFigures = useMemo(() => {
    let result = figures
    if (relFilters.length > 0) result = result.filter(f => f.relationship != null && relFilters.includes(f.relationship))
    if (aliveFilters.length === 1) {
      if (aliveFilters[0] === 'alive') result = result.filter(f => f.isAlive)
      else result = result.filter(f => !f.isAlive)
    }
    if (groupMemberIds != null) result = result.filter(f => groupMemberIds.has(f.id))
    return result
  }, [figures, relFilters, aliveFilters, groupMemberIds])

  // Derive selected from live data so the detail panel auto-updates after mutations
  const selected = selectedId != null ? (figures.find(f => f.id === selectedId) ?? null) : null

  const displayFigures = useMemo(() => {
    if (sortBy === 'custom' && localOrder != null) return localOrder
    return sortFigures(filteredFigures, sortBy)
  }, [filteredFigures, sortBy, localOrder])

  useEffect(() => {
    if (dragIdRef.current == null) setLocalOrder(null)
  }, [filteredFigures])

  useEffect(() => {
    if (selectedId == null) return
    if (!filteredFigures.some(f => f.id === selectedId)) setSelectedId(null)
  }, [filteredFigures, selectedId])

  const deleteFigure = useDeleteNotableFigure()

  const toggleRelFilter = (rel: string) => {
    if (rel === 'All') { setRelFilters([]); return }
    setRelFilters(prev => prev.includes(rel) ? prev.filter(r => r !== rel) : [...prev, rel])
  }
  const isRelActive = (rel: string) => rel === 'All' ? relFilters.length === 0 : relFilters.includes(rel)

  const handleEdit = (f: NotableFigure) => { setEditTarget(f); setShowForm(true) }
  const handleDelete = (id: number) => setConfirmDeleteId(id)
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteFigure.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }
  const handleFormClose = () => { setShowForm(false); setEditTarget(undefined) }

  // ── Drag-to-reorder ──────────────────────────────────────────────────────────
  const isDraggable = sortBy === 'custom' && !search && relFilters.length === 0 && aliveFilters.length === 0 && activeGroupId == null

  const handleDragStart = (e: React.DragEvent, id: number) => {
    if (!isDraggable) { e.preventDefault(); return }
    dragIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
    setLocalOrder(prev => prev ?? [...filteredFigures])
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    if (!isDraggable || dragIdRef.current == null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
    if (dragIdRef.current === id) return
    setLocalOrder(prev => {
      const list = prev ?? [...filteredFigures]
      const from = list.findIndex(f => f.id === dragIdRef.current)
      const to = list.findIndex(f => f.id === id)
      if (from === -1 || to === -1) return list
      const next = [...list]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverId(null)
    dragIdRef.current = null
    if (!localOrder) return
    const items = localOrder.map((f, i) => ({ id: f.id, sortOrder: i }))
    try {
      await notableFiguresApi.reorder(items)
    } catch {
      setReorderError('Failed to save order. Please try again.')
      setLocalOrder(null)
    }
  }

  const handleDragEnd = () => {
    setDragOverId(null)
    if (dragIdRef.current != null) {
      dragIdRef.current = null
      setLocalOrder(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notable Figures</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Figure</button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, role, location, faction..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-chips">
          {RELATIONSHIP_FILTERS.map(r => (
            <button key={r} className={`chip ${isRelActive(r) ? 'chip-active' : ''}`} onClick={() => toggleRelFilter(r)}>
              {r}
            </button>
          ))}

          <span className="filter-sep">|</span>

          <button
            className={`chip ${aliveFilters.length === 0 ? 'chip-active' : ''}`}
            onClick={() => setAliveFilters([])}
          >
            All
          </button>
          <button
            className={`chip ${aliveFilters.includes('alive') ? 'chip-active' : ''}`}
            onClick={() => setAliveFilters(prev => prev.includes('alive') ? prev.filter(x => x !== 'alive') : [...prev, 'alive'])}
          >
            Alive
          </button>
          <button
            className={`chip ${aliveFilters.includes('deceased') ? 'chip-active' : ''}`}
            onClick={() => setAliveFilters(prev => prev.includes('deceased') ? prev.filter(x => x !== 'deceased') : [...prev, 'deceased'])}
          >
            Deceased
          </button>

          {groups.length > 0 && (
            <>
              <span className="filter-sep">|</span>
              {groups.map(g => (
                <button
                  key={g.id}
                  className={`chip ${activeGroupId === g.id ? 'chip-active' : ''}`}
                  style={activeGroupId === g.id ? { borderColor: g.color ?? undefined, color: g.color ?? undefined } : {}}
                  onClick={() => setActiveGroupId(prev => prev === g.id ? null : g.id)}
                >
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: g.color ?? 'var(--ink-muted)', marginRight: 5, verticalAlign: 'middle' }} />
                  {g.name}
                </button>
              ))}
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="form-select"
            style={{ fontSize: 12, padding: '4px 8px', height: 30 }}
            value={sortBy}
            onChange={e => { setSortBy(e.target.value as SortField); setLocalOrder(null) }}
          >
            <option value="custom">Sort: Custom Order</option>
            <option value="name">Sort: Name</option>
            <option value="family">Sort: Family</option>
            <option value="relationship">Sort: Relationship</option>
            <option value="faction">Sort: Faction</option>
            <option value="location">Sort: Location</option>
            <option value="age">Sort: Age</option>
          </select>
          <div className="view-toggle">
            <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')} title="Table view">☰</button>
            <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Card view">⊞</button>
          </div>
          <span className="filter-count">{displayFigures.length} records</span>
        </div>
      </div>

      {reorderError && (
        <div style={{ padding: '8px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
          {reorderError} <button className="btn-ghost" style={{ fontSize: 11, marginLeft: 8 }} onClick={() => setReorderError(null)}>✕</button>
        </div>
      )}

      {isDraggable && view === 'table' && (
        <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 8, fontStyle: 'italic' }}>
          ⠿ Drag rows to reorder. Order is saved automatically.
        </p>
      )}

      {isLoading ? (
        <div className="loading">Loading the records...</div>
      ) : view === 'table' ? (
        <div className="list-layout">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {isDraggable && <th style={{ width: 28 }} title="Drag to reorder"></th>}
                  <th></th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Relationship</th>
                  <th>Role</th>
                  <th>Family</th>
                  <th>Faction</th>
                  <th>Location</th>
                  <th>Race</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                {displayFigures.map(f => {
                  const isDragTarget = dragOverId === f.id && dragIdRef.current !== f.id
                  return (
                    <tr
                      key={f.id}
                      className={`${selected?.id === f.id ? 'row-selected' : ''} ${isDragTarget ? 'row-drag-over' : ''}`}
                      draggable={isDraggable}
                      onDragStart={e => handleDragStart(e, f.id)}
                      onDragOver={e => handleDragOver(e, f.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedId(f.id)}
                      style={{ opacity: dragIdRef.current === f.id ? 0.5 : 1 }}
                    >
                      {isDraggable && (
                        <td style={{ width: 28, textAlign: 'center', cursor: 'grab', color: 'var(--ink-muted)', fontSize: 16 }}
                          title="Drag to reorder">
                          ⠿
                        </td>
                      )}
                      <td style={{ width: 40, padding: '6px 8px' }}>
                        <Portrait name={f.name} imageUrl={f.imageUrl} size={32} />
                      </td>
                      <td className="name-cell">{f.name}</td>
                      <td style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>{f.title ?? '—'}</td>
                      <td>
                        {f.relationship
                          ? <span className={`badge badge-rel-${f.relationship.toLowerCase()}`}>{f.relationship}</span>
                          : '—'
                        }
                      </td>
                      <td>{f.role ?? '—'}</td>
                      <td>{f.familyName ?? '—'}</td>
                      <td>{f.faction ?? '—'}</td>
                      <td>{f.location ?? '—'}</td>
                      <td>{f.race ?? '—'}</td>
                      <td>{f.age ?? '—'}</td>
                      <td>
                        <span className={`badge ${f.isAlive ? 'badge-alive' : 'badge-deceased'}`}>
                          {f.isAlive ? 'Alive' : 'Deceased'}
                        </span>
                      </td>
                      <td className="actions-cell" onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" title="Edit" onClick={() => handleEdit(f)}>✏</button>
                        <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(f.id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
                {displayFigures.length === 0 && (
                  <tr><td colSpan={13} className="empty-row">No notable figures found in the records.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <NotableFigureDetail
              figure={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div className="cards-grid" style={{ flex: 1 }}>
            {displayFigures.map(f => (
              <div
                key={f.id}
                className={`person-card ${selected?.id === f.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(f.id)}
              >
                <Portrait name={f.name} imageUrl={f.imageUrl} size={80} />
                <div className="card-name">{f.name}</div>
                {f.title && <div className="card-title">{f.title}</div>}
                <div className="card-role">{f.role ?? '—'}</div>
                {f.familyName && <div className="card-family">{f.familyName}</div>}
                {f.faction && <div className="card-family">{f.faction}</div>}
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {f.relationship && (
                    <span className={`badge badge-rel-${f.relationship.toLowerCase()}`}>{f.relationship}</span>
                  )}
                  <span className={`badge ${f.isAlive ? 'badge-alive' : 'badge-deceased'}`}>
                    {f.isAlive ? 'Alive' : 'Deceased'}
                  </span>
                </div>
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleEdit(f)}>✏</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(f.id)}>✕</button>
                </div>
              </div>
            ))}
            {displayFigures.length === 0 && (
              <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>No notable figures found.</p>
            )}
          </div>
          {selected && (
            <NotableFigureDetail
              figure={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}

      {showForm && <NotableFigureForm figure={editTarget} onClose={handleFormClose} />}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Remove Notable Figure"
          message="Remove this figure from the records? This cannot be undone."
          confirmLabel="Remove"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
