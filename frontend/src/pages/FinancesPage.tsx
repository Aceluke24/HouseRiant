import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useFinances, useUpdateFinances,
  useIncomeSources, useCreateIncomeSource, useUpdateIncomeSource, useDeleteIncomeSource,
} from '../hooks/useFinances'
import { useGameState } from '../hooks/useGameState'
import { useResidents } from '../hooks/useResidents'
import ConfirmModal from '../components/ConfirmModal'
import type { EstateFinances, IncomeSource, CreateIncomeSourceRequest, Resident } from '../types'

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

// ── Finance Calculator ────────────────────────────────────

type CalcOp = '+' | '-' | '×' | '÷'
type ValType = 'number' | 'named'

const NAMED_VALUE_KEYS = [
  'All Residents',
  'Active Residents',
  'Hired Help',
  'Bank Balance',
  'Loan Amount',
  'Daily Mine Income',
] as const
type NamedValueKey = typeof NAMED_VALUE_KEYS[number]

function applyOp(a: number, op: CalcOp, b: number): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×') return a * b
  if (op === '÷') return b !== 0 ? a / b : 0
  return a
}

interface CalculatorSectionProps {
  finances: EstateFinances | undefined
  residents: Resident[]
  incomeSources: IncomeSource[]
  onApplyToBalance: (mode: 'add' | 'subtract', amount: number) => Promise<void>
}

