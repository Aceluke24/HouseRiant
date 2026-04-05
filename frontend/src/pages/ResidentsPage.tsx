import { useEffect, useMemo, useState } from 'react'
import { useResidents, useDeleteResident } from '../hooks/useResidents'
import ResidentForm from '../components/residents/ResidentForm'
import ResidentDetail from '../components/residents/ResidentDetail'
import type { Resident } from '../types'

const STATUS_FILTERS = ['All', 'Resident', 'HiredHelp', 'Visitor', 'Seasonal', 'Din', 'Other']
const STATUS_LABELS: Record<string, string> = { HiredHelp: 'Hired Help' }

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

export default function ResidentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [selected, setSelected] = useState<Resident | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Resident | undefined>()

  const { data: residents = [], isLoading } = useResidents({
    search: search || undefined,
  })

  const filteredResidents = useMemo(() => {
    if (statusFilters.length === 0) return residents
    return residents.filter((r) => statusFilters.includes(r.status))
  }, [residents, statusFilters])

  useEffect(() => {
    if (!selected) return
    if (!filteredResidents.some((r) => r.id === selected.id)) {
      setSelected(null)
    }
  }, [filteredResidents, selected])

  const deleteResident = useDeleteResident()

  const toggleStatusFilter = (status: string) => {
    if (status === 'All') {
      setStatusFilters([])
      return
    }
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  const isStatusActive = (status: string) => (
    status === 'All' ? statusFilters.length === 0 : statusFilters.includes(status)
  )

  const handleEdit = (r: Resident) => { setEditTarget(r); setShowForm(true) }
  const handleDelete = async (id: number) => {
    if (confirm('Remove this resident from the records?')) {
      await deleteResident.mutateAsync(id)
      if (selected?.id === id) setSelected(null)
    }
  }
  const handleFormClose = () => { setShowForm(false); setEditTarget(undefined) }

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
            <button
              key={f}
              className={`chip ${isStatusActive(f) ? 'chip-active' : ''}`}
              onClick={() => toggleStatusFilter(f)}
            >
              {STATUS_LABELS[f] ?? f}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')} title="Table view">☰</button>
          <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Card view">⊞</button>
        </div>
        <span className="filter-count">{filteredResidents.length} records</span>
      </div>

      {isLoading ? (
        <div className="loading">Loading the rolls...</div>
      ) : view === 'table' ? (
        <div className="list-layout">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Family</th>
                  <th>Race</th>
                  <th>Age</th>
                  <th>Pay/Day</th>
                  <th>Land</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map(r => (
                  <tr
                    key={r.id}
                    className={selected?.id === r.id ? 'row-selected' : ''}
                    onClick={() => setSelected(r)}
                  >
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
                ))}
                {filteredResidents.length === 0 && (
                  <tr><td colSpan={11} className="empty-row">No residents found in the rolls.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <ResidentDetail
              resident={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div className="cards-grid" style={{ flex: 1 }}>
            {filteredResidents.map(r => (
              <div
                key={r.id}
                className={`person-card ${selected?.id === r.id ? 'selected' : ''}`}
                onClick={() => setSelected(r)}
              >
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
            ))}
            {filteredResidents.length === 0 && (
              <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>No residents found.</p>
            )}
          </div>
          {selected && (
            <ResidentDetail
              resident={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}

      {showForm && <ResidentForm resident={editTarget} onClose={handleFormClose} />}
    </div>
  )
}
