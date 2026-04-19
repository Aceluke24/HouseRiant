import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useFinances, useUpdateFinances,
  useIncomeSources, useCreateIncomeSource, useUpdateIncomeSource, useDeleteIncomeSource,
} from '../hooks/useFinances'
import { useGameState } from '../hooks/useGameState'
import ConfirmModal from '../components/ConfirmModal'
import type { EstateFinances, IncomeSource, CreateIncomeSourceRequest } from '../types'

// ── Helpers ───────────────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function formatGameDate(year: number, season: string | undefined, week: string | undefined, day: number): string {
  if (!season) return '—'
  const weekPart = week ? `${week} of ` : ''
  return `${ordinal(day)} of ${weekPart}${season}, Dr-${year}`
}

// ── Helpers ───────────────────────────────────────────────

function tin(n: number): string {
  return n.toLocaleString() + ' tin'
}

function netColor(n: number): string {
  if (n > 0) return 'var(--success)'
  if (n < 0) return 'var(--danger)'
  return 'var(--ink)'
}

// ── Edit Finances Modal ───────────────────────────────────

interface EditFinancesModalProps {
  finances: EstateFinances
  onClose: () => void
}

type FinancesFormValues = {
  bankBalanceTin: number
  moneyOnHandTin: number
  dorrinFundsTin: number
  loanAmountTin: number
  taxRateTin: number
  taxNotes: string
}

