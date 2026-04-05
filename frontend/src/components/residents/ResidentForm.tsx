import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useCreateResident, useUpdateResident } from '../../hooks/useResidents'
import { familiesApi } from '../../api'
import type { Resident, CreateResidentRequest, Gender, PersonStatus } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'
import { useRef, useState } from 'react'

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

/** Sends only name + status plus optional fields; blanks and invalid numbers become omitted (undefined). */
function buildResidentPayload(raw: CreateResidentRequest): CreateResidentRequest {
  const name = trimToUndefined(raw.name) ?? ''
  const status = raw.status as PersonStatus
  let statusOther = trimToUndefined(raw.statusOther)
  if (status !== 'Other') statusOther = undefined

  return {
    name,
    status,
    statusOther,
    title: trimToUndefined(raw.title),
    role: trimToUndefined(raw.role),
    type: trimToUndefined(raw.type),
    race: trimToUndefined(raw.race),
    gender: raw.gender == null ? undefined : (raw.gender as Gender),
    age: finiteNumber(raw.age),
    dailyPayRate: finiteNumber(raw.dailyPayRate),
    landOwned: trimToUndefined(raw.landOwned),
    appearance: trimToUndefined(raw.appearance),
    skills: trimToUndefined(raw.skills),
    troopType: trimToUndefined(raw.troopType),
    levelOfRole: trimToUndefined(raw.levelOfRole),
    imageUrl: trimToUndefined(raw.imageUrl),
    notes: trimToUndefined(raw.notes),
    familyId: positiveInt(raw.familyId),
  }
}

interface Props {
  resident?: Resident
  onClose: () => void
}

const STATUSES = ['Resident', 'HiredHelp', 'Visitor', 'Seasonal', 'Blank', 'Din', 'Other']
const STATUS_LABELS: Record<string, string> = { HiredHelp: 'Hired Help' }

function PortraitUpload({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>(
    value ? `http://localhost:4000${value}` : undefined
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
      const res = await fetch('http://localhost:4000/api/uploads/portrait', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Upload failed')
      }
      const { url } = await res.json()
      setPreview(`http://localhost:4000${url}`)
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

export default function ResidentForm({ resident, onClose }: Props) {
  const isEdit = !!resident
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateResidentRequest>({
    defaultValues: resident ? {
      name: resident.name, status: resident.status, statusOther: resident.statusOther,
      title: resident.title, role: resident.role, type: resident.type, race: resident.race,
      gender: resident.gender, age: resident.age, dailyPayRate: resident.dailyPayRate,
      landOwned: resident.landOwned, appearance: resident.appearance, skills: resident.skills,
      troopType: resident.troopType, levelOfRole: resident.levelOfRole,
      notes: resident.notes, imageUrl: resident.imageUrl, familyId: resident.familyId,
    } : { status: 'Resident' },
  })

  const createResident = useCreateResident()
  const updateResident = useUpdateResident()
  const { data: families = [] } = useQuery({ queryKey: ['families'], queryFn: () => familiesApi.getAll() })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const watchedStatus = watch('status')
  const watchedImage = watch('imageUrl')
  const isPending = createResident.isPending || updateResident.isPending

  const onSubmit = async (data: CreateResidentRequest) => {
    setSubmitError(null)
    const payload = buildResidentPayload(data)
    try {
      if (isEdit && resident) {
        await updateResident.mutateAsync({ id: resident.id, data: payload })
      } else {
        await createResident.mutateAsync(payload)
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
          <h2>{isEdit ? `Edit ${resident.name}` : 'Add Resident'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="modal-form"
          onChange={() => setSubmitError(null)}
        >

          {submitError && (
            <div className="form-submit-error" role="alert">
              {submitError}
            </div>
          )}

          {/* Register imageUrl so upload value is always part of submit payload */}
          <input type="hidden" {...register('imageUrl')} />

          {/* Portrait */}
          <div className="form-group">
            <label>Portrait</label>
            <PortraitUpload
              value={watchedImage}
              onChange={url =>
                setValue('imageUrl', url || undefined, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
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
                  validate: (v) =>
                    (v != null && String(v).trim() !== '') || 'Name is required',
                })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label>Title</label>
              <input style={inputStyle} {...register('title')} placeholder="Neophyte, Scholar, Free Scholar, Provost, Master, Grand Master" />
            </div>
          </div>

          {/* Status + Role */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Status</label>
              <select style={inputStyle} {...register('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <input style={inputStyle} {...register('role')} placeholder="e.g. Farmer, Guard, Steward" />
            </div>
          </div>

          {watchedStatus === 'Other' && (
            <div className="form-group">
              <label>Specify Status</label>
              <input style={inputStyle} {...register('statusOther')} />
            </div>
          )}

          {/* Family + Gender */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Family / Allegiance</label>
              <select
                style={inputStyle}
                {...register('familyId', {
                  setValueAs: (v) => (v === '' || v == null ? undefined : positiveInt(v)),
                })}
              >
                <option value="">— None —</option>
                {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                style={inputStyle}
                {...register('gender', {
                  setValueAs: (v) => (v === '' || v == null ? undefined : v),
                })}
              >
                <option value="">— Select —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Age + Race */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Age</label>
              <input style={inputStyle} type="number"
                {...register('age', { setValueAs: v => v === '' ? undefined : Number(v) })} />
            </div>
            <div className="form-group">
              <label>Race</label>
              <input style={inputStyle} {...register('race')} placeholder="e.g. Human, Avintaali, Dwarf" />
            </div>
          </div>

          {/* Type + Daily Pay */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Type</label>
              <select
                style={inputStyle}
                {...register('type', {
                  setValueAs: (v) => (v === '' || v == null ? undefined : v),
                })}
              >
                <option value="">— Select —</option>
                <option value="Human">Human</option>
                <option value="Animal">Animal</option>
                <option value="Creature">Creature</option>
                <option value="Undead">Undead</option>
                <option value="Spirit">Spirit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Daily Pay Rate (tin)</label>
              <input style={inputStyle} type="number" step="0.01"
                {...register('dailyPayRate', { setValueAs: v => v === '' ? undefined : Number(v) })} />
            </div>
          </div>

          {/* Land + Troop Type */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Land Owned</label>
              <input style={inputStyle} {...register('landOwned')} placeholder="e.g. 15 acres" />
            </div>
            <div className="form-group">
              <label>Troop Type</label>
              <input style={inputStyle} {...register('troopType')} placeholder="e.g. Bowman, Knight, Skirmisher" />
            </div>
          </div>

          {/* Level of Role */}
          <div className="form-grid-2">
            <div className="form-group">
              <label>Level of Role</label>
              <input style={inputStyle} {...register('levelOfRole')} placeholder="e.g. Captain, Neophyte, Master" />
            </div>
          </div>

          {/* Full width */}
          <div className="form-group">
            <label>Appearance</label>
            <input style={inputStyle} {...register('appearance')} placeholder="Physical description, distinguishing features..." />
          </div>
          <div className="form-group">
            <label>Skills</label>
            <input style={inputStyle} {...register('skills')} placeholder="e.g. Sword, Bowman / 50 arrows, Farming" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea style={inputStyle} rows={3} {...register('notes')} placeholder="Campaign notes, secrets, relationships..." />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
