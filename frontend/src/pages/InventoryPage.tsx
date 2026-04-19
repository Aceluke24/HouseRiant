import { useEffect, useMemo, useState } from 'react'
import { useInventory, useDeleteInventoryItem } from '../hooks/useInventory'
import InventoryForm from '../components/inventory/InventoryForm'
import InventoryDetail from '../components/inventory/InventoryDetail'
import ConfirmModal from '../components/ConfirmModal'
import type { InventoryItem, InventoryCategory } from '../types'

const CATEGORIES: InventoryCategory[] = [
  'Animals', 'Armor', 'Clothing', 'Documents', 'Equipment',
  'Food', 'Materials', 'Medicine', 'MagicItems', 'Tools',
  'Valuables', 'Weapons', 'Other',
]

const CATEGORY_LABELS: Partial<Record<InventoryCategory, string>> = {
  MagicItems: 'Magic Items',
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilters, setCategoryFilters] = useState<InventoryCategory[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<InventoryItem | undefined>()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const { data: allItems = [], isLoading } = useInventory({ search: search || undefined })
  const deleteItem = useDeleteInventoryItem()

  // Client-side category filter (multi-select)
  const items = useMemo(() => {
    if (categoryFilters.length === 0) return allItems
    return allItems.filter(i => categoryFilters.includes(i.category))
  }, [allItems, categoryFilters])

  const toggleCategory = (c: InventoryCategory) =>
    setCategoryFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  // Derive selected from live data so edits reflect immediately
  const selected = selectedId != null ? items.find(i => i.id === selectedId) ?? null : null

  // Close panel if selected item is filtered out
  useEffect(() => {
    if (selectedId != null && !items.some(i => i.id === selectedId)) {
      setSelectedId(null)
    }
  }, [items, selectedId])

  // Stats: total items and total quantity
  const stats = useMemo(() => ({
    totalItems: items.length,
    totalQty: items.reduce((sum, i) => sum + i.quantity, 0),
    totalValue: items.reduce((sum, i) => sum + (i.estimatedValue ?? 0), 0),
  }), [items])

  const handleEdit = (item: InventoryItem) => { setEditTarget(item); setShowForm(true) }
  const handleDelete = (id: number) => setConfirmDeleteId(id)
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteItem.mutateAsync(confirmDeleteId)
    if (selectedId === confirmDeleteId) setSelectedId(null)
    setConfirmDeleteId(null)
  }
  const handleFormClose = () => { setShowForm(false); setEditTarget(undefined) }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Inventory</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Item</button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="stats-row">
          <div className="stat-card stat-card-info">
            <span className="stat-value">{stats.totalItems}</span>
            <span className="stat-label">Item Types</span>
          </div>
          <div className="stat-card stat-card-gold">
            <span className="stat-value">{stats.totalQty}</span>
            <span className="stat-label">Total Units</span>
          </div>
          <div className="stat-card stat-card-success">
            <span className="stat-value">{stats.totalValue.toLocaleString()}</span>
            <span className="stat-label">Est. Value (tin)</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name or description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="filter-chips">
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
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>

        <span className="filter-count">{items.length} items</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="loading">Consulting the stores…</div>
      ) : (
        <div className="list-layout">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Location</th>
                  <th>Est. Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr
                    key={item.id}
                    className={selected?.id === item.id ? 'row-selected' : ''}
                    onClick={() => setSelectedId(prev => prev === item.id ? null : item.id)}
                  >
                    <td className="name-cell">{item.name}</td>
                    <td>
                      <span className="badge badge-neutral">{item.category}</span>
                    </td>
                    <td style={{ color: 'var(--ink-mid)' }}>
                      {item.unit ? `${item.quantity} ${item.unit}` : item.quantity}
                    </td>
                    <td>
                      {item.condition ? (
                        <span className={`badge badge-${item.condition.toLowerCase()}`}>
                          {item.condition}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--ink-faint)' }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--ink-muted)' }}>{item.location ?? '—'}</td>
                    <td style={{ color: 'var(--ink-mid)' }}>
                      {item.estimatedValue != null ? `${item.estimatedValue} tin` : '—'}
                    </td>
                    <td className="actions-cell" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" title="Edit" onClick={() => handleEdit(item)}>✏</button>
                      <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-row">No items found in the stores.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selected && (
            <InventoryDetail
              item={selected}
              onEdit={() => handleEdit(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      )}

      {showForm && <InventoryForm item={editTarget} onClose={handleFormClose} />}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Delete Item"
          message="Permanently delete this item from inventory? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
