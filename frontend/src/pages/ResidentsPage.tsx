import { useEffect, useMemo, useRef, useState } from 'react'
import { useResidents, useDeleteResident } from '../hooks/useResidents'
import { useDebounce } from '../utils/useDebounce'
import { usePersonGroups, useGroupMembers } from '../hooks/usePersonGroups'
import { residentsApi } from '../api'
import ResidentForm from '../components/residents/ResidentForm'
import ResidentDetail from '../components/residents/ResidentDetail'
import ConfirmModal from '../components/ConfirmModal'
import { useFocus } from '../context/FocusContext'
import type { Resident } from '../types'

const STATUS_FILTERS = ['All', 'Resident', 'HiredHelp', 'Visitor', 'Seasonal', 'Din', 'Other']
const STATUS_LABELS: Record<string, string> = { HiredHelp: 'Hired Help' }

type SortField = 'custom' | 'name' | 'family' | 'race' | 'age' | 'status'

function getRaceDisplay(resident: Resident): string {
  if (!resident.race) return '—'
  if (resident.race === 'Krell' && resident.krellTribe) {
    return `${resident.race} (${resident.krellTribe})`
  }
  return resident.race
}

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
        ? <img src={imageUrl?.startsWith('http') ? imageUrl : `http://localhost:4000${imageUrl}`} alt={name} />
        : <Initials name={name} />
      }
    </div>
  )
}

function sortResidents(residents: Resident[], sortBy: SortField): Resident[] {
  if (sortBy === 'custom') return residents // already ordered by sortOrder from API
  return [...residents].sort((a, b) => {
    switch (sortBy) {
      case 'name':   return a.name.localeCompare(b.name)
      case 'family': return (a.familyName ?? 'zzz').localeCompare(b.familyName ?? 'zzz')
      case 'race':   return (a.race ?? 'zzz').localeCompare(b.race ?? 'zzz')
      case 'status': return a.status.localeCompare(b.status)
      case 'age':    return (a.age ?? 9999) - (b.age ?? 9999)
      default:       return 0
    }
  })
}

