import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useCreateNotableFigure, useUpdateNotableFigure } from '../../hooks/useNotableFigures'
import { familiesApi } from '../../api'
import type { NotableFigure, CreateNotableFigureRequest, Gender } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

function trimToUndefined(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined
  const t = String(v).trim()
  return t === '' ? undefined : t
}

function finiteNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function positiveInt(v: unknown): number | undefined {
  const n = finiteNumber(v)
  if (n === undefined) return undefined
  return Number.isInteger(n) && n > 0 ? n : undefined
}

function buildPayload(raw: CreateNotableFigureRequest): CreateNotableFigureRequest {
  const race = trimToUndefined(raw.race)
  return {
    name: trimToUndefined(raw.name) ?? '',
    title: trimToUndefined(raw.title),
    role: trimToUndefined(raw.role),
    type: trimToUndefined(raw.type),
    race,
    krellTribe: race === 'Krell' ? trimToUndefined(raw.krellTribe) : undefined,
    gender: raw.gender == null ? undefined : (raw.gender as Gender),
    age: finiteNumber(raw.age),
    location: trimToUndefined(raw.location),
    faction: trimToUndefined(raw.faction),
    relationship: trimToUndefined(raw.relationship),
    appearance: trimToUndefined(raw.appearance),
    skills: trimToUndefined(raw.skills),
    isAlive: raw.isAlive ?? true,
    firstMet: trimToUndefined(raw.firstMet),
    lastSeen: trimToUndefined(raw.lastSeen),
    notes: trimToUndefined(raw.notes),
    imageUrl: trimToUndefined(raw.imageUrl),
    familyId: positiveInt(raw.familyId),
  }
}

