import { useEffect, useMemo, useRef, useState } from 'react'
import { useTasks, useDeleteTask, useUpdateTaskStatus, useUpdateTask } from '../hooks/useTasks'
import { useGameState } from '../hooks/useGameState'
import { useDebounce } from '../utils/useDebounce'
import TaskForm from '../components/tasks/TaskForm'
import TaskDetail from '../components/tasks/TaskDetail'
import AddToCalendarModal from '../components/tasks/AddToCalendarModal'
import ConfirmModal from '../components/ConfirmModal'
import CalendarDatePicker, { parseCalendarDate } from '../components/CalendarDatePicker'
import { SEASONS, WEEKS } from '../types'
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

// ── Date comparison helpers ────────────────────────────────

function compareParsedDates(
  a: { year: number; season: string; week: string; day: number },
  b: { year: number; season: string; week: string; day: number },
): number {
  if (a.year !== b.year) return a.year - b.year
  const sa = SEASONS.indexOf(a.season as typeof SEASONS[number])
  const sb = SEASONS.indexOf(b.season as typeof SEASONS[number])
  if (sa !== sb) return sa - sb
  if (!a.season.startsWith('Brón:')) {
    const wa = WEEKS.indexOf(a.week as typeof WEEKS[number])
    const wb = WEEKS.indexOf(b.week as typeof WEEKS[number])
    if (wa !== wb) return wa - wb
  }
  return a.day - b.day
}

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function buildGameDateString(year: number, season: string, week: string | undefined, day: number): string {
  const dayPart = season.startsWith('Brón:')
    ? `${ordinal(day)} of ${season}`
    : `${ordinal(day)} of ${week ?? ''} of ${season}`
  return `${dayPart}, Dr-${year}`
}

// ── Reschedule Modal ──────────────────────────────────────

interface RescheduleModalProps {
  task: EstateTask
  onClose: () => void
  onSave: (newDate: string | undefined) => void
}

