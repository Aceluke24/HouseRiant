import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useFinances, useUpdateFinances,
  useIncomeSources, useCreateIncomeSource, useUpdateIncomeSource, useDeleteIncomeSource,
} from '../hooks/useFinances'
import { useGameState } from '../hooks/useGameState'
import ConfirmModal from '../components/ConfirmModal'
import type { EstateFinances, IncomeSource, CreateIncomeSourceRequest } from '../types'

// ── Currency helpers ──────────────────────────────────────

const COINS = ['tin', 'copper', 'silver', 'gold', 'iridium'] as const
type CoinUnit = typeof COINS[number]
const COIN_TO_TIN: Record<CoinUnit, number> = { tin: 1, copper: 10, silver: 100, gold: 1000, iridium: 10000 }

function formatAmount(tinValue: number, unit: CoinUnit): string {
  const converted = tinValue / COIN_TO_TIN[unit]
  const formatted = parseFloat(converted.toFixed(4)).toLocaleString(undefined, { maximumFractionDigits: 4 })
  return `${formatted} ${unit}`
}

function getStoredUnit(): CoinUnit {
  const stored = localStorage.getItem('finances-display-unit')
  if (stored && COINS.includes(stored as CoinUnit)) return stored as CoinUnit
  return 'tin'
}

// ── Misc helpers ──────────────────────────────────────────

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

// ── Adjust Balance Modal ──────────────────────────────────

interface AdjustBalanceModalProps {
  label: string
  currentTin: number
  displayUnit: CoinUnit
  onClose: () => void
  onSave: (newTin: number) => void
}

