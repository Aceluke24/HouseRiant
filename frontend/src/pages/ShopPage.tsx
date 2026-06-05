import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useShopItems, useCreateShopItem, useUpdateShopItem, useDeleteShopItem } from '../hooks/useShop'
import ConfirmModal from '../components/ConfirmModal'
import type { ShopItem, CreateShopItemRequest } from '../types'

const QUALITY_OPTIONS = [
  { label: 'Very Poor', multiplier: 0.5 },
  { label: 'Poor',      multiplier: 0.7 },
  { label: 'Common',    multiplier: 1.0 },
  { label: 'Good',      multiplier: 2.0 },
  { label: 'Exceptional', multiplier: 3.0 },
  { label: 'Legendary', multiplier: 5.0 },
] as const

const LOCATION_OPTIONS = [
  { label: 'Rural',       multiplier: 0.5 },
  { label: 'Standard',    multiplier: 1.0 },
  { label: 'Border Town', multiplier: 1.25 },
  { label: 'Capital',     multiplier: 1.5 },
] as const

interface EstimateLine {
  id: number
  itemName: string
  quality: string
  location: string
  qty: number
  baseCost: number
  subtotal: number
}

// ── Form modal ─────────────────────────────────────────────────────────────────

interface ShopItemFormProps {
  initial?: ShopItem
  onClose: () => void
  onSave: (data: CreateShopItemRequest) => void
  saving: boolean
}