export default function ResidentsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortField>('custom')
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Resident | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  // Drag state
  const [localOrder, setLocalOrder] = useState<Resident[] | null>(null)
  const dragIdRef = useRef<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const { toggleFocus, isInFocus } = useFocus()

  const { data: residents = [], isLoading } = useResidents({ search: debouncedSearch || undefined })
  const { data: groups = [] } = usePersonGroups()
  const { data: groupMembers = [] } = useGroupMembers(activeGroupId)

  // Set of resident IDs in the active group (null = no filter)
  const groupMemberIds = useMemo(() => {
    if (activeGroupId == null) return null
    return new Set(groupMembers.map(m => m.residentId).filter((id): id is number => id != null))
  }, [activeGroupId, groupMembers])

  // Groups that have at least one resident member — shown as filter chips
  const residentGroups = useMemo(() => {
    // We can't know membership counts per type without fetching all members,
    // so show all groups as chips; selecting one that has no residents just shows empty.
    return groups
  }, [groups])

  const filteredResidents = useMemo(() => {
    let result = residents
    if (statusFilters.length > 0) result = result.filter(r => statusFilters.includes(r.status))
    if (groupMemberIds != null) result = result.filter(r => groupMemberIds.has(r.id))
    return result
  }, [residents, statusFilters, groupMemberIds])

  // Derive selected from live data so the detail panel auto-updates after mutations
  const selected = selectedId != null ? (residents.find(r => r.id === selectedId) ?? null) : null

  // Apply client-side sort
  const displayResidents = useMemo(() => {
    // Use localOrder for drag preview when sorting by custom and no filters
    if (sortBy === 'custom' && localOrder != null) return localOrder
    return sortResidents(filteredResidents, sortBy)
  }, [filteredResidents, sortBy, localOrder])

  // Keep localOrder in sync with incoming data, but only when not mid-drag
  useEffect(() => {
    if (dragIdRef.current == null) setLocalOrder(null)
  }, [filteredResidents])

  useEffect(() => {
    if (selectedId == null) return
    if (!filteredResidents.some(r => r.id === selectedId)) setSelectedId(null)
  }, [filteredResidents, selectedId])

  const deleteResident = useDeleteResident()

  const toggleStatusFilter = (status: string) => {
    if (status === 'All') { setStatusFilters([]); return }
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
  }
  const isStatusActive = (status: string) => status === 'All' ? statusFilters.length === 0 : statusFilters.includes(status)

  const handleEdit = (r: Resident) => { setEditTarget(r); setShowForm(true) }
  const handleDelete = (id: number) => setConfirmDeleteId(id)
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteResident.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }
  const handleFormClose = () => { setShowForm(false); setEditTarget(undefined) }
  const handleFocusToggle = (e: React.MouseEvent, r: Resident) => {
    e.stopPropagation()
    toggleFocus({ id: r.id, type: 'resident', name: r.name })
  }

  // ── Drag-to-reorder (only active when sortBy=custom and no search/status/group filters) ──
  const isDraggable = sortBy === 'custom' && !search && statusFilters.length === 0 && activeGroupId == null

  const handleDragStart = (e: React.DragEvent, id: number) => {
    if (!isDraggable) { e.preventDefault(); return }
    dragIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
    // Initialize localOrder from current displayResidents if needed
    setLocalOrder(prev => prev ?? [...filteredResidents])
  }

  const handleDragOver = (e: React.DragEvent, id: number) => {
    if (!isDraggable || dragIdRef.current == null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
    if (dragIdRef.current === id) return
    setLocalOrder(prev => {
      const list = prev ?? [...filteredResidents]
      const from = list.findIndex(r => r.id === dragIdRef.current)
      const to = list.findIndex(r => r.id === id)
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
    const items = localOrder.map((r, i) => ({ id: r.id, sortOrder: i }))
    try {
      await residentsApi.reorder(items)
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
        <h1>Residents</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Resident</button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, role, race, skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-chips">
          {STATUS_FILTERS.map(f => (
            <button key={f} className={`chip ${isStatusActive(f) ? 'chip-active' : ''}`} onClick={() => toggleStatusFilter(f)}>
              {STATUS_LABELS[f] ?? f}
            </button>
          ))}
          {residentGroups.length > 0 && (
            <>
              <span className="filter-sep">|</span>
              {residentGroups.map(g => (
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
            <option value="race">Sort: Race</option>
            <option value="age">Sort: Age</option>
            <option value="status">Sort: Status</option>
          </select>
          <div className="view-toggle">
            <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')} title="Table view">☰</button>
            <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Card view">⊞</button>
          </div>
          <span className="filter-count">{displayResidents.length} records</span>
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
        <div className="loading">Loading the rolls...</div>
      ) : view === 'table' ? (
        <div className="list-layout">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {isDraggable && <th style={{ width: 28 }} title="Drag to reorder"></th>}
                  <th style={{ width: 36 }} title="Add to Focus View"></th>
                  <th></th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Estate Status</th>
                  <th>Role</th>
                  <th>Family</th>
                  <th>Race</th>
                  <th>Age</th>
                  <th>Pay/Day</th>
                  <th>Land</th>
                  <th></th>
                </tr>
              </thead>
              <tbody onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                {displayResidents.map(r => {
                  const focused = isInFocus(r.id, 'resident')
                  const isDragTarget = dragOverId === r.id && dragIdRef.current !== r.id
                  return (
                    <tr
                      key={r.id}
                      className={`${selected?.id === r.id ? 'row-selected' : ''} ${focused ? 'row-focused' : ''} ${isDragTarget ? 'row-drag-over' : ''}`}
                      draggable={isDraggable}
                      onDragStart={e => handleDragStart(e, r.id)}
                      onDragOver={e => handleDragOver(e, r.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedId(r.id)}
                      style={{ opacity: dragIdRef.current === r.id ? 0.5 : 1 }}
                    >
                      {isDraggable && (
                        <td style={{ width: 28, textAlign: 'center', cursor: 'grab', color: 'var(--ink-muted)', fontSize: 16 }}
                          title="Drag to reorder">
                          ⠿
                        </td>
                      )}
                      <td
                        style={{ width: 36, textAlign: 'center', padding: '6px 4px' }}
                        onClick={e => handleFocusToggle(e, r)}
                      >
                        <span className={`focus-checkbox ${focused ? 'focus-checkbox-active' : ''}`}
                          title={focused ? 'Remove from Focus View' : 'Add to Focus View'}>
                          {focused ? '🎯' : '○'}
                        </span>
                      </td>
                      <td style={{ width: 40, padding: '6px 8px' }}>
                        <Portrait name={r.name} imageUrl={r.imageUrl} size={32} />
                      </td>
                      <td className="name-cell">{r.name}</td>
                      <td style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>{r.title ?? '—'}</td>
                      <td>
                        <span className={`badge badge-${r.status.toLowerCase()}`}>
                          {r.status === 'Other' && r.statusOther ? r.statusOther : (STATUS_LABELS[r.status] ?? r.status)}
                        </span>
                      </td>
                      <td>{r.role}</td>
                      <td>{r.familyName ?? '—'}</td>
                      <td>{getRaceDisplay(r)}</td>
                      <td>{r.age ?? '—'}</td>
                      <td>{r.dailyPayRate != null ? `${r.dailyPayRate} tin` : '—'}</td>
                      <td>{r.landOwned ?? '—'}</td>
                      <td className="actions-cell" onClick={e => e.stopPropagation()}>
                        <button className="btn-icon" title="Edit" onClick={() => handleEdit(r)}>✏</button>
                        <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(r.id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
                {displayResidents.length === 0 && (
                  <tr><td colSpan={13} className="empty-row">No residents found in the rolls.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <ResidentDetail
              resident={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div className="cards-grid" style={{ flex: 1 }}>
            {displayResidents.map(r => {
              const focused = isInFocus(r.id, 'resident')
              return (
                <div
                  key={r.id}
                  className={`person-card ${selected?.id === r.id ? 'selected' : ''} ${focused ? 'person-card-focused' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <button
                    className={`card-focus-btn ${focused ? 'card-focus-btn-active' : ''}`}
                    onClick={e => handleFocusToggle(e, r)}
                    title={focused ? 'Remove from Focus View' : 'Add to Focus View'}
                  >
                    {focused ? '🎯' : '○'}
                  </button>
                  <Portrait name={r.name} imageUrl={r.imageUrl} size={80} />
                  <div className="card-name">{r.name}</div>
                  {r.title && <div className="card-title">{r.title}</div>}
                  <div className="card-role">{r.role}</div>
                  <div className="card-family">{getRaceDisplay(r)}</div>
                  {r.familyName && <div className="card-family">{r.familyName}</div>}
                  <span className={`badge badge-${r.status.toLowerCase()}`} style={{ marginTop: 4 }}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" onClick={() => handleEdit(r)}>✏</button>
                    <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(r.id)}>✕</button>
                  </div>
                </div>
              )
            })}
            {displayResidents.length === 0 && (
              <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>No residents found.</p>
            )}
          </div>
          {selected && (
            <ResidentDetail
              resident={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}

      {showForm && <ResidentForm resident={editTarget} onClose={handleFormClose} />}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Remove Resident"
          message="Remove this resident from the records? This cannot be undone."
          confirmLabel="Remove"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