function EditFinancesModal({ finances, onClose }: EditFinancesModalProps) {
  const update = useUpdateFinances()
  const { register, handleSubmit, formState: { errors } } = useForm<FinancesFormValues>({
    defaultValues: {
      bankBalanceTin: finances.bankBalanceTin,
      moneyOnHandTin: finances.moneyOnHandTin,
      dorrinFundsTin: finances.dorrinFundsTin,
      loanAmountTin:  finances.loanAmountTin,
      taxRateTin:     finances.taxRateTin,
      taxNotes:       finances.taxNotes ?? '',
    },
  })

  const onSubmit = async (values: FinancesFormValues) => {
    await update.mutateAsync({
      ...finances,
      bankBalanceTin: Number(values.bankBalanceTin),
      moneyOnHandTin: Number(values.moneyOnHandTin),
      dorrinFundsTin: Number(values.dorrinFundsTin),
      loanAmountTin:  Number(values.loanAmountTin),
      taxRateTin:     Number(values.taxRateTin),
      taxNotes:       values.taxNotes || undefined,
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Estate Finances</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bank Balance (tin)</label>
              <input className="form-input" type="number" step="any" {...register('bankBalanceTin', { required: true })} />
              {errors.bankBalanceTin && <span className="form-error">Required</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Money on Hand (tin)</label>
              <input className="form-input" type="number" step="any" {...register('moneyOnHandTin', { required: true })} />
              {errors.moneyOnHandTin && <span className="form-error">Required</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dorrin Funds (tin)</label>
              <input className="form-input" type="number" step="any" {...register('dorrinFundsTin', { required: true })} />
              {errors.dorrinFundsTin && <span className="form-error">Required</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Loan Amount (tin)</label>
              <input className="form-input" type="number" step="any" {...register('loanAmountTin', { required: true })} />
              {errors.loanAmountTin && <span className="form-error">Required</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tax Rate (tin)</label>
              <input className="form-input" type="number" step="any" {...register('taxRateTin', { required: true })} />
              {errors.taxRateTin && <span className="form-error">Required</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tax Notes</label>
            <textarea className="form-textarea" rows={2} {...register('taxNotes')} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Income Source Modal ───────────────────────────────────

interface IncomeSourceModalProps {
  source?: IncomeSource
  onClose: () => void
}

function IncomeSourceModal({ source, onClose }: IncomeSourceModalProps) {
  const create = useCreateIncomeSource()
  const update = useUpdateIncomeSource()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateIncomeSourceRequest>({
    defaultValues: {
      name:          source?.name ?? '',
      dailyYieldTin: source?.dailyYieldTin ?? 0,
      isActive:      source?.isActive ?? true,
      notes:         source?.notes ?? '',
    },
  })

  const onSubmit = async (values: CreateIncomeSourceRequest) => {
    const payload: CreateIncomeSourceRequest = {
      name:          values.name,
      dailyYieldTin: Number(values.dailyYieldTin),
      isActive:      values.isActive,
      notes:         values.notes || undefined,
    }
    if (source) {
      await update.mutateAsync({ id: source.id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = create.isPending || update.isPending

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{source ? 'Edit Income Source' : 'Add Income Source'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Daily Yield (tin)</label>
              <input className="form-input" type="number" step="any" {...register('dailyYieldTin', { required: true })} />
              {errors.dailyYieldTin && <span className="form-error">Required</span>}
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end', paddingTop: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-heading)', fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" {...register('isActive')} style={{ width: 15, height: 15 }} />
                Active
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={2} {...register('notes')} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : source ? 'Save Changes' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Stat card (read-only display) ─────────────────────────

function StatCard({ label, value, highlight, textColor }: {
  label: string; value: string; highlight?: boolean; textColor?: string
}) {
  return (
    <div style={{
      background: highlight ? 'var(--gold-ghost)' : 'var(--white)',
      padding: '0.9rem 1.25rem',
    }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 20, color: textColor ?? 'var(--ink)', fontWeight: highlight ? 600 : 400 }}>
        {value}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function FinancesPage() {
  const [showEditFinances, setShowEditFinances]   = useState(false)
  const [showIncomeForm, setShowIncomeForm]       = useState(false)
  const [editIncomeTarget, setEditIncomeTarget]   = useState<IncomeSource | undefined>()
  const [confirmDeleteId, setConfirmDeleteId]     = useState<number | null>(null)

  const { data: finances, isLoading: loadingFinances } = useFinances()
  const { data: gameState } = useGameState()
  const { data: incomeSources = [], isLoading: loadingIncome } = useIncomeSources()
  const deleteSource = useDeleteIncomeSource()

  const totalLiquid = useMemo(() => {
    if (!finances) return 0
    return finances.bankBalanceTin + finances.moneyOnHandTin + finances.dorrinFundsTin
  }, [finances])

  const netWorth = useMemo(() => {
    if (!finances) return 0
    return totalLiquid - finances.loanAmountTin
  }, [finances, totalLiquid])

  const totalDailyIncome = useMemo(
    () => incomeSources.filter(s => s.isActive).reduce((sum, s) => sum + s.dailyYieldTin, 0),
    [incomeSources],
  )

  const handleEditIncome  = (s: IncomeSource) => { setEditIncomeTarget(s); setShowIncomeForm(true) }
  const handleCloseIncome = () => { setShowIncomeForm(false); setEditIncomeTarget(undefined) }
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteSource.mutateAsync(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Finances</h1>
      </div>

      {/* ── Estate Snapshot ─────────────────────────────── */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--ink-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Estate Snapshot
          </h2>
          {finances && (
            <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 14px' }} onClick={() => setShowEditFinances(true)}>
              Edit Finances
            </button>
          )}
        </div>

        {loadingFinances ? (
          <div className="loading">Loading treasury records…</div>
        ) : !finances ? (
          <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>No financial record found.</p>
        ) : (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

            {/* Date & Season banner — sourced from GameState, updated on the Calendar page */}
            <div style={{ background: 'var(--blue-deep)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--gold-light)', letterSpacing: '0.04em' }}>
                {gameState ? formatGameDate(gameState.currentYear, gameState.currentSeason, gameState.currentWeek, gameState.currentDay) : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                change date on the Calendar page
              </span>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, background: 'var(--border)' }}>
              <StatCard label="Bank Balance"  value={tin(finances.bankBalanceTin)} />
              <StatCard label="Money on Hand" value={tin(finances.moneyOnHandTin)} />
              <StatCard label="Dorrin Funds"  value={tin(finances.dorrinFundsTin)} />
              <StatCard label="Total Liquid"  value={tin(totalLiquid)} highlight />
              <StatCard label="Loan Amount"   value={tin(finances.loanAmountTin)} textColor={finances.loanAmountTin > 0 ? 'var(--danger)' : undefined} />
              <StatCard label="Net Worth"     value={tin(netWorth)} textColor={netColor(netWorth)} highlight />
              <StatCard label="Tax Rate"      value={tin(finances.taxRateTin)} />
              <StatCard label="Daily Income"  value={tin(totalDailyIncome)} textColor={totalDailyIncome > 0 ? 'var(--success)' : undefined} />
            </div>

            {/* Tax notes */}
            {finances.taxNotes && (
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--parchment)' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 8 }}>Tax Notes</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-mid)' }}>{finances.taxNotes}</span>
              </div>
            )}

            {/* Last updated */}
            <div style={{ padding: '0.5rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--parchment)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-muted)' }}>
                Last updated: {new Date(finances.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── Income Sources ───────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--ink-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Income Sources
          </h2>
          <button className="btn-primary" style={{ fontSize: 12, padding: '4px 14px' }} onClick={() => setShowIncomeForm(true)}>
            + Add Income Source
          </button>
        </div>

        {loadingIncome ? (
          <div className="loading">Loading income records…</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Daily Yield</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {incomeSources.map(source => (
                  <tr key={source.id}>
                    <td className="name-cell">{source.name}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{tin(source.dailyYieldTin)}</td>
                    <td>
                      <span className={`badge ${source.isActive ? 'badge-resident' : 'badge-other'}`}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--ink-muted)', fontStyle: source.notes ? 'normal' : 'italic' }}>
                      {source.notes ?? '—'}
                    </td>
                    <td className="actions-cell">
                      <button className="btn-icon" title="Edit" onClick={() => handleEditIncome(source)}>✏</button>
                      <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => setConfirmDeleteId(source.id)}>✕</button>
                    </td>
                  </tr>
                ))}
                {incomeSources.length === 0 && (
                  <tr><td colSpan={5} className="empty-row">No income sources recorded.</td></tr>
                )}
              </tbody>
              {incomeSources.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--gold-ghost)', borderTop: '2px solid var(--border-gold)' }}>
                    <td colSpan={2} style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-heading)', fontSize: 12 }}>
                      Total active daily income:&nbsp;
                      <strong style={{ color: 'var(--success)', fontSize: 14 }}>{tin(totalDailyIncome)}</strong>
                    </td>
                    <td colSpan={3} style={{ padding: '0.6rem 1rem', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-muted)', textAlign: 'right' }}>
                      {incomeSources.filter(s => s.isActive).length} of {incomeSources.length} sources active
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </section>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showEditFinances && finances && (
        <EditFinancesModal finances={finances} onClose={() => setShowEditFinances(false)} />
      )}

      {showIncomeForm && (
        <IncomeSourceModal source={editIncomeTarget} onClose={handleCloseIncome} />
      )}

      {confirmDeleteId != null && (
        <ConfirmModal
          title="Remove Income Source"
          message="Remove this income source from the records? This cannot be undone."
          confirmLabel="Remove"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
