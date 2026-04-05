import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residentsApi } from '../api'
import type { CreateResidentRequest } from '../types'

export const RESIDENTS_KEY = 'residents'

export function useResidents(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [RESIDENTS_KEY, params],
    queryFn: () => residentsApi.getAll(params),
  })
}

export function useCreateResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateResidentRequest) => residentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESIDENTS_KEY] }),
  })
}

export function useUpdateResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateResidentRequest }) =>
      residentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESIDENTS_KEY] }),
  })
}

export function useDeleteResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => residentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESIDENTS_KEY] }),
  })
}