function AdjustBalanceModal({ label, currentTin, displayUnit, onClose, onSave }: AdjustBalanceModalProps) {
  const [mode, setMode] = useState<'add' | 'subtract'>('add')
  const [iridium, setIridium] = useState('')
  const [gold,    setGold]    = useState('')
  const [silver,  setSilver]  = useState('')
  const [copper,  setCopper]  = useState('')
  const [tin,     setTin]     = useState('')

  const parse = (v: string) => Math.max(0, Number(v) || 0)
  const coinTin = parse(iridium) * 10000 + parse(gold) * 1000 + parse(silver) * 100 + parse(copper) * 10 + parse(tin)
  const newTin  = mode === 'add' ? currentTin + coinTin : currentTin - coinTin

  const handleSave = () => onSave(newTin)

  const inputStyle = { width: '100%' }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adjust {label}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={e => { e.preventDefault(); if (coinTin > 0) handleSave() }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
            <button type="button" className={mode === 'add'      ? 'chip chip-active' : 'chip'} onClick={() => setMode('add')}>+ Add</button>
            <button type="button" className={mode === 'subtract' ? 'chip chip-active' : 'chip'} onClick={() => setMode('subtract')}>− Subtract</button>
          </div>

          {/* Coin inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: '1rem' }}>
            {(['iridium', 'gold', 'silver', 'copper', 'tin'] as const).map(coin => {
              const setters: Record<string, (v: string) => void> = {
                iridium: setIridium, gold: setGold, silver: setSilver, copper: setCopper, tin: setTin,
              }
              const values: Record<string, string> = { iridium, gold, silver, copper, tin }
              return (
                <div key={coin} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ textTransform: 'capitalize', fontSize: 11 }}>{coin}</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={1}
                    style={inputStyle}
                    value={values[coin]}
                    onChange={e => setters[coin](e.target.value)}
                  />
                </div>
              )
            })}
          </div>

          {/* Preview */}
          <div style={{
            background: 'var(--parchment)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '0.65rem 1rem',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: 1.6,
          }}>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Adjustment: </span>
              <strong>{mode === 'subtract' ? '−' : '+'}{coinTin.toLocaleString()} tin</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>New {label}: </span>
              <strong style={{ color: newTin < 0 ? 'var(--danger)' : 'var(--ink)' }}>
                {formatAmount(newTin, displayUnit)}
              </strong>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={coinTin === 0}>Apply</button>
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

// ── Stat card ─────────────────────────────────────────────

function StatCard({ label, value, highlight, textColor, onAdjust, currentTin, displayUnit, onDirectEdit }: {
  label: string
  value: string
  highlight?: boolean
  textColor?: string
  onAdjust?: () => void
  currentTin?: number
  displayUnit?: CoinUnit
  onDirectEdit?: (newTin: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const startEdit = () => {
    if (!onDirectEdit || currentTin === undefined || !displayUnit) return
    const converted = currentTin / COIN_TO_TIN[displayUnit]
    setInputVal(parseFloat(converted.toFixed(4)).toString())
    setEditing(true)
  }

  const commitEdit = () => {
    if (!onDirectEdit || !displayUnit) return
    const newTin = (Number(inputVal) || 0) * COIN_TO_TIN[displayUnit]
    onDirectEdit(newTin)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div style={{
      background: highlight ? 'var(--gold-ghost)' : 'var(--white)',
      padding: '0.9rem 1.25rem',
    }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            <input
              autoFocus
              className="form-input"
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, fontSize: 17, padding: '2px 6px', height: 32 }}
            />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
              {displayUnit}
            </span>
          </div>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-body)', fontSize: 20,
              color: textColor ?? 'var(--ink)', fontWeight: highlight ? 600 : 400,
              flex: 1,
              cursor: onDirectEdit ? 'text' : 'default',
            }}
            onClick={startEdit}
          >
            {value}
          </span>
        )}
        {onAdjust && !editing && (
          <button
            className="btn-icon"
            title={`Adjust ${label}`}
            onClick={onAdjust}
            style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}
          >
            ±
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────

type AdjustTarget = {
  label: string
  field: 'bankBalanceTin' | 'moneyOnHandTin' | 'dorrinFundsTin' | 'loanAmountTin' | 'taxRateTin'
}

export default function FinancesPage() {
  const [showEditFinances, setShowEditFinances]   = useState(false)
  const [showIncomeForm, setShowIncomeForm]       = useState(false)
  const [editIncomeTarget, setEditIncomeTarget]   = useState<IncomeSource | undefined>()
  const [confirmDeleteId, setConfirmDeleteId]     = useState<number | null>(null)
  const [adjustTarget, setAdjustTarget]           = useState<AdjustTarget | null>(null)
  const [displayUnit, setDisplayUnit]             = useState<CoinUnit>(getStoredUnit)

  const { data: finances, isLoading: loadingFinances, isError: errorFinances } = useFinances()
  const { data: gameState } = useGameState()
  const { data: incomeSources = [], isLoading: loadingIncome, isError: errorIncome } = useIncomeSources()
  const deleteSource = useDeleteIncomeSource()
  const updateFinances = useUpdateFinances()

  const totalDailyIncome = useMemo(
    () => incomeSources.filter(s => s.isActive).reduce((sum, s) => sum + s.dailyYieldTin, 0),
    [incomeSources],
  )

  const handleSetUnit = (unit: CoinUnit) => {
    setDisplayUnit(unit)
    localStorage.setItem('finances-display-unit', unit)
  }

  const handleEditIncome  = (s: IncomeSource) => { setEditIncomeTarget(s); setShowIncomeForm(true) }
  const handleCloseIncome = () => { setShowIncomeForm(false); setEditIncomeTarget(undefined) }
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return
    await deleteSource.mutateAsync(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  const handleAdjustSave = async (newTin: number) => {
    if (!finances || !adjustTarget) return
    await updateFinances.mutateAsync({ ...finances, [adjustTarget.field]: newTin })
    setAdjustTarget(null)
  }

  const handleDirectEdit = async (field: AdjustTarget['field'], newTin: number) => {
    if (!finances) return
    await updateFinances.mutateAsync({ ...finances, [field]: newTin })
  }

  const fmt = (v: number) => formatAmount(v, displayUnit)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Finances</h1>
      </div>

      {/* ── Estate Snapshot ─────────────────────────────── */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--ink-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Estate Snapshot
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Currency display chips */}
            <div style={{ display: 'flex', gap: 4 }}>
              {COINS.map(coin => (
                <button
                  key={coin}
                  className={displayUnit === coin ? 'chip chip-active' : 'chip'}
                  style={{ textTransform: 'capitalize', fontSize: 11, padding: '3px 10px' }}
                  onClick={() => handleSetUnit(coin)}
                >
                  {coin}
                </button>
              ))}
            </div>
            {finances && (
              <button className="btn-secondary" style={{ fontSize: 12, padding: '4px 14px' }} onClick={() => setShowEditFinances(true)}>
                Edit Finances
              </button>
            )}
          </div>
        </div>

        {loadingFinances ? (
          <div className="loading">Loading treasury records…</div>
        ) : errorFinances ? (
          <p style={{ color: 'var(--danger)' }}>Failed to load financial records.</p>
        ) : !finances ? (
          <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>No financial record found.</p>
        ) : (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

            {/* Date & Season banner */}
            <div style={{ background: 'var(--blue-deep)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--gold-light)', letterSpacing: '0.04em' }}>
                {gameState ? formatGameDate(gameState.currentYear, gameState.currentSeason, gameState.currentWeek, gameState.currentDay) : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
                change date on the Calendar page
              </span>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 1, background: 'var(--border)' }}>
              <StatCard label="Bank Balance"  value={fmt(finances.bankBalanceTin)}
                currentTin={finances.bankBalanceTin} displayUnit={displayUnit}
                onDirectEdit={v => handleDirectEdit('bankBalanceTin', v)}
                onAdjust={() => setAdjustTarget({ label: 'Bank Balance', field: 'bankBalanceTin' })} />
              <StatCard label="Money on Hand" value={fmt(finances.moneyOnHandTin)}
                currentTin={finances.moneyOnHandTin} displayUnit={displayUnit}
                onDirectEdit={v => handleDirectEdit('moneyOnHandTin', v)}
                onAdjust={() => setAdjustTarget({ label: 'Money on Hand', field: 'moneyOnHandTin' })} />
              <StatCard label="Dorrin Funds"  value={fmt(finances.dorrinFundsTin)}
                currentTin={finances.dorrinFundsTin} displayUnit={displayUnit}
                onDirectEdit={v => handleDirectEdit('dorrinFundsTin', v)}
                onAdjust={() => setAdjustTarget({ label: 'Dorrin Funds', field: 'dorrinFundsTin' })} />
              <StatCard label="Loan Amount"   value={fmt(finances.loanAmountTin)}
                textColor={finances.loanAmountTin > 0 ? 'var(--danger)' : undefined}
                currentTin={finances.loanAmountTin} displayUnit={displayUnit}
                onDirectEdit={v => handleDirectEdit('loanAmountTin', v)}
                onAdjust={() => setAdjustTarget({ label: 'Loan Amount', field: 'loanAmountTin' })} />
              <StatCard label="Tax Rate"      value={fmt(finances.taxRateTin)}
                currentTin={finances.taxRateTin} displayUnit={displayUnit}
                onDirectEdit={v => handleDirectEdit('taxRateTin', v)}
                onAdjust={() => setAdjustTarget({ label: 'Tax Rate', field: 'taxRateTin' })} />
              <StatCard label="Daily Income"  value={fmt(totalDailyIncome)}
                textColor={totalDailyIncome > 0 ? 'var(--success)' : undefined} />
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
        ) : errorIncome ? (
          <p style={{ color: 'var(--danger)' }}>Failed to load income sources.</p>
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
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(source.dailyYieldTin)}</td>
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
                      <strong style={{ color: 'var(--success)', fontSize: 14 }}>{fmt(totalDailyIncome)}</strong>
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

      {adjustTarget && finances && (
        <AdjustBalanceModal
          label={adjustTarget.label}
          currentTin={finances[adjustTarget.field] as number}
          displayUnit={displayUnit}
          onClose={() => setAdjustTarget(null)}
          onSave={handleAdjustSave}
        />
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
