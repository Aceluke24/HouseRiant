import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useBatchImportResidents } from '../../hooks/useResidents'
import { residentsApi } from '../../api'
import { RESIDENTS_KEY } from '../../hooks/useResidents'
import { getApiErrorMessage } from '../../utils/getApiErrorMessage'
import type { Resident, BatchResidentItem, BatchImportConflict, BatchImportResponse, PersonStatus, Gender } from '../../types'

interface Props {
  existingResidents: Resident[]
  onClose: () => void
}

type Step = 'input' | 'preview' | 'results'

interface FormValues {
  jsonInput: string
  apiKey: string
}

const STATUS_LABELS: Record<string, string> = { HiredHelp: 'Hired Help' }

export default function ImportResidentsModal({ existingResidents, onClose }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [parsedItems, setParsedItems] = useState<BatchResidentItem[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<BatchImportResponse | null>(null)
  const [skippedConflicts, setSkippedConflicts] = useState<Set<number>>(new Set())
  const [overwriteErrors, setOverwriteErrors] = useState<Record<number, string>>({})

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    defaultValues: { jsonInput: '', apiKey: '' },
  })

  const batchImport = useBatchImportResidents()
  const qc = useQueryClient()

  const existingNames = new Set(existingResidents.map(r => r.name.toLowerCase()))

  function handleParse() {
    setParseError(null)
    const raw = getValues('jsonInput').trim()
    if (!raw) { setParseError('Please paste a JSON array of resident objects.'); return }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      setParseError('Invalid JSON — could not parse. Check for missing commas or brackets.')
      return
    }
    if (!Array.isArray(parsed)) {
      setParseError('Expected a JSON array (e.g. [{ "name": "..." }, ...]).')
      return
    }
    const items = parsed as BatchResidentItem[]
    const invalid = items.findIndex(i => !i || typeof i.name !== 'string' || !i.name.trim())
    if (invalid !== -1) {
      setParseError(`Item at index ${invalid} is missing a "name" field.`)
      return
    }
    setParsedItems(items)
    setStep('preview')
  }

  async function handleConfirm() {
    const apiKey = getValues('apiKey')
    try {
      const result = await batchImport.mutateAsync({ items: parsedItems, apiKey })
      setImportResult(result)
      setStep('results')
    } catch (err) {
      setParseError(getApiErrorMessage(err))
    }
  }

  async function handleOverwrite(conflict: BatchImportConflict, index: number) {
    const { incoming, existing } = conflict
    try {
      await residentsApi.update(existing.id, {
        name: incoming.name,
        status: incoming.status as PersonStatus,
        statusOther: incoming.statusOther,
        title: incoming.title,
        role: incoming.role,
        type: incoming.type,
        race: incoming.race,
        krellTribe: incoming.krellTribe,
        gender: incoming.gender as Gender | undefined,
        age: incoming.age,
        dailyPayRate: incoming.dailyPayRate,
        landOwned: incoming.landOwned,
        appearance: incoming.appearance,
        skills: incoming.skills,
        troopType: incoming.troopType,
        levelOfRole: incoming.levelOfRole,
        imageUrl: incoming.imageUrl,
        notes: incoming.notes,
        familyId: incoming.familyId,
        showOnHomePage: incoming.showOnHomePage,
      })
      qc.invalidateQueries({ queryKey: [RESIDENTS_KEY] })
      setSkippedConflicts(prev => new Set([...prev, index]))
    } catch (err) {
      setOverwriteErrors(prev => ({ ...prev, [index]: getApiErrorMessage(err) }))
    }
  }

  function handleSkip(index: number) {
    setSkippedConflicts(prev => new Set([...prev, index]))
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 760, width: '95vw' }}>
        <div className="modal-header">
          <h2>Import Residents</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {step === 'input' && (
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Paste JSON Array</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13 }}
                placeholder={'[\n  { "name": "John Smith", "status": "Resident", "role": "Guard" },\n  { "name": "Jane Doe", "familyId": "Riant" }\n]'}
                {...register('jsonInput', { required: true })}
              />
              {errors.jsonInput && <p className="form-error">JSON is required.</p>}
            </div>
            <div className="form-group">
              <label className="form-label">API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="house-riant-import-key-change-me"
                {...register('apiKey', { required: true })}
              />
              {errors.apiKey && <p className="form-error">API key is required.</p>}
            </div>
            {parseError && <p className="form-error" style={{ marginBottom: 8 }}>{parseError}</p>}
            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
              <button className="btn-primary" type="button" onClick={handleSubmit(handleParse)}>
                Parse &amp; Preview
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="modal-form">
            <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--ink-muted)' }}>
              {parsedItems.length} resident{parsedItems.length !== 1 ? 's' : ''} parsed.
              Rows marked <span className="badge badge-conflict" style={{ fontSize: 11 }}>conflict</span> already exist and will not be created.
            </p>
            <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Family</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {parsedItems.map((item, i) => {
                    const isConflict = existingNames.has(item.name.toLowerCase())
                    return (
                      <tr key={i} style={isConflict ? { background: 'var(--danger-bg)' } : undefined}>
                        <td className="name-cell">{item.name}</td>
                        <td>
                          {item.status ? (
                            <span className={`badge badge-${item.status.toLowerCase()}`}>
                              {STATUS_LABELS[item.status] ?? item.status}
                            </span>
                          ) : '—'}
                        </td>
                        <td>{item.role ?? '—'}</td>
                        <td>{typeof item.familyId === 'string' ? item.familyId : (item.familyId ?? '—')}</td>
                        <td>
                          {isConflict && (
                            <span className="badge" style={{ background: 'var(--danger)', color: '#fff', fontSize: 11 }}>
                              conflict
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {parseError && <p className="form-error" style={{ marginTop: 8 }}>{parseError}</p>}
            <div className="modal-footer">
              <button className="btn-secondary" type="button" onClick={() => { setStep('input'); setParseError(null) }}>
                ← Back
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleConfirm}
                disabled={batchImport.isPending}
              >
                {batchImport.isPending ? 'Importing…' : 'Confirm Import'}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && importResult && (
          <div className="modal-form">
            <div style={{ padding: '12px 0', marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 15 }}>
                <strong>{importResult.created.length}</strong> resident{importResult.created.length !== 1 ? 's' : ''} created
                {importResult.conflicts.length > 0 && (
                  <>, <strong style={{ color: 'var(--danger)' }}>{importResult.conflicts.length}</strong> conflict{importResult.conflicts.length !== 1 ? 's' : ''}</>
                )}
              </p>
            </div>

            {importResult.conflicts.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, marginBottom: 10, color: 'var(--danger)' }}>
                  Conflicts — Resolve Each
                </h3>
                <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Incoming</th>
                        <th>Existing</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.conflicts.map((conflict, i) => {
                        const resolved = skippedConflicts.has(i)
                        return (
                          <tr key={i} style={resolved ? { opacity: 0.4 } : undefined}>
                            <td style={{ verticalAlign: 'top', paddingTop: 8 }}>
                              <strong>{conflict.incoming.name}</strong>
                              {conflict.incoming.role && <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{conflict.incoming.role}</div>}
                              {conflict.incoming.status && (
                                <span className={`badge badge-${conflict.incoming.status.toLowerCase()}`} style={{ fontSize: 11, marginTop: 3, display: 'inline-block' }}>
                                  {STATUS_LABELS[conflict.incoming.status] ?? conflict.incoming.status}
                                </span>
                              )}
                            </td>
                            <td style={{ verticalAlign: 'top', paddingTop: 8 }}>
                              <strong>{conflict.existing.name}</strong>
                              {conflict.existing.role && <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{conflict.existing.role}</div>}
                              <span className={`badge badge-${conflict.existing.status.toLowerCase()}`} style={{ fontSize: 11, marginTop: 3, display: 'inline-block' }}>
                                {STATUS_LABELS[conflict.existing.status] ?? conflict.existing.status}
                              </span>
                            </td>
                            <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              {resolved ? (
                                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Done</span>
                              ) : (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    className="btn-secondary"
                                    style={{ fontSize: 12, padding: '3px 10px' }}
                                    onClick={() => handleSkip(i)}
                                  >
                                    Skip
                                  </button>
                                  <button
                                    className="btn-danger"
                                    style={{ fontSize: 12, padding: '3px 10px' }}
                                    onClick={() => handleOverwrite(conflict, i)}
                                  >
                                    Overwrite
                                  </button>
                                </div>
                              )}
                              {overwriteErrors[i] && (
                                <p className="form-error" style={{ fontSize: 11, marginTop: 4 }}>{overwriteErrors[i]}</p>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="modal-footer">
              <button className="btn-primary" type="button" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
