import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useWorldLocations,
  useCreateWorldLocation,
  useUpdateWorldLocation,
  useDeleteWorldLocation,
} from '../hooks/useWorldLocations'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import type { WorldLocation, CreateWorldLocationRequest } from '../types'

const LOCATION_TYPES = ['City', 'Ruin', 'Landmark', 'Settlement', 'Unknown']

// ── Location Form Modal ───────────────────────────────────

interface FormProps {
  location?: WorldLocation
  initialPin?: { xPercent: number; yPercent: number }
  onRequestPin: () => void
  pendingPin: { xPercent: number; yPercent: number } | null
  onClose: () => void
}

function LocationForm({ location, initialPin, onRequestPin, pendingPin, onClose }: FormProps) {
  const createLocation = useCreateWorldLocation()
  const updateLocation = useUpdateWorldLocation()

  const defaultPin = location
    ? { xPercent: location.xPercent, yPercent: location.yPercent }
    : initialPin ?? { xPercent: 50, yPercent: 50 }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateWorldLocationRequest>({
    defaultValues: {
      name: location?.name ?? '',
      description: location?.description ?? '',
      notes: location?.notes ?? '',
      locationType: location?.locationType ?? '',
      isUnlocked: location?.isUnlocked ?? false,
      xPercent: defaultPin.xPercent,
      yPercent: defaultPin.yPercent,
    },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  // Update coordinates when pending pin changes
  if (pendingPin) {
    setValue('xPercent', pendingPin.xPercent)
    setValue('yPercent', pendingPin.yPercent)
  }

  const xPercent = watch('xPercent')
  const yPercent = watch('yPercent')

  async function onSubmit(data: CreateWorldLocationRequest) {
    setSubmitError(null)
    try {
      if (location) {
        await updateLocation.mutateAsync({ id: location.id, data })
      } else {
        await createLocation.mutateAsync(data)
      }
      onClose()
    } catch (err) {
      setSubmitError(getApiErrorMessage(err))
    }
  }

  const isPending = createLocation.isPending || updateLocation.isPending

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2>{location ? 'Edit Location' : 'Add Location'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Location Type</label>
            <input
              className="form-input"
              list="location-type-list"
              placeholder="City, Ruin, Landmark…"
              {...register('locationType')}
            />
            <datalist id="location-type-list">
              {LOCATION_TYPES.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} {...register('description')} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={2} {...register('notes')} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="isUnlocked" {...register('isUnlocked')} />
            <label htmlFor="isUnlocked" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Unlocked (visible to players)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Pin Position</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                X: {xPercent?.toFixed(1)}%  Y: {yPercent?.toFixed(1)}%
              </span>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: 12, padding: '3px 10px' }}
                onClick={() => { onRequestPin(); onClose() }}
              >
                📍 Click map to place
              </button>
            </div>
            <input type="hidden" {...register('xPercent', { valueAsNumber: true })} />
            <input type="hidden" {...register('yPercent', { valueAsNumber: true })} />
          </div>

          {submitError && <p className="form-error">{submitError}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function WorldMapPage() {
  const { data: locations = [], isLoading } = useWorldLocations()
  const updateLocation = useUpdateWorldLocation()
  const deleteLocation = useDeleteWorldLocation()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<WorldLocation | undefined>()
  const [isPlacingPin, setIsPlacingPin] = useState(false)
  const [pendingPin, setPendingPin] = useState<{ xPercent: number; yPercent: number } | null>(null)

  const mapContainerRef = useRef<HTMLDivElement>(null)

  const selected = selectedId != null ? (locations.find(l => l.id === selectedId) ?? null) : null

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isPlacingPin) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100
    setPendingPin({ xPercent, yPercent })
    setIsPlacingPin(false)
    setShowForm(true)
  }

  function handleAddLocation() {
    setEditTarget(undefined)
    setPendingPin(null)
    setShowForm(true)
  }

  function handleEdit(loc: WorldLocation) {
    setEditTarget(loc)
    setPendingPin(null)
    setShowForm(true)
  }

  async function handleToggleUnlock(loc: WorldLocation) {
    await updateLocation.mutateAsync({
      id: loc.id,
      data: {
        name: loc.name,
        description: loc.description,
        notes: loc.notes,
        isUnlocked: !loc.isUnlocked,
        xPercent: loc.xPercent,
        yPercent: loc.yPercent,
        locationType: loc.locationType,
      },
    })
  }

  async function handleDelete(id: number) {
    await deleteLocation.mutateAsync(id)
    if (selectedId === id) setSelectedId(null)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditTarget(undefined)
  }

  function handleRequestPin() {
    setIsPlacingPin(true)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>World Map</h1>
        <button className="btn-primary" onClick={handleAddLocation}>+ Add Location</button>
      </div>

      {isPlacingPin && (
        <div className="world-map-placing-hint">
          📍 Click on the map to place the pin. Press Esc to cancel.
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading the world…</div>
      ) : (
        <div className="world-map-layout">
          <div className="world-map-area">
            <div
              ref={mapContainerRef}
              className={`world-map-container${isPlacingPin ? '' : ' world-map-view-mode'}`}
              onClick={handleMapClick}
              onKeyDown={e => { if (e.key === 'Escape') setIsPlacingPin(false) }}
              tabIndex={isPlacingPin ? 0 : -1}
            >
              <img
                className="world-map-img"
                src="/world-map.jpg"
                alt="World Map"
                draggable={false}
              />

              {/* Pending pin preview while placing */}
              {isPlacingPin && pendingPin && (
                <div
                  className="world-map-pending-pin"
                  style={{ left: `${pendingPin.xPercent}%`, top: `${pendingPin.yPercent}%` }}
                >
                  ●
                </div>
              )}

              {/* Location pins */}
              {locations.map(loc => (
                <div
                  key={loc.id}
                  className={`world-map-pin ${loc.isUnlocked ? 'world-map-pin-unlocked' : 'world-map-pin-locked'}${selectedId === loc.id ? ' world-map-pin-selected' : ''}`}
                  style={{ left: `${loc.xPercent}%`, top: `${loc.yPercent}%` }}
                  onClick={e => { e.stopPropagation(); setSelectedId(loc.id === selectedId ? null : loc.id) }}
                  title={loc.isUnlocked ? loc.name : '?'}
                >
                  <span className="world-map-pin-dot">●</span>
                  {loc.isUnlocked
                    ? <span className="world-map-pin-label">{loc.name}</span>
                    : <span className="world-map-pin-label world-map-pin-label-locked">?</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="detail-panel" style={{ minWidth: 260, maxWidth: 300 }}>
              <div className="detail-header">
                <div>
                  <h2 style={{ fontSize: 16 }}>
                    {selected.isUnlocked ? selected.name : 'Unknown Location'}
                  </h2>
                  {selected.locationType && (
                    <span className="badge" style={{ fontSize: 11, marginTop: 4, display: 'inline-block', background: 'var(--blue-royal)', color: '#fff' }}>
                      {selected.locationType}
                    </span>
                  )}
                </div>
                <button className="btn-icon" onClick={() => setSelectedId(null)}>✕</button>
              </div>
              <div className="detail-body">
                {selected.isUnlocked ? (
                  <>
                    {selected.description && (
                      <div className="detail-row">
                        <span className="detail-label">Description</span>
                        <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{selected.description}</span>
                      </div>
                    )}
                    {selected.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Notes</span>
                        <span className="detail-value detail-notes" style={{ whiteSpace: 'pre-wrap' }}>{selected.notes}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontSize: 13, marginBottom: 8 }}>
                    This location is locked. Unlock it to reveal details.
                  </p>
                )}
                <div className="detail-row">
                  <span className="detail-label">Position</span>
                  <span className="detail-value" style={{ fontSize: 12 }}>
                    {selected.xPercent.toFixed(1)}% × {selected.yPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  className={selected.isUnlocked ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => handleToggleUnlock(selected)}
                  disabled={updateLocation.isPending}
                >
                  {selected.isUnlocked ? '🔓 Lock' : '🔒 Unlock'}
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => handleEdit(selected)}>✏ Edit</button>
                  <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(selected.id)}>✕ Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <LocationForm
          location={editTarget}
          initialPin={pendingPin ?? undefined}
          onRequestPin={handleRequestPin}
          pendingPin={pendingPin}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
