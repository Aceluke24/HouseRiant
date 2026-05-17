import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  useChronicleEntries, useCreateChronicleEntry, useUpdateChronicleEntry, useDeleteChronicleEntry,
  useTags, useCreateTag, useDeleteTag,
} from '../hooks/useChronicle'
import { useResidents } from '../hooks/useResidents'
import { useNotableFigures } from '../hooks/useNotableFigures'
import CalendarDatePicker from '../components/CalendarDatePicker'
import ConfirmModal from '../components/ConfirmModal'
import type { ChronicleEntry, CreateChronicleEntryRequest, Tag, CreateTagRequest } from '../types'

// ── Chronicle Entry Form (modal) ──────────────────────────

interface EntryFormProps {
  entry?: ChronicleEntry
  onClose: () => void
}

function ChronicleEntryForm({ entry, onClose }: EntryFormProps) {
  const createEntry  = useCreateChronicleEntry()
  const updateEntry  = useUpdateChronicleEntry()
  const createTag    = useCreateTag()
  const { data: allTags = [] }      = useTags()
  const { data: residents = [] }    = useResidents()
  const { data: notableFigs = [] }  = useNotableFigures()

  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#7a90aa')
  const [residentSearch, setResidentSearch] = useState('')
  const [figureSearch, setFigureSearch] = useState('')

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<{
    title: string
    body: string
    entryDate: string | undefined
    tagIds: number[]
    residentIds: number[]
    notableFigureIds: number[]
  }>({
    defaultValues: {
      title:            entry?.title ?? '',
      body:             entry?.body ?? '',
      entryDate:        entry?.entryDate,
      tagIds:           entry?.tags.map(t => t.id) ?? [],
      residentIds:      entry?.residents.map(r => r.id) ?? [],
      notableFigureIds: entry?.notableFigures.map(n => n.id) ?? [],
    },
  })

  const watchedTagIds      = watch('tagIds')
  const watchedResidentIds = watch('residentIds')
  const watchedFigureIds   = watch('notableFigureIds')

  function toggleId(field: 'tagIds' | 'residentIds' | 'notableFigureIds', id: number) {
    const current = field === 'tagIds'
      ? watchedTagIds
      : field === 'residentIds'
        ? watchedResidentIds
        : watchedFigureIds
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    setValue(field, next)
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    const tag = await createTag.mutateAsync({ name: newTagName.trim(), color: newTagColor })
    setValue('tagIds', [...watchedTagIds, tag.id])
    setNewTagName('')
  }

  const onSubmit = async (values: {
    title: string; body: string; entryDate: string | undefined
    tagIds: number[]; residentIds: number[]; notableFigureIds: number[]
  }) => {
    const payload: CreateChronicleEntryRequest = {
      title:            values.title,
      body:             values.body,
      entryDate:        values.entryDate || undefined,
      tagIds:           values.tagIds,
      residentIds:      values.residentIds,
      notableFigureIds: values.notableFigureIds,
    }
    if (entry) {
      await updateEntry.mutateAsync({ id: entry.id, data: payload })
    } else {
      await createEntry.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createEntry.isPending || updateEntry.isPending

  const filteredResidents = useMemo(() => {
    const term = residentSearch.toLowerCase()
    return term ? residents.filter(r => r.name.toLowerCase().includes(term)) : residents
  }, [residents, residentSearch])

  const filteredFigures = useMemo(() => {
    const term = figureSearch.toLowerCase()
    return term ? notableFigs.filter(n => n.name.toLowerCase().includes(term)) : notableFigs
  }, [notableFigs, figureSearch])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{entry ? 'Edit Entry' : 'New Chronicle Entry'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" {...register('title', { required: 'Title is required' })} />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          {/* Body */}
          <div className="form-group">
            <label className="form-label">Body</label>
            <textarea className="form-textarea" rows={8} {...register('body', { required: 'Body is required' })} />
            {errors.body && <span className="form-error">{errors.body.message}</span>}
          </div>

          {/* Entry Date */}
          <div className="form-group">
            <label className="form-label">Entry Date</label>
            <Controller
              name="entryDate"
              control={control}
              render={({ field }) => (
                <CalendarDatePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              maxHeight: 140,
              overflowY: 'auto',
              background: 'var(--white)',
            }}>
              {allTags.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic', padding: '2px 4px' }}>
                  No tags yet — create one below.
                </p>
              )}
              {allTags.map(t => (
                <label
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '3px 4px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={watchedTagIds.includes(t.id)}
                    onChange={() => toggleId('tagIds', t.id)}
                    style={{ width: 14, height: 14 }}
                  />
                  {t.color && (
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: t.color, display: 'inline-block', flexShrink: 0,
                    }} />
                  )}
                  {t.name}
                </label>
              ))}
            </div>

            {/* Inline new tag */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
              <input
                className="form-input"
                type="text"
                placeholder="New tag name…"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag() } }}
                style={{ flex: 1 }}
              />
              <input
                type="color"
                value={newTagColor}
                onChange={e => setNewTagColor(e.target.value)}
                style={{ width: 32, height: 32, padding: 2, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }}
                title="Tag colour"
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
                disabled={!newTagName.trim() || createTag.isPending}
                onClick={handleCreateTag}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Residents */}
          <div className="form-group">
            <label className="form-label">Linked Residents</label>
            <input
              className="form-input"
              type="text"
              placeholder="Search residents…"
              value={residentSearch}
              onChange={e => setResidentSearch(e.target.value)}
              style={{ marginBottom: 4 }}
            />
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              maxHeight: 120,
              overflowY: 'auto',
              background: 'var(--white)',
            }}>
              {filteredResidents.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic', padding: '2px 4px' }}>No residents found.</p>
              )}
              {filteredResidents.map(r => (
                <label
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '3px 4px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={watchedResidentIds.includes(r.id)}
                    onChange={() => toggleId('residentIds', r.id)}
                    style={{ width: 14, height: 14 }}
                  />
                  {r.name}
                  {r.role && (
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}> — {r.role}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Notable Figures */}
          <div className="form-group">
            <label className="form-label">Linked Notable Figures</label>
            <input
              className="form-input"
              type="text"
              placeholder="Search notable figures…"
              value={figureSearch}
              onChange={e => setFigureSearch(e.target.value)}
              style={{ marginBottom: 4 }}
            />
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              maxHeight: 120,
              overflowY: 'auto',
              background: 'var(--white)',
            }}>
              {filteredFigures.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', fontStyle: 'italic', padding: '2px 4px' }}>No notable figures found.</p>
              )}
              {filteredFigures.map(n => (
                <label
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '3px 4px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={watchedFigureIds.includes(n.id)}
                    onChange={() => toggleId('notableFigureIds', n.id)}
                    style={{ width: 14, height: 14 }}
                  />
                  {n.name}
                  {n.faction && (
                    <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}> — {n.faction}</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : entry ? 'Save Changes' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Chronicle Detail Panel ────────────────────────────────

interface DetailPanelProps {
  entry: ChronicleEntry
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function ChronicleDetailPanel({ entry, onEdit, onDelete, onClose }: DetailPanelProps) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h3>{entry.title}</h3>
          {entry.entryDate && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, fontStyle: 'italic' }}>
              {entry.entryDate}
            </div>
          )}
        </div>
        <button className="btn-icon" onClick={onClose} title="Close">✕</button>
      </div>

      <div className="detail-body" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="detail-section" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {entry.tags.map(t => (
                <span
                  key={t.id}
                  className="badge"
                  style={t.color ? { background: t.color, color: '#fff', borderColor: 'transparent' } : undefined}
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="detail-section">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--ink)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {entry.body}
          </p>
        </div>

        {/* Linked Residents */}
        {entry.residents.length > 0 && (
          <div className="detail-section" style={{ marginTop: '0.75rem' }}>
            <div className="detail-label">Residents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {entry.residents.map(r => (
                <span key={r.id} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)' }}>
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Linked Notable Figures */}
        {entry.notableFigures.length > 0 && (
          <div className="detail-section" style={{ marginTop: '0.75rem' }}>
            <div className="detail-label">Notable Figures</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {entry.notableFigures.map(n => (
                <span key={n.id} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)' }}>
                  {n.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="detail-footer" style={{ display: 'flex', gap: 8, paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.75rem' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={onEdit}>Edit</button>
        <button className="btn-danger" style={{ flex: 1 }} onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function ChroniclePage() {
  const [search, setSearch]         = useState('')
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editTarget, setEditTarget] = useState<ChronicleEntry | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const { data: entries = [], isLoading } = useChronicleEntries({
    search: search || undefined,
  })
  const { data: allTags = [] }  = useTags()
  const deleteEntry = useDeleteChronicleEntry()
  const deleteTag   = useDeleteTag()

  // Client-side tag filter (multi-select)
  const filteredEntries = useMemo(() => {
    if (tagFilters.length === 0) return entries
    return entries.filter(e =>
      tagFilters.every(tf => e.tags.some(t => t.name === tf)),
    )
  }, [entries, tagFilters])

  const selected = selectedId != null
    ? filteredEntries.find(e => e.id === selectedId) ?? null
    : null

  function toggleTagFilter(name: string) {
    setTagFilters(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name],
    )
  }

  const handleEdit = (e: ChronicleEntry) => { setEditTarget(e); setShowForm(true) }
  const handleFormClose = () => { setShowForm(false); setEditTarget(undefined) }

  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteEntry.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Chronicle</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Entry</button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search entries by title or body…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {allTags.length > 0 && (
          <div className="filter-chips">
            <button
              className={`chip${tagFilters.length === 0 ? ' chip-active' : ''}`}
              onClick={() => setTagFilters([])}
            >
              All
            </button>
            {allTags.map(t => (
              <button
                key={t.id}
                className={`chip${tagFilters.includes(t.name) ? ' chip-active' : ''}`}
                style={tagFilters.includes(t.name) && t.color ? { borderColor: t.color } : undefined}
                onClick={() => toggleTagFilter(t.name)}
              >
                {t.color && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: t.color, display: 'inline-block', marginRight: 4,
                  }} />
                )}
                {t.name}
              </button>
            ))}
          </div>
        )}

        <span className="filter-count">{filteredEntries.length} entries</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="loading">Loading the chronicle…</div>
      ) : (
        <div className="list-layout">

          {/* Entry card list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {filteredEntries.length === 0 ? (
              <p style={{
                padding: '2.5rem',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                color: 'var(--ink-muted)',
                fontSize: 15,
              }}>
                {search || tagFilters.length > 0
                  ? 'No entries match the current filters.'
                  : 'The chronicle is empty. Record the first passage of House Riant.'}
              </p>
            ) : filteredEntries.map(e => (
              <div
                key={e.id}
                className={`chronicle-card${selectedId === e.id ? ' selected' : ''}`}
                onClick={() => setSelectedId(prev => prev === e.id ? null : e.id)}
              >
                <div className="chronicle-card-header">
                  <span className="chronicle-card-title">{e.title}</span>
                  {e.entryDate && (
                    <span className="chronicle-card-date">{e.entryDate}</span>
                  )}
                </div>
                <p className="chronicle-card-body">
                  {e.body.slice(0, 100)}{e.body.length > 100 ? '…' : ''}
                </p>
                {e.tags.length > 0 && (
                  <div className="chronicle-card-tags">
                    {e.tags.map(t => (
                      <span
                        key={t.id}
                        className="badge"
                        style={t.color ? { background: t.color, color: '#fff', borderColor: 'transparent' } : undefined}
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <ChronicleDetailPanel
              entry={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => setConfirmDeleteId(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && <ChronicleEntryForm entry={editTarget} onClose={handleFormClose} />}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Delete Entry"
          message="Permanently delete this chronicle entry? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