function RescheduleModal({ task, onClose, onSave }: RescheduleModalProps) {
  const [date, setDate] = useState<string | undefined>(task.targetDate)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reschedule Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)', marginBottom: '0.75rem' }}>
            {task.name}
          </p>
          <div className="form-group">
            <label className="form-label">New Target Date</label>
            <CalendarDatePicker value={date} onChange={setDate} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn-primary" onClick={() => onSave(date)}>Reschedule</button>
          </div>
        </div>
      </div>
    </div>
  )
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
  const [tab, setTab] = useState<'all' | 'review'>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<EstateTask | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [calendarTask, setCalendarTask] = useState<EstateTask | null>(null)
  const [rescheduleTask, setRescheduleTask] = useState<EstateTask | null>(null)

  // Kanban drag state
  const draggedIdRef = useRef<number | null>(null)
  const [dropOverStatus, setDropOverStatus] = useState<string | null>(null)

  const { data: tasks = [], isLoading } = useTasks({ search: debouncedSearch || undefined })
  const { data: gameState } = useGameState()
  const deleteTask = useDeleteTask()
  const updateTaskStatus = useUpdateTaskStatus()
  const updateTask = useUpdateTask()

  // Current game date as parsed components
  const currentParsed = useMemo(() => {
    if (!gameState) return null
    return {
      year: gameState.currentYear,
      season: gameState.currentSeason ?? '',
      week: gameState.currentWeek ?? WEEKS[0],
      day: gameState.currentDay,
    }
  }, [gameState])

  // Overdue tasks: targetDate or completedDate ≤ current game date, not Completed
  const overdueTasks = useMemo(() => {
    if (!currentParsed) return []
    return tasks.filter(t => {
      if (t.status === 'Completed') return false
      const dateStr = t.targetDate ?? t.completedDate
      if (!dateStr) return false
      const parsed = parseCalendarDate(dateStr)
      if (!parsed) return false
      return compareParsedDates(parsed, currentParsed) <= 0
    })
  }, [tasks, currentParsed])

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

  // Mark a task complete, setting completedDate to current game date
  const handleMarkComplete = async (task: EstateTask) => {
    const completedDate = gameState
      ? buildGameDateString(gameState.currentYear, gameState.currentSeason ?? '', gameState.currentWeek, gameState.currentDay)
      : undefined
    await updateTask.mutateAsync({
      id: task.id,
      data: {
        name: task.name,
        description: task.description,
        status: 'Completed',
        priority: task.priority,
        category: task.category,
        costTin: task.costTin,
        paymentMethod: task.paymentMethod,
        paymentNotes: task.paymentNotes,
        targetDate: task.targetDate,
        completedDate,
        requirements: task.requirements,
        outcome: task.outcome,
        notes: task.notes,
        buildingId: task.buildingId,
        assignedFamilyId: task.assignedFamilyId,
        assignedResidentId: task.assignedResidentId,
      },
    })
  }

  const handleRescheduleSave = async (newDate: string | undefined) => {
    if (!rescheduleTask) return
    await updateTask.mutateAsync({
      id: rescheduleTask.id,
      data: {
        name: rescheduleTask.name,
        description: rescheduleTask.description,
        status: rescheduleTask.status,
        priority: rescheduleTask.priority,
        category: rescheduleTask.category,
        costTin: rescheduleTask.costTin,
        paymentMethod: rescheduleTask.paymentMethod,
        paymentNotes: rescheduleTask.paymentNotes,
        targetDate: newDate,
        completedDate: rescheduleTask.completedDate,
        requirements: rescheduleTask.requirements,
        outcome: rescheduleTask.outcome,
        notes: rescheduleTask.notes,
        buildingId: rescheduleTask.buildingId,
        assignedFamilyId: rescheduleTask.assignedFamilyId,
        assignedResidentId: rescheduleTask.assignedResidentId,
      },
    })
    setRescheduleTask(null)
  }

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
    planned:    tasks.filter(t => t.status === 'Planned').length,
    inProgress: tasks.filter(t => t.status === 'InProgress').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    blocked:    tasks.filter(t => t.status === 'Blocked').length,
  }), [tasks])

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Task</button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn${tab === 'all' ? ' active' : ''}`}
          onClick={() => setTab('all')}
        >
          All Tasks
        </button>
        <button
          className={`tab-btn${tab === 'review' ? ' active' : ''}`}
          onClick={() => setTab('review')}
        >
          Due for Review
          {overdueTasks.length > 0 && (
            <span className="filter-count" style={{ marginLeft: 6 }}>{overdueTasks.length}</span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading the task ledger…</div>
      ) : tab === 'review' ? (

        /* ── Due for Review tab ─────────────────────────── */
        <div>
          {overdueTasks.length === 0 ? (
            <p style={{
              padding: '2.5rem',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              color: 'var(--ink-muted)',
              fontSize: 15,
            }}>
              The ledger is clear — no tasks are overdue. House Riant stands vigilant.
            </p>
          ) : (
            <div>
              {overdueTasks.map(t => (
                <div key={t.id} className="review-card">
                  <div className="review-card-title">{t.name}</div>
                  <div className="review-card-badges">
                    <span className={statusBadge(t.status)}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </span>
                    <span className={priorityBadge(t.priority)}>{t.priority}</span>
                  </div>
                  <div className="review-card-date">
                    Due: {t.targetDate ?? t.completedDate ?? '—'}
                  </div>
                  <div className="review-card-actions">
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '4px 12px' }}
                      disabled={updateTask.isPending}
                      onClick={() => handleMarkComplete(t)}
                    >
                      Mark Complete
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '4px 12px' }}
                      onClick={() => setRescheduleTask(t)}
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* ── All Tasks tab ──────────────────────────────── */
        <>
          {/* Stats */}
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
          {view === 'table' ? (

            /* ── Table view ─────────────────────────────── */
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

            /* ── Kanban view ────────────────────────────── */
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
        </>
      )}

      {/* Modals */}
      {showForm && <TaskForm task={editTarget} onClose={handleFormClose} />}

      {calendarTask && (
        <AddToCalendarModal task={calendarTask} onClose={() => setCalendarTask(null)} />
      )}

      {rescheduleTask && (
        <RescheduleModal
          task={rescheduleTask}
          onClose={() => setRescheduleTask(null)}
          onSave={handleRescheduleSave}
        />
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
