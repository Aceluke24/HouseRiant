import { useEffect, useMemo, useRef, useState } from 'react'
import { useTasks, useDeleteTask, useUpdateTaskStatus } from '../hooks/useTasks'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import AddToCalendarModal from '../components/tasks/AddToCalendarModal'
import ConfirmModal from '../components/ConfirmModal'
import type { EstateTask, EstateTaskStatus, TaskPriority, TaskCategory } from '../types'

// ── Constants ─────────────────────────────────────────────

const STATUSES: EstateTaskStatus[] = ['Planned', 'InProgress', 'Completed', 'Blocked']
const STATUS_LABELS: Record<string, string> = { InProgress: 'In Progress' }

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent']

const CATEGORIES: TaskCategory[] = [
  'Construction', 'Recruitment', 'Procurement', 'Military',
  'Financial', 'Agricultural', 'Diplomatic', 'Other',
]

// Badge class helpers
function statusBadge(status: string) {
  return `badge badge-${status.toLowerCase()}`
}
function priorityBadge(priority: string) {
  return `badge badge-${priority.toLowerCase()}`
}

// ── Kanban column component ────────────────────────────────

interface KanbanColProps {
  status: EstateTaskStatus
  tasks: EstateTask[]
  selectedId: number | null
  isDragOver: boolean
  onSelect: (id: number) => void
  onEdit: (t: EstateTask) => void
  onDelete: (id: number) => void
  onDragStart: (e: React.DragEvent, id: number) => void
  onDragOver: (e: React.DragEvent, status: EstateTaskStatus) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, status: EstateTaskStatus) => void
}

