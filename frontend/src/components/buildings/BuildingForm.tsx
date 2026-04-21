import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateBuilding, useUpdateBuilding } from '../../hooks/useBuildings'
import type { Building, CreateBuildingRequest, BuildingType, BuildingCondition } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

function trimToUndefined(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined
  const t = String(v).trim()
  return t === '' ? undefined : t
}

function positiveInt(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : undefined
}

function buildPayload(raw: CreateBuildingRequest): CreateBuildingRequest {
  return {
    name: trimToUndefined(raw.name) ?? '',
    type: raw.type as BuildingType,
    description: trimToUndefined(raw.description),
    condition: raw.condition as BuildingCondition,
    capacityPersons: positiveInt(raw.capacityPersons),
    storageCapacityLbs: positiveInt(raw.storageCapacityLbs),
    isLivable: Boolean(raw.isLivable),
    imageUrl: trimToUndefined(raw.imageUrl),
    imagePosition: trimToUndefined(raw.imagePosition) ?? 'center',
    notes: trimToUndefined(raw.notes),
  }
}

function parsePosition(pos: string): { x: number; y: number } {
  const keywords: Record<string, { x: number; y: number }> = {
    'center':        { x: 50, y: 50  },
    'top':           { x: 50, y: 0   },
    'bottom':        { x: 50, y: 100 },
    'left':          { x: 0,  y: 50  },
    'right':         { x: 100,y: 50  },
    'top left':      { x: 0,  y: 0   },
    'top center':    { x: 50, y: 0   },
    'top right':     { x: 100,y: 0   },
    'center left':   { x: 0,  y: 50  },
    'center right':  { x: 100,y: 50  },
    'bottom left':   { x: 0,  y: 100 },
    'bottom center': { x: 50, y: 100 },
    'bottom right':  { x: 100,y: 100 },
  }
  if (keywords[pos]) return keywords[pos]
  const m = pos.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/)
  if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) }
  return { x: 50, y: 50 }
}

function DragFocalPointPicker({
  imageUrl,
  value,
  onChange,
}: {
  imageUrl: string
  value: string
  onChange: (pos: string) => void
}) {
  const [xy, setXY] = useState(() => parsePosition(value))
  const xyRef = useRef(parsePosition(value))
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const lastClientPos = useRef({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true
    setIsDragging(true)
    lastClientPos.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = e.clientX - lastClientPos.current.x
    const dy = e.clientY - lastClientPos.current.y
    lastClientPos.current = { x: e.clientX, y: e.clientY }
    const nx = Math.max(0, Math.min(100, xyRef.current.x - (dx / rect.width) * 100))
    const ny = Math.max(0, Math.min(100, xyRef.current.y - (dy / rect.height) * 100))
    xyRef.current = { x: nx, y: ny }
    setXY({ x: nx, y: ny })
    onChange(`${Math.round(nx)}% ${Math.round(ny)}%`)
  }

  function onPointerUp() {
    dragging.current = false
    setIsDragging(false)
  }

  const posStr = `${xy.x}% ${xy.y}%`

  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
        Drag to reposition — move the image to frame the area you want shown
      </div>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          width: '100%',
          height: 160,
          borderRadius: '6px',
          overflow: 'hidden',
          border: '2px solid var(--gold)',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <img
          src={imageUrl}
          alt="preview"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: posStr, pointerEvents: 'none' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 6,
          right: 8,
          fontFamily: 'var(--font-body)',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.8)',
          textShadow: '0 1px 3px rgba(0,0,0,0.7)',
          pointerEvents: 'none',
        }}>
          {Math.round(xy.x)}% · {Math.round(xy.y)}%
        </div>
      </div>
    </div>
  )
}

