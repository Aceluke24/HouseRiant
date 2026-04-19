import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks'
import { buildingsApi, familiesApi, residentsApi } from '../../api'
import type { EstateTask, CreateTaskRequest } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'
import CalendarDatePicker from '../CalendarDatePicker'

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

const STATUSES = ['Planned', 'InProgress', 'Completed', 'Blocked'] as const
const STATUS_LABELS: Record<string, string> = { InProgress: 'In Progress' }
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const
const CATEGORIES = [
  'Construction', 'Recruitment', 'Procurement', 'Military',
  'Financial', 'Agricultural', 'Diplomatic', 'Other',
] as const

interface Props {
  task?: EstateTask
  onClose: () => void
}

export default function TaskForm({ task, onClose }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: buildings = [] } = useQuery({ queryKey: ['buildings'], queryFn: buildingsApi.getAll })
  const { data: families = [] } = useQuery({ queryKey: ['families'], queryFn: familiesApi.getAll })
  const { data: residents = [] } = useQuery({ queryKey: ['residents'], queryFn: () => residentsApi.getAll() })

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateTaskRequest>({
    defaultValues: task
      ? {
          name: task.name,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
          category: task.category,
          costTin: task.costTin,
          paymentMethod: task.paymentMethod ?? '',
          paymentNotes: task.paymentNotes ?? '',
          targetDate: task.targetDate ?? '',
          completedDate: task.completedDate ?? '',
          requirements: task.requirements ?? '',
          outcome: task.outcome ?? '',
          notes: task.notes ?? '',
          buildingId: task.buildingId,
          assignedFamilyId: task.assignedFamilyId,
          assignedResidentId: task.assignedResidentId,
        }
      : {
          status: 'Planned',
          priority: 'Medium',
          category: 'Other',
        },
  })

  const onSubmit = async (raw: CreateTaskRequest) => {
    setSubmitError(null)
    const payload: CreateTaskRequest = {
      name: trimToUndefined(raw.name) ?? '',
      description: trimToUndefined(raw.description),
      status: raw.status,
      priority: raw.priority,
      category: raw.category,
      costTin: finiteNumber(raw.costTin),
      paymentMethod: trimToUndefined(raw.paymentMethod),
      paymentNotes: trimToUndefined(raw.paymentNotes),
      targetDate: trimToUndefined(raw.targetDate),
      completedDate: trimToUndefined(raw.completedDate),
      requirements: trimToUndefined(raw.requirements),
      outcome: trimToUndefined(raw.outcome),
      notes: trimToUndefined(raw.notes),
      buildingId: finiteNumber(raw.buildingId) ?? undefined,
      assignedFamilyId: finiteNumber(raw.assignedFamilyId) ?? undefined,
      assignedResidentId: finiteNumber(raw.assignedResidentId) ?? undefined,
    }
    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, data: payload })
      } else {
        await createTask.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setSubmitError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Add Task'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          {submitError && <div className="form-submit-error">{submitError}</div>}

          <div className="form-group">
            <label>Name *</label>
            <input type="text" {...register('name', { required: 'Name is required' })} />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} {...register('description')} />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Status</label>
              <select {...register('status')}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select {...register('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Category</label>
              <select {...register('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cost (tin)</label>
              <input type="number" step="0.01" min="0" {...register('costTin')} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Payment Method</label>
              <input type="text" {...register('paymentMethod')} />
            </div>
            <div className="form-group">
              <label>Payment Notes</label>
              <input type="text" {...register('paymentNotes')} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Target Date</label>
              <Controller
                name="targetDate"
                control={control}
                render={({ field }) => (
                  <CalendarDatePicker
                    value={field.value ?? ''}
                    onChange={v => field.onChange(v ?? '')}
                  />
                )}
              />
            </div>
            <div className="form-group">
              <label>Completed Date</label>
              <Controller
                name="completedDate"
                control={control}
                render={({ field }) => (
                  <CalendarDatePicker
                    value={field.value ?? ''}
                    onChange={v => field.onChange(v ?? '')}
                  />
                )}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Requirements</label>
            <textarea rows={2} {...register('requirements')} />
          </div>

          <div className="form-group">
            <label>Outcome</label>
            <textarea rows={2} {...register('outcome')} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} {...register('notes')} />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Building</label>
              <select {...register('buildingId')}>
                <option value="">— None —</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Assigned Family</label>
              <select {...register('assignedFamilyId')}>
                <option value="">— None —</option>
                {families.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Assigned Resident</label>
            <select {...register('assignedResidentId')}>
              <option value="">— None —</option>
              {residents.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