function CalculatorSection({ finances, residents, incomeSources, onApplyToBalance }: CalculatorSectionProps) {
  const [val1, setVal1] = useState('')
  const [op1, setOp1] = useState<CalcOp>('+')
  const [val2Type, setVal2Type] = useState<ValType>('number')
  const [val2, setVal2] = useState('')
  const [val2Named, setVal2Named] = useState<NamedValueKey>('Bank Balance')

  const [showRow2, setShowRow2] = useState(false)
  const [op2, setOp2] = useState<CalcOp>('+')
  const [val3Type, setVal3Type] = useState<ValType>('number')
  const [val3, setVal3] = useState('')
  const [val3Named, setVal3Named] = useState<NamedValueKey>('Bank Balance')

  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyPending, setApplyPending] = useState(false)

  const totalDailyIncome = incomeSources.filter(s => s.isActive).reduce((sum, s) => sum + s.dailyYieldTin, 0)

  const namedValues: Record<NamedValueKey, number> = {
    'All Residents':     residents.length,
    'Active Residents':  residents.filter(r => r.status === 'Resident').length,
    'Hired Help':        residents.filter(r => r.status === 'HiredHelp').length,
    'Bank Balance':      finances?.bankBalanceTin ?? 0,
    'Loan Amount':       finances?.loanAmountTin ?? 0,
    'Daily Mine Income': totalDailyIncome,
  }

  const n1 = Number(val1) || 0
  const n2 = val2Type === 'named' ? namedValues[val2Named] : (Number(val2) || 0)
  const result1 = applyOp(n1, op1, n2)
  const n3 = val3Type === 'named' ? namedValues[val3Named] : (Number(val3) || 0)
  const finalResult = showRow2 ? applyOp(result1, op2, n3) : result1

  const handleApply = async (mode: 'add' | 'subtract') => {
    setApplyPending(true)
    await onApplyToBalance(mode, finalResult)
    setApplyPending(false)
    setShowApplyModal(false)
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  }

  const opSelectStyle: React.CSSProperties = {
    width: 56,
    textAlign: 'center',
    fontFamily: 'var(--font-heading)',
    fontSize: 16,
  }

  const numInputStyle: React.CSSProperties = {
    width: 110,
  }

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Row 1 */}
        <div style={rowStyle}>
          <input
            className="form-input"
            type="number"
            step="any"
            placeholder="Value"
            value={val1}
            onChange={e => setVal1(e.target.value)}
            style={numInputStyle}
          />

          <select
            className="form-select"
            value={op1}
            onChange={e => setOp1(e.target.value as CalcOp)}
            style={opSelectStyle}
          >
            {(['+', '-', '×', '÷'] as CalcOp[]).map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              type="button"
              className={val2Type === 'number' ? 'chip chip-active' : 'chip'}
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => setVal2Type('number')}
            >
              #
            </button>
            <button
              type="button"
              className={val2Type === 'named' ? 'chip chip-active' : 'chip'}
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => setVal2Type('named')}
            >
              Named
            </button>
          </div>

          {val2Type === 'number' ? (
            <input
              className="form-input"
              type="number"
              step="any"
              placeholder="Value"
              value={val2}
              onChange={e => setVal2(e.target.value)}
              style={numInputStyle}
            />
          ) : (
            <select
              className="form-select"
              value={val2Named}
              onChange={e => setVal2Named(e.target.value as NamedValueKey)}
              style={{ minWidth: 160 }}
            >
              {NAMED_VALUE_KEYS.map(k => (
                <option key={k} value={k}>{k} ({namedValues[k].toLocaleString()})</option>
              ))}
            </select>
          )}
        </div>

        {/* Row 2 (chained) */}
        {showRow2 && (
          <div style={rowStyle}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 11,
              color: 'var(--ink-muted)',
              minWidth: 110,
              textAlign: 'right',
            }}>
              = {result1.toLocaleString(undefined, { maximumFractionDigits: 4 })} tin
            </span>

            <select
              className="form-select"
              value={op2}
              onChange={e => setOp2(e.target.value as CalcOp)}
              style={opSelectStyle}
            >
              {(['+', '-', '×', '÷'] as CalcOp[]).map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {/* Type toggle row 2 */}
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                type="button"
                className={val3Type === 'number' ? 'chip chip-active' : 'chip'}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setVal3Type('number')}
              >
                #
              </button>
              <button
                type="button"
                className={val3Type === 'named' ? 'chip chip-active' : 'chip'}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setVal3Type('named')}
              >
                Named
              </button>
            </div>

            {val3Type === 'number' ? (
              <input
                className="form-input"
                type="number"
                step="any"
                placeholder="Value"
                value={val3}
                onChange={e => setVal3(e.target.value)}
                style={numInputStyle}
              />
            ) : (
              <select
                className="form-select"
                value={val3Named}
                onChange={e => setVal3Named(e.target.value as NamedValueKey)}
                style={{ minWidth: 160 }}
              >
                {NAMED_VALUE_KEYS.map(k => (
                  <option key={k} value={k}>{k} ({namedValues[k].toLocaleString()})</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Chain button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => setShowRow2(r => !r)}
          >
            {showRow2 ? '− Remove chain' : '+ Chain operation'}
          </button>
        </div>
      </div>

      {/* Result bar */}
      <div style={{
        background: 'var(--blue-deep)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 10 }}>
            Result
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 20, color: 'var(--gold-light)', fontWeight: 500 }}>
            {finalResult.toLocaleString(undefined, { maximumFractionDigits: 4 })} tin
          </span>
        </div>
        {finances && (
          <button
            className="btn-primary"
            style={{ fontSize: 12, padding: '5px 14px' }}
            onClick={() => setShowApplyModal(true)}
          >
            Apply to Bank Balance
          </button>
        )}
      </div>

      {/* Apply modal */}
      {showApplyModal && finances && (
        <div className="modal-backdrop" onClick={() => setShowApplyModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to Bank Balance</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div style={{
                background: 'var(--parchment)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                lineHeight: 1.8,
              }}>
                <div>
                  <span style={{ color: 'var(--ink-muted)' }}>Current Bank Balance: </span>
                  <strong>{finances.bankBalanceTin.toLocaleString()} tin</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--ink-muted)' }}>Calculator Result: </span>
                  <strong>{finalResult.toLocaleString(undefined, { maximumFractionDigits: 4 })} tin</strong>
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-mid)', marginBottom: '1rem' }}>
                Add or subtract the result from the Bank Balance?
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: '0.5rem',
              }}>
                <div style={{
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(26,92,42,0.2)',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--success)',
                }}>
                  New balance (add):{' '}
                  <strong>{(finances.bankBalanceTin + finalResult).toLocaleString(undefined, { maximumFractionDigits: 4 })} tin</strong>
                </div>
                <div style={{
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(139,26,26,0.2)',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--danger)',
                }}>
                  New balance (subtract):{' '}
                  <strong>{(finances.bankBalanceTin - finalResult).toLocaleString(undefined, { maximumFractionDigits: 4 })} tin</strong>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={applyPending}
                  onClick={() => handleApply('subtract')}
                  style={{ fontSize: 13 }}
                >
                  − Subtract
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={applyPending}
                  onClick={() => handleApply('add')}
                  style={{ fontSize: 13 }}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const { data: residents = [] } = useResidents()
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

  const handleApplyToBalance = async (mode: 'add' | 'subtract', amount: number) => {
    if (!finances) return
    const newBalance = mode === 'add'
      ? finances.bankBalanceTin + amount
      : finances.bankBalanceTin - amount
    await updateFinances.mutateAsync({ ...finances, bankBalanceTin: newBalance })
  }

  const fmt = (v: number) => formatAmount(v, displayUnit)

  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 14,
    color: 'var(--ink-light)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Finances</h1>
      </div>

      {/* ── Estate Snapshot ─────────────────────────────── */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={sectionHeadingStyle}>
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

      {/* ── Finance Calculator ───────────────────────────── */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={sectionHeadingStyle}>Finance Calculator</h2>
        <CalculatorSection
          finances={finances}
          residents={residents}
          incomeSources={incomeSources}
          onApplyToBalance={handleApplyToBalance}
        />
      </section>

      {/* ── Income Sources ───────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={sectionHeadingStyle}>
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