function PortraitUpload({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
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
      onChange(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--blue-pale)',
        border: '2px solid var(--gold)',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        opacity: uploading ? 0.6 : 1,
      }} onClick={() => !uploading && fileRef.current?.click()}>
        {preview
          ? <img src={preview} alt="portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 24, color: 'var(--blue-royal)', fontFamily: 'Cinzel, serif' }}>
              {uploading ? '...' : '+'}
            </span>
        }
      </div>
      <div>
        <button type="button" className="btn-secondary" style={{ fontSize: 11 }}
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : preview ? 'Change Portrait' : 'Upload Portrait'}
        </button>
        {preview && !uploading && (
          <button type="button" className="btn-ghost" style={{ fontSize: 11, marginLeft: 6 }}
            onClick={() => { setPreview(undefined); onChange('') }}>
            Remove
          </button>
        )}
        {uploadError && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{uploadError}</p>}
        {!uploadError && <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>JPG, PNG, WebP — max 5MB</p>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

interface Props {
  figure?: NotableFigure
  onClose: () => void
}

const RELATIONSHIPS = ['Ally', 'Friend', 'Neutral', 'Foe', 'Vassal', 'Rival', 'Unknown']

const KRELL_TRIBES = [
  'Azuir', 'Black Vale', 'Bloodhorn', 'Dumorg',
  'Grodjen', 'Hannami', 'Lodrik', 'Whitehorn',
]

export default function NotableFigureForm({ figure, onClose }: Props) {
  const isEdit = !!figure
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateNotableFigureRequest>({
    defaultValues: figure ? {
      name: figure.name,
      title: figure.title,
      role: figure.role,
      type: figure.type,
      race: figure.race,
      krellTribe: figure.krellTribe,
      gender: figure.gender,
      age: figure.age,
      location: figure.location,
      faction: figure.faction,
      relationship: figure.relationship,
      appearance: figure.appearance,
      skills: figure.skills,
      isAlive: figure.isAlive,
      firstMet: figure.firstMet,
      lastSeen: figure.lastSeen,
      notes: figure.notes,
      imageUrl: figure.imageUrl,
      familyId: figure.familyId,
    } : { isAlive: true },
  })

  const createFigure = useCreateNotableFigure()
  const updateFigure = useUpdateNotableFigure()
  const { data: families = [] } = useQuery({ queryKey: ['families'], queryFn: () => familiesApi.getAll() })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const watchedImage = watch('imageUrl')
  const watchedRace = watch('race')
  const isPending = createFigure.isPending || updateFigure.isPending

  const onSubmit = async (data: CreateNotableFigureRequest) => {
    setSubmitError(null)
    const payload = buildPayload(data)
    try {
      if (isEdit && figure) {
        await updateFigure.mutateAsync({ id: figure.id, data: payload })
      } else {
        await createFigure.mutateAsync(payload)
      }
      onClose()
    } catch (e) {
      setSubmitError(getApiErrorMessage(e))
    }
  }

  const inputStyle = { width: '100%' }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? `Edit ${figure.name}` : 'Add Notable Figure'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form" onChange={() => setSubmitError(null)}>

          {submitError && (
            <div className="form-submit-error" role="alert">{submitError}</div>
          )}

          <input type="hidden" {...register('imageUrl')} />

          {/* Portrait */}
          <div className="form-group">
            <label>Portrait</label>
            <PortraitUpload
              value={watchedImage}
              onChange={url => setValue('imageUrl', url || undefined, { shouldDirty: true, shouldTouch: true })}
            />
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 0 1rem' }} />

          {/* Name + Title */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Name *</label>
              <input
                style={inputStyle}
                {...register('name', {
                  required: 'Name is required',
                  validate: v => (v != null && String(v).trim() !== '') || 'Name is required',
                })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label>Title</label>
              <input style={inputStyle} {...register('title')} placeholder="e.g. Lord, Chancellor, Elder" />
            </div>
          </div>

          {/* Role + Type */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Role</label>
              <input style={inputStyle} {...register('role')} placeholder="e.g. Merchant, Warlord, Spy" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select style={inputStyle} {...register('type', { setValueAs: v => v === '' ? undefined : v })}>
                <option value="">— Select —</option>
                <option value="Person">Person</option>
                <option value="Animal">Animal</option>
                <option value="Creature">Creature</option>
                <option value="Undead">Undead</option>
                <option value="Spirit">Spirit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Family + Relationship */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Family / House</label>
              <select
                style={inputStyle}
                {...register('familyId', { setValueAs: v => (v === '' || v == null ? undefined : positiveInt(v)) })}
              >
                <option value="">— None —</option>
                {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Relationship to House Riant</label>
              <select style={inputStyle} {...register('relationship', { setValueAs: v => v === '' ? undefined : v })}>
                <option value="">— Select —</option>
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Faction + Location */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Faction</label>
              <input style={inputStyle} {...register('faction')} placeholder="e.g. The Church, Royal Court" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input style={inputStyle} {...register('location')} placeholder="e.g. Capital, Unknown" />
            </div>
          </div>

          {/* Gender + Race */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Gender</label>
              <select style={inputStyle} {...register('gender', { setValueAs: v => (v === '' ? undefined : v) })}>
                <option value="">— Select —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Race</label>
              <select style={inputStyle} {...register('race', { setValueAs: v => v === '' ? undefined : v })}>
                <option value="">— Select —</option>
                <option value="Aoten">Aoten</option>
                <option value="Frell">Frell</option>
                <option value="Human">Human</option>
                <option value="Krell">Krell</option>
                <option value="Rataan">Rataan</option>
                <option value="Shim Thiir">Shim Thiir</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {watchedRace === 'Krell' && (
            <div className="form-group">
              <label>Krell Tribe</label>
              <select
                style={inputStyle}
                {...register('krellTribe', { setValueAs: v => v === '' ? undefined : v })}
              >
                <option value="">— Select —</option>
                {KRELL_TRIBES.map(tribe => (
                  <option key={tribe} value={tribe}>{tribe}</option>
                ))}
              </select>
            </div>
          )}

          {/* Age + Alive */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Age</label>
              <input style={inputStyle} type="number"
                {...register('age', { setValueAs: v => v === '' ? undefined : Number(v) })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select style={inputStyle} {...register('isAlive', { setValueAs: v => v === 'true' || v === true })}>
                <option value="true">Alive</option>
                <option value="false">Deceased</option>
              </select>
            </div>
          </div>

          {/* First Met + Last Seen */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>First Met</label>
              <input style={inputStyle} {...register('firstMet')} placeholder="e.g. 3rd of Brón: Bás, Dr-58" />
            </div>
            <div className="form-group">
              <label>Last Seen</label>
              <input style={inputStyle} {...register('lastSeen')} placeholder="e.g. 5th of Iianu, Dr-58" />
            </div>
          </div>

          {/* Full width fields */}
          <div className="form-group">
            <label>Appearance</label>
            <input style={inputStyle} {...register('appearance')} placeholder="Physical description, distinguishing features..." />
          </div>
          <div className="form-group">
            <label>Skills</label>
            <input style={inputStyle} {...register('skills')} placeholder="e.g. Diplomacy, Sword, Arcane magic" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea style={inputStyle} rows={3} {...register('notes')} placeholder="Campaign notes, secrets, relationships..." />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Figure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
