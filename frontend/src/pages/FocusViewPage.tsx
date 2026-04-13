import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useFocus } from '../context/FocusContext'
import { residentsApi, notableFiguresApi } from '../api'
import FocusProfileCard from '../components/focus/FocusProfileCard'
import type { Resident } from '../types'
import type { NotableFigure } from '../types'

// Layout options for displaying the profiles
type Layout = 'scroll' | 'fit'

export default function FocusViewPage() {
  const { focusedPeople, removeFromFocus, clearFocus, focusCount } = useFocus()
  const navigate = useNavigate()
  const [layout, setLayout] = useState<Layout>('scroll')

  // ── Fetch all focused people in parallel ─────────────────────────────────
  // useQueries lets us fire off multiple API requests at the same time,
  // one per selected character. Each query is keyed by type + id so
  // TanStack Query caches them individually.
  const queries = useQueries({
    queries: focusedPeople.map(entry => ({
      queryKey: entry.type === 'resident'
        ? ['resident', entry.id]
        : ['notable-figure', entry.id],
      queryFn: () => entry.type === 'resident'
        ? residentsApi.getById(entry.id)
        : notableFiguresApi.getById(entry.id),
      staleTime: 1000 * 30,
    }))
  })

  const isLoading = queries.some(q => q.isLoading)
  const hasError = queries.some(q => q.isError)

  // ── Empty state ──────────────────────────────────────────────────────────
  if (focusCount === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Focus View</h1>
        </div>
        <div className="focus-empty">
          <p className="focus-empty-icon">⚔</p>
          <h2>No characters in focus</h2>
          <p>Go to the Residents or Notable Figures page, check the boxes next to the people you want to focus on, then return here.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go to Residents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page focus-page">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Focus View</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 3 }}>
            {focusCount} {focusCount === 1 ? 'character' : 'characters'} in focus
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Layout toggle — same pattern as table/grid on ResidentsPage */}
          <div className="view-toggle">
            <button
              className={`view-btn ${layout === 'scroll' ? 'active' : ''}`}
              onClick={() => setLayout('scroll')}
              title="Scrollable row — cards keep their full size"
            >
              ↔ Scroll
            </button>
            <button
              className={`view-btn ${layout === 'fit' ? 'active' : ''}`}
              onClick={() => setLayout('fit')}
              title="Fit to screen — all cards visible at once"
            >
              ⊞ Fit
            </button>
          </div>
          <button
            className="btn-secondary"
            onClick={clearFocus}
            title="Clear all selections"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* ── Loading state ────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="loading">Summoning the records...</div>
      )}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {hasError && !isLoading && (
        <div className="form-submit-error" style={{ marginBottom: '1rem' }}>
          One or more profiles could not be loaded. The character may have been deleted.
        </div>
      )}

      {/* ── Profiles ─────────────────────────────────────────────────────── */}
      {!isLoading && (
        <div className={layout === 'scroll' ? 'focus-row-scroll' : 'focus-row-fit'}>
          {queries.map((query, i) => {
            const entry = focusedPeople[i]
            if (!entry) return null

            // Still loading this specific card
            if (query.isLoading) {
              return (
                <div key={`${entry.type}-${entry.id}`} className="focus-profile-card focus-profile-loading">
                  <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontSize: 13 }}>
                    Loading {entry.name}...
                  </p>
                </div>
              )
            }

            // This specific card errored (e.g. deleted from DB)
            if (query.isError || !query.data) {
              return (
                <div key={`${entry.type}-${entry.id}`} className="focus-profile-card focus-profile-error">
                  <p style={{ color: 'var(--danger)', fontSize: 13 }}>
                    Could not load <strong>{entry.name}</strong>.
                  </p>
                  <button
                    className="btn-danger"
                    style={{ marginTop: '0.75rem', fontSize: 11 }}
                    onClick={() => removeFromFocus(entry.id, entry.type)}
                  >
                    Remove
                  </button>
                </div>
              )
            }

            return (
              <FocusProfileCard
                key={`${entry.type}-${entry.id}`}
                type={entry.type}
                person={query.data as Resident | NotableFigure}
                onRemove={() => removeFromFocus(entry.id, entry.type)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