function ImageUpload({
  value,
  position,
  onImageChange,
  onPositionChange,
}: {
  value?: string
  position?: string
  onImageChange: (url: string) => void
  onPositionChange: (pos: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(
    value ?? undefined
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/uploads/portrait', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Upload failed')
      }
      const { url } = await res.json()
      setPreview(url)
      onImageChange(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: 120,
            height: 80,
            borderRadius: '6px',
            background: 'var(--blue-pale, #e8eef7)',
            border: '2px solid var(--gold)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {preview
            ? <img
                src={preview}
                alt="building"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position || 'center' }}
              />
            : <span style={{ fontSize: 28, color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>
                {uploading ? '…' : '🏰'}
              </span>
          }
        </div>
        <div>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 11 }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : preview ? 'Change Image' : 'Upload Image'}
          </button>
          {preview && !uploading && (
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 11, marginLeft: 6 }}
              onClick={() => { setPreview(undefined); onImageChange('') }}
            >
              Remove
            </button>
          )}
          {uploadError && <p style={{ fontSize: 11, color: 'var(--danger, #b00)', marginTop: 4 }}>{uploadError}</p>}
          {!uploadError && <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>JPG, PNG, WebP — max 5MB</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* Focal point picker — only shown when an image is loaded */}
      {preview && (
        <DragFocalPointPicker
          imageUrl={preview}
          value={position || 'center'}
          onChange={onPositionChange}
        />
      )}
    </div>
  )
}

const BUILDING_TYPES: BuildingType[] = ['Living', 'Storage', 'Defense', 'Agricultural', 'Workshop', 'Religious', 'Other']
const BUILDING_CONDITIONS: BuildingCondition[] = ['Ruined', 'Poor', 'Functional', 'Good', 'Excellent']

interface Props {
  building?: Building
  onClose: () => void
}

export default function BuildingForm({ building, onClose }: Props) {
  const isEdit = Boolean(building)
  const create = useCreateBuilding()
  const update = useUpdateBuilding()
  const isPending = create.isPending || update.isPending
  const submitError = create.error || update.error

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateBuildingRequest>({
    defaultValues: building
      ? {
          name: building.name,
          type: building.type,
          description: building.description ?? '',
          condition: building.condition,
          capacityPersons: building.capacityPersons,
          storageCapacityLbs: building.storageCapacityLbs,
          isLivable: building.isLivable,
          imageUrl: building.imageUrl ?? '',
          imagePosition: building.imagePosition ?? 'center',
          notes: building.notes ?? '',
        }
      : {
          type: 'Living',
          condition: 'Functional',
          isLivable: false,
          imageUrl: '',
          imagePosition: 'center',
        },
  })

  const imageUrl = watch('imageUrl')
  const imagePosition = watch('imagePosition')

  async function onSubmit(raw: CreateBuildingRequest) {
    const payload = buildPayload(raw)
    if (isEdit && building) {
      await update.mutateAsync({ id: building.id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? `Edit ${building!.name}` : 'Add Building'}</h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Image upload + focal point */}
          <div className="form-group">
            <label className="form-label">Building Image</label>
            <ImageUpload
              value={imageUrl || undefined}
              position={imagePosition}
              onImageChange={url => setValue('imageUrl', url)}
              onPositionChange={pos => setValue('imagePosition', pos)}
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" {...register('type')}>
                {BUILDING_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-select" {...register('condition')}>
                {BUILDING_CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (persons)</label>
              <input
                className="form-input"
                type="number"
                min={1}
                {...register('capacityPersons')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Storage (lbs)</label>
              <input
                className="form-input"
                type="number"
                min={1}
                {...register('storageCapacityLbs')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} {...register('description')} />
          </div>

          {/* Livable — compact themed checkbox */}
          <div className="form-group">
            <label className="form-label">Livable</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: 'fit-content' }}>
              <input
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
                {...register('isLivable')}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink)' }}>
                Building can house residents
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={3} {...register('notes')} />
          </div>

          {submitError && (
            <p className="form-error">{getApiErrorMessage(submitError)}</p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Building'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