function ShopItemForm({ initial, onClose, onSave, saving }: ShopItemFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateShopItemRequest>({
    defaultValues: initial
      ? {
          name: initial.name,
          category: initial.category,
          baseCostTin: initial.baseCostTin,
          weightLbs: initial.weightLbs ?? undefined,
          description: initial.description ?? '',
          notes: initial.notes ?? '',
          defaultMaterial: initial.defaultMaterial ?? '',
        }
      : { baseCostTin: 0 },
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Item' : 'Add Item'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="modal-form">

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. Longsword"
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" {...register('category')} placeholder="e.g. Weapons" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Base Cost (tin)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min={0}
                {...register('baseCostTin', { valueAsNumber: true })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (lbs)</label>
              <input
                className="form-input"
                type="number"
                step="0.001"
                min={0}
                {...register('weightLbs', { valueAsNumber: true })}
                placeholder="optional"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Default Material</label>
            <input
              className="form-input"
              {...register('defaultMaterial')}
              placeholder="e.g. Steel, Leather"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              {...register('description')}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              {...register('notes')}
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function ShopDetail({
  item,
  onEdit,
  onDelete,
  onClose,
}: {
  item: ShopItem
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2 className="detail-name">{item.name}</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginTop: '2px' }}>{item.category}</p>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-section">
        <div className="detail-grid">
          <div className="detail-field">
            <span className="detail-label">Base Cost</span>
            <span className="detail-value" style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
              {item.baseCostTin.toLocaleString()} tin
            </span>
          </div>
          {item.weightLbs != null && (
            <div className="detail-field">
              <span className="detail-label">Weight</span>
              <span className="detail-value">{item.weightLbs} lbs</span>
            </div>
          )}
          {item.defaultMaterial && (
            <div className="detail-field">
              <span className="detail-label">Default Material</span>
              <span className="detail-value">{item.defaultMaterial}</span>
            </div>
          )}
        </div>
      </div>

      {item.description && (
        <div className="detail-section">
          <span className="detail-label">Description</span>
          <p className="detail-notes">{item.description}</p>
        </div>
      )}

      {item.notes && (
        <div className="detail-section">
          <span className="detail-label">Notes</span>
          <p className="detail-notes">{item.notes}</p>
        </div>
      )}

      <div className="detail-actions">
        <button className="btn-secondary" onClick={onEdit}>Edit</button>
        <button className="btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { data: shopItems = [], isLoading, isError } = useShopItems()
  const createShopItem = useCreateShopItem()
  const updateShopItem = useUpdateShopItem()
  const deleteShopItem = useDeleteShopItem()

  // Calculator state
  const [calcItemId, setCalcItemId] = useState<number | null>(null)
  const [qualityLabel, setQualityLabel] = useState<string>('Common')
  const [locationLabel, setLocationLabel] = useState<string>('Standard')
  const [qty, setQty] = useState<number>(1)
  const [estimate, setEstimate] = useState<EstimateLine[]>([])

  // Table / panel state
  const [search, setSearch] = useState('')
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<ShopItem | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const selected = useMemo(() => shopItems.find(i => i.id === selectedId) ?? null, [shopItems, selectedId])
  const calcItem = useMemo(() => shopItems.find(i => i.id === calcItemId) ?? null, [shopItems, calcItemId])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(shopItems.map(i => i.category))).sort()
    return cats
  }, [shopItems])

  const filtered = useMemo(() => {
    return shopItems.filter(i => {
      const matchSearch = !search ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilters.length === 0 || categoryFilters.includes(i.category)
      return matchSearch && matchCat
    })
  }, [shopItems, search, categoryFilters])

  const qualityMult = QUALITY_OPTIONS.find(q => q.label === qualityLabel)?.multiplier ?? 1
  const locationMult = LOCATION_OPTIONS.find(l => l.label === locationLabel)?.multiplier ?? 1
  const calculatedPrice = calcItem
    ? calcItem.baseCostTin * qualityMult * locationMult * qty
    : 0

  function toggleCategory(cat: string) {
    if (cat === 'All') { setCategoryFilters([]); return }
    setCategoryFilters(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  function handleRowClick(item: ShopItem) {
    setSelectedId(selectedId === item.id ? null : item.id)
    setCalcItemId(item.id)
  }

  function addToEstimate() {
    if (!calcItem) return
    const line: EstimateLine = {
      id: Date.now(),
      itemName: calcItem.name,
      quality: qualityLabel,
      location: locationLabel,
      qty,
      baseCost: calcItem.baseCostTin,
      subtotal: calculatedPrice,
    }
    setEstimate(prev => [...prev, line])
  }

  const grandTotal = estimate.reduce((sum, line) => sum + line.subtotal, 0)

  function handleSave(data: CreateShopItemRequest) {
    const normalized: CreateShopItemRequest = {
      ...data,
      weightLbs: Number.isNaN(data.weightLbs) ? undefined : data.weightLbs,
    }
    if (editTarget) {
      updateShopItem.mutate({ id: editTarget.id, data: normalized }, {
        onSuccess: () => { setShowForm(false); setEditTarget(null) },
      })
    } else {
      createShopItem.mutate(normalized, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function openEdit(item: ShopItem) {
    setEditTarget(item)
    setShowForm(true)
    setSelectedId(null)
  }

  const confirmTarget = useMemo(() => shopItems.find(i => i.id === confirmDeleteId) ?? null, [shopItems, confirmDeleteId])

  return (
    <div className="page" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>

        <div className="page-header">
          <div>
            <h1>Shop</h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
              {shopItems.length} {shopItems.length === 1 ? 'item' : 'items'} in catalogue
            </p>
          </div>
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true) }}>
            + Add Item
          </button>
        </div>

        {/* ── Price Calculator ─────────────────────────────────── */}
        <section style={{
          background: 'var(--blue-ghost)',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '28px',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--blue-royal)', marginBottom: '16px' }}>
            Price Calculator
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Item</label>
              <select
                className="form-select"
                value={calcItemId ?? ''}
                onChange={e => setCalcItemId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">— Select item —</option>
                {shopItems.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.category})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Quality</label>
              <select
                className="form-select"
                value={qualityLabel}
                onChange={e => setQualityLabel(e.target.value)}
              >
                {QUALITY_OPTIONS.map(q => (
                  <option key={q.label} value={q.label}>{q.label} (×{q.multiplier})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Location</label>
              <select
                className="form-select"
                value={locationLabel}
                onChange={e => setLocationLabel(e.target.value)}
              >
                {LOCATION_OPTIONS.map(l => (
                  <option key={l.label} value={l.label}>{l.label} (×{l.multiplier})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          {calcItem && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px 16px',
              background: 'var(--parchment)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius)',
              marginBottom: '12px',
            }}>
              <div>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Base cost: </span>
                <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--ink)' }}>
                  {calcItem.baseCostTin.toLocaleString()} tin
                </span>
              </div>
              <div style={{ color: 'var(--ink-muted)', fontSize: '1rem' }}>→</div>
              <div>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>Final price: </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {calculatedPrice % 1 === 0
                    ? calculatedPrice.toLocaleString()
                    : calculatedPrice.toFixed(2)
                  } tin
                </span>
                {qty > 1 && (
                  <span style={{ color: 'var(--ink-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>
                    ({qty} × {((calcItem.baseCostTin * qualityMult * locationMult) % 1 === 0
                      ? (calcItem.baseCostTin * qualityMult * locationMult).toLocaleString()
                      : (calcItem.baseCostTin * qualityMult * locationMult).toFixed(2)
                    )})
                  </span>
                )}
              </div>
              <button className="btn-secondary" style={{ marginLeft: 'auto' }} onClick={addToEstimate}>
                + Add to Estimate
              </button>
            </div>
          )}

          {estimate.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--blue-royal)', color: 'var(--parchment)' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Item</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Quality</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Location</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Qty</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Subtotal</th>
                    <th style={{ width: 32 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.map(line => (
                    <tr key={line.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 10px' }}>{line.itemName}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--ink-muted)' }}>{line.quality}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--ink-muted)' }}>{line.location}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>{line.qty}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
                        {line.subtotal % 1 === 0
                          ? line.subtotal.toLocaleString()
                          : line.subtotal.toFixed(2)
                        }
                      </td>
                      <td style={{ padding: '4px' }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                          onClick={() => setEstimate(prev => prev.filter(l => l.id !== line.id))}
                          title="Remove"
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--parchment2)' }}>
                    <td colSpan={4} style={{ padding: '8px 10px', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--blue-royal)' }}>
                      Grand Total
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--gold)', fontWeight: 600 }}>
                      {grandTotal % 1 === 0
                        ? grandTotal.toLocaleString()
                        : grandTotal.toFixed(2)
                      } tin
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              <div style={{ padding: '8px 10px', textAlign: 'right' }}>
                <button className="btn-secondary" onClick={() => setEstimate([])}>Clear Estimate</button>
              </div>
            </div>
          )}
        </section>

        {/* ── Item Table ───────────────────────────────────────── */}
        <div className="toolbar" style={{ marginBottom: '16px' }}>
          <input
            className="search-input"
            placeholder="Search items, categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="chip-row">
            <button
              className={`chip ${categoryFilters.length === 0 ? 'chip-active' : ''}`}
              onClick={() => toggleCategory('All')}
            >All</button>
            {categories.map(c => (
              <button
                key={c}
                className={`chip ${categoryFilters.includes(c) ? 'chip-active' : ''}`}
                onClick={() => toggleCategory(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {isLoading && <p style={{ color: 'var(--ink-muted)' }}>Loading items…</p>}
        {isError && <p style={{ color: '#cf5b5b' }}>Failed to load items.</p>}

        {!isLoading && !isError && (
          filtered.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-muted)' }}>
                <p>{search || categoryFilters.length > 0 ? 'No items match your filters.' : 'No items in catalogue yet.'}</p>
              </div>
            )
            : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Base Cost (tin)</th>
                    <th>Weight (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      style={{ cursor: 'pointer' }}
                      className={selectedId === item.id ? 'row-selected' : ''}
                    >
                      <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ color: 'var(--ink-muted)' }}>{item.category}</td>
                      <td style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                        {item.baseCostTin.toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--ink-muted)' }}>
                        {item.weightLbs != null ? item.weightLbs : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>

      {selected && (
        <ShopDetail
          item={selected}
          onEdit={() => openEdit(selected)}
          onDelete={() => setConfirmDeleteId(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showForm && (
        <ShopItemForm
          initial={editTarget ?? undefined}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSave={handleSave}
          saving={createShopItem.isPending || updateShopItem.isPending}
        />
      )}

      {confirmTarget && (
        <ConfirmModal
          title="Delete Item"
          message={`Delete ${confirmTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            deleteShopItem.mutate(confirmTarget.id, {
              onSuccess: () => { setSelectedId(null); setConfirmDeleteId(null) },
            })
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