function KanbanColumn({
  status, tasks, selectedId, isDragOver,
  onSelect, onEdit, onDelete,
  onDragStart, onDragOver, onDragLeave, onDrop,
}: KanbanColProps) {
  const label = STATUS_LABELS[status] ?? status

  return (
    <div
      className={`kanban-col${isDragOver ? ' kanban-col-over' : ''}`}
      onDragOver={e => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, status)}
    >
      <div className="kanban-col-header">
        <span>{label}</span>
        <span className="kanban-col-count">{tasks.length}</span>
      </div>

      <div className="kanban-cards">
        {tasks.map(t => (
          <div
            key={t.id}
            className={`kanban-card${selectedId === t.id ? ' selected' : ''}`}
            draggable
            onDragStart={e => onDragStart(e, t.id)}
            onClick={() => onSelect(t.id)}
          >
            <div className="kanban-card-title">{t.name}</div>
            <div className="kanban-card-badges">
              <span className={priorityBadge(t.priority)}>{t.priority}</span>
              <span className="badge badge-neutral">{t.category}</span>
            </div>
            {(t.assignedResidentName || t.assignedFamilyName || t.targetDate) && (
              <div className="kanban-card-meta">
                {t.assignedResidentName && (
                  <span>👤 {t.assignedResidentName}</span>
                )}
                {!t.assignedResidentName && t.assignedFamilyName && (
                  <span>🏠 {t.assignedFamilyName}</span>
                )}
                {t.targetDate && (
                  <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>📅 {t.targetDate}</span>
                )}
              </div>
            )}
            <div className="kanban-card-actions" onClick={e => e.stopPropagation()}>
              <button className="btn-icon" title="Edit" onClick={() => onEdit(t)}>✏</button>
              <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => onDelete(t.id)}>✕</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', fontStyle: 'italic', padding: '8px 2px' }}>
            No tasks
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────

export default function TasksPage() {
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<EstateTask | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [calendarTask, setCalendarTask] = useState<EstateTask | null>(null)

  // Kanban drag state
  const draggedIdRef = useRef<number | null>(null)
  const [dropOverStatus, setDropOverStatus] = useState<string | null>(null)

  const { data: tasks = [], isLoading } = useTasks({ search: search || undefined })
  const deleteTask = useDeleteTask()
  const updateTaskStatus = useUpdateTaskStatus()

  // Client-side filter on top of search (search is server-side)
  const filteredTasks = useMemo(() => {
    let result = tasks
    if (statusFilters.length)   result = result.filter(t => statusFilters.includes(t.status))
    if (priorityFilters.length) result = result.filter(t => priorityFilters.includes(t.priority))
    if (categoryFilters.length) result = result.filter(t => categoryFilters.includes(t.category))
    return result
  }, [tasks, statusFilters, priorityFilters, categoryFilters])

  // Derive selected from live data
  const selected = selectedId != null ? tasks.find(t => t.id === selectedId) ?? null : null

  // Close detail panel if the task is filtered out
  useEffect(() => {
    if (selectedId != null && !filteredTasks.some(t => t.id === selectedId)) {
      setSelectedId(null)
    }
  }, [filteredTasks, selectedId])

  // Tasks per kanban column (uses filteredTasks so filters apply to kanban too)
  const tasksByStatus = useMemo(() => {
    const map: Record<string, EstateTask[]> = {}
    for (const s of STATUSES) map[s] = []
    for (const t of filteredTasks) map[t.status]?.push(t)
    return map
  }, [filteredTasks])

  // ── Filter toggles ─────────────────────────────────────

  function toggleStatus(val: string) {
    setStatusFilters(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  }
  function togglePriority(val: string) {
    setPriorityFilters(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  }
  function toggleCategory(val: string) {
    setCategoryFilters(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  }

  // ── Action handlers ────────────────────────────────────

  const handleAddToCalendar = (task: EstateTask) => {
    setCalendarTask(task)
  }

  const handleEdit = (t: EstateTask) => { setEditTarget(t); setShowForm(true) }
  const handleDelete = (id: number) => setConfirmDeleteId(id)
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteTask.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }
  const handleFormClose = () => { setShowForm(false); setEditTarget(undefined) }

  // ── Kanban drag handlers ───────────────────────────────

  const handleDragStart = (e: React.DragEvent, id: number) => {
    draggedIdRef.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: EstateTaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropOverStatus(status)
  }

  const handleDragLeave = () => {
    setDropOverStatus(null)
  }

  const handleDrop = async (e: React.DragEvent, status: EstateTaskStatus) => {
    e.preventDefault()
    setDropOverStatus(null)
    const id = draggedIdRef.current
    draggedIdRef.current = null
    if (id == null) return
    const task = tasks.find(t => t.id === id)
    if (!task || task.status === status) return
    await updateTaskStatus.mutateAsync({ id, status })
  }

  // ── Stats row ──────────────────────────────────────────

  const counts = useMemo(() => ({
    planned:   tasks.filter(t => t.status === 'Planned').length,
    inProgress: tasks.filter(t => t.status === 'InProgress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    blocked:   tasks.filter(t => t.status === 'Blocked').length,
  }), [tasks])

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Task</button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="stats-row">
          <div className="stat-card stat-card-info">
            <span className="stat-value">{counts.planned}</span>
            <span className="stat-label">Planned</span>
          </div>
          <div className="stat-card stat-card-gold">
            <span className="stat-value">{counts.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card stat-card-success">
            <span className="stat-value">{counts.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card stat-card-danger">
            <span className="stat-value">{counts.blocked}</span>
            <span className="stat-label">Blocked</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search tasks by name, description, notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="filter-chips">
          {/* Status */}
          <button
            className={`chip${statusFilters.length === 0 ? ' chip-active' : ''}`}
            onClick={() => setStatusFilters([])}
          >
            All
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`chip${statusFilters.includes(s) ? ' chip-active' : ''}`}
              onClick={() => toggleStatus(s)}
            >
              {STATUS_LABELS[s] ?? s}
            </button>
          ))}

          <span className="filter-sep">|</span>

          {/* Priority */}
          <button
            className={`chip${priorityFilters.length === 0 ? ' chip-active' : ''}`}
            onClick={() => setPriorityFilters([])}
          >
            All
          </button>
          {PRIORITIES.map(p => (
            <button
              key={p}
              className={`chip${priorityFilters.includes(p) ? ' chip-active' : ''}`}
              onClick={() => togglePriority(p)}
            >
              {p}
            </button>
          ))}

          <span className="filter-sep">|</span>

          {/* Category */}
          <button
            className={`chip${categoryFilters.length === 0 ? ' chip-active' : ''}`}
            onClick={() => setCategoryFilters([])}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`chip${categoryFilters.includes(c) ? ' chip-active' : ''}`}
              onClick={() => toggleCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="view-toggle">
            <button
              className={`view-btn${view === 'table' ? ' active' : ''}`}
              onClick={() => setView('table')}
              title="Table view"
            >
              ☰
            </button>
            <button
              className={`view-btn${view === 'kanban' ? ' active' : ''}`}
              onClick={() => setView('kanban')}
              title="Kanban view"
            >
              ⊟
            </button>
          </div>
          <span className="filter-count">{filteredTasks.length} tasks</span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="loading">Loading the task ledger…</div>
      ) : view === 'table' ? (

        /* ── Table view ─────────────────────────────────── */
        <div className="list-layout">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Category</th>
                  <th>Assigned To</th>
                  <th>Target Date</th>
                  <th>Cost</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => (
                  <tr
                    key={t.id}
                    className={selected?.id === t.id ? 'row-selected' : ''}
                    onClick={() => setSelectedId(prev => prev === t.id ? null : t.id)}
                  >
                    <td className="name-cell">{t.name}</td>
                    <td>
                      <span className={statusBadge(t.status)}>
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                    </td>
                    <td>
                      <span className={priorityBadge(t.priority)}>{t.priority}</span>
                    </td>
                    <td style={{ color: 'var(--ink-muted)' }}>{t.category}</td>
                    <td style={{ color: 'var(--ink-mid)' }}>
                      {t.assignedResidentName ?? t.assignedFamilyName ?? '—'}
                    </td>
                    <td style={{ color: 'var(--ink-muted)', fontSize: 13 }}>
                      {t.targetDate ?? '—'}
                    </td>
                    <td style={{ color: 'var(--ink-mid)' }}>
                      {t.costTin != null ? `${t.costTin} tin` : '—'}
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" title="Edit" onClick={() => handleEdit(t)}>✏</button>
                      <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(t.id)}>✕</button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-row">No tasks found in the ledger.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <TaskDetail
              task={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onAddToCalendar={() => handleAddToCalendar(selected)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>

      ) : (

        /* ── Kanban view ────────────────────────────────── */
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div className="kanban-board">
            {STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status] ?? []}
                selectedId={selectedId}
                isDragOver={dropOverStatus === status}
                onSelect={id => setSelectedId(prev => prev === id ? null : id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </div>

          {selected && (
            <div style={{ flexShrink: 0 }}>
              <TaskDetail
                task={selected}
                onEdit={() => handleEdit(selected)}
                onDelete={() => handleDelete(selected.id)}
                onAddToCalendar={() => handleAddToCalendar(selected)}
                  onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && <TaskForm task={editTarget} onClose={handleFormClose} />}

      {calendarTask && (
        <AddToCalendarModal task={calendarTask} onClose={() => setCalendarTask(null)} />
      )}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Delete Task"
          message="Permanently delete this task? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
