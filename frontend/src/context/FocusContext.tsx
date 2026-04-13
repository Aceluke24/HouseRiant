import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

// A "focused" person can be either a Resident or a Notable Figure.
// We store just enough info to identify them and fetch their full data.
export type FocusPersonType = 'resident' | 'notable-figure'

export interface FocusEntry {
  id: number
  type: FocusPersonType
  name: string // stored for display before data loads
}

interface FocusContextValue {
  focusedPeople: FocusEntry[]
  addToFocus: (entry: FocusEntry) => void
  removeFromFocus: (id: number, type: FocusPersonType) => void
  toggleFocus: (entry: FocusEntry) => void
  isInFocus: (id: number, type: FocusPersonType) => boolean
  clearFocus: () => void
  focusCount: number
}

// ── Context ────────────────────────────────────────────────────────────────

const FocusContext = createContext<FocusContextValue | null>(null)

const STORAGE_KEY = 'house-riant-focus'

// ── Provider ───────────────────────────────────────────────────────────────

export function FocusProvider({ children }: { children: ReactNode }) {
  // Load initial state from localStorage so selections survive page refreshes.
  // If nothing is stored yet, start with an empty array.
  const [focusedPeople, setFocusedPeople] = useState<FocusEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Whenever the selection changes, save it to localStorage automatically.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(focusedPeople))
  }, [focusedPeople])

  const addToFocus = useCallback((entry: FocusEntry) => {
    setFocusedPeople(prev => {
      // Don't add duplicates
      const alreadyIn = prev.some(p => p.id === entry.id && p.type === entry.type)
      if (alreadyIn) return prev
      return [...prev, entry]
    })
  }, [])

  const removeFromFocus = useCallback((id: number, type: FocusPersonType) => {
    setFocusedPeople(prev => prev.filter(p => !(p.id === id && p.type === type)))
  }, [])

  const toggleFocus = useCallback((entry: FocusEntry) => {
    setFocusedPeople(prev => {
      const alreadyIn = prev.some(p => p.id === entry.id && p.type === entry.type)
      if (alreadyIn) return prev.filter(p => !(p.id === entry.id && p.type === entry.type))
      return [...prev, entry]
    })
  }, [])

  const isInFocus = useCallback((id: number, type: FocusPersonType) => {
    return focusedPeople.some(p => p.id === id && p.type === type)
  }, [focusedPeople])

  const clearFocus = useCallback(() => setFocusedPeople([]), [])

  return (
    <FocusContext.Provider value={{
      focusedPeople,
      addToFocus,
      removeFromFocus,
      toggleFocus,
      isInFocus,
      clearFocus,
      focusCount: focusedPeople.length,
    }}>
      {children}
    </FocusContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────

// This is a custom hook. Any component can call useFocus() to read and
// update the focus selection. It throws a helpful error if used outside
// the provider (which would mean it's being used somewhere App.tsx doesn't wrap).
export function useFocus() {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocus must be used inside <FocusProvider>')
  return ctx
}
