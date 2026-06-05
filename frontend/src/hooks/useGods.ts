import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { godsApi } from '../api'
import type { CreateGodRequest } from '../types'

export const GODS_KEY = 'gods'

export function useGods(params?: { search?: string; tier?: string }) {
  return useQuery({
    queryKey: [GODS_KEY, params],
    queryFn: () => godsApi.getAll(params),
  })
}

export function useCreateGod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGodRequest) => godsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GODS_KEY] }),
  })
}

export function useUpdateGod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateGodRequest }) =>
      godsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GODS_KEY] }),
  })
}

export function useDeleteGod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => godsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GODS_KEY] }),
  })
}
