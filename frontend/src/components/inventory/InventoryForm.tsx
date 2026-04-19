import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateInventoryItem, useUpdateInventoryItem } from '../../hooks/useInventory'
import type { InventoryItem, CreateInventoryItemRequest, InventoryCategory, InventoryCondition } from '../../types'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'

const CATEGORIES: InventoryCategory[] = [
  'Animals', 'Armor', 'Clothing', 'Documents', 'Equipment',
  'Food', 'Materials', 'Medicine', 'MagicItems', 'Tools',
  'Valuables', 'Weapons', 'Other',
]

const CATEGORY_LABELS: Partial<Record<InventoryCategory, string>> = {
  MagicItems: 'Magic Items',
}

const CONDITIONS: InventoryCondition[] = ['Poor', 'Fair', 'Good', 'Excellent']

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

interface Props {
  item?: InventoryItem
  onClose: () => void
}

export default function InventoryForm({ item, onClose }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createItem = useCreateInventoryItem()
  const updateItem = useUpdateInventoryItem()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateInventoryItemRequest>({
    defaultValues: item
      ? {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit ?? '',
          category: item.category,
          condition: item.condition,
          description: item.description ?? '',
          estimatedValue: item.estimatedValue,
          location: item.location ?? '',
          notes: item.notes ?? '',
        }
      : {
          quantity: 1,
          category: 'Other',
        },
  })

  const onSubmit = async (raw: CreateInventoryItemRequest) => {
    setSubmitError(null)
    const payload: CreateInventoryItemRequest = {
      name: trimToUndefined(raw.name) ?? '',
      quantity: finiteNumber(raw.quantity) ?? 0,
      unit: trimToUndefined(raw.unit),
      category: raw.category,
      condition: raw.condition || undefined,
      description: trimToUndefined(raw.description),
      estimatedValue: finiteNumber(raw.estimatedValue),
      location: trimToUndefined(raw.location),
      notes: trimToUndefined(raw.notes),
    }
    try {
      if (item) {
        await updateItem.mutateAsync({ id: item.id, data: payload })
      } else {
        await createItem.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setSubmitError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add Item'}</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          {submitError && <div className="form-submit-error">{submitError}</div>}

          <div className="form-group">
            <label>Name *</label>
            <input type="text" {...register('name', { required: 'Name is required' })} />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="0"
                step="1"
                {...register('quantity', { required: 'Quantity is required', min: { value: 0, message: 'Must be 0 or more' } })}
              />
              {errors.quantity && <span className="form-error">{errors.quantity.message}</span>}
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input type="text" placeholder="e.g. lbs, units, barrels" {...register('unit')} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Category</label>
              <select {...register('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select {...register('condition')}>
                <option value="">— None —</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Location</label>
              <input type="text" {...register('location')} />
            </div>
            <div className="form-group">
              <label>Est. Value (tin)</label>
              <input type="number" min="0" step="0.01" {...register('estimatedValue')} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows={2} {...register('description')} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} {...register('notes')} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
