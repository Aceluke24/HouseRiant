import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financesApi } from '../api'
import type { EstateFinances, CreateIncomeSourceRequest } from '../types'

export const FINANCES_KEY = 'finances'
export const INCOME_SOURCES_KEY = 'incomeSources'

// ── Estate Snapshot ───────────────────────────────────────

export function useFinances() {
  return useQuery({
    queryKey: [FINANCES_KEY],
    queryFn: () => financesApi.get(),
  })
}

export function useUpdateFinances() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EstateFinances) => financesApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FINANCES_KEY] }),
  })
}

// ── Income Sources ────────────────────────────────────────

export function useIncomeSources() {
  return useQuery({
    queryKey: [INCOME_SOURCES_KEY],
    queryFn: () => financesApi.getIncomeSources(),
  })
}

export function useCreateIncomeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateIncomeSourceRequest) => financesApi.createIncomeSource(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INCOME_SOURCES_KEY] }),
  })
}

export function useUpdateIncomeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateIncomeSourceRequest }) =>
      financesApi.updateIncomeSource(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INCOME_SOURCES_KEY] }),
  })
}

export function useDeleteIncomeSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => financesApi.deleteIncomeSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INCOME_SOURCES_KEY] }),
  })
}
