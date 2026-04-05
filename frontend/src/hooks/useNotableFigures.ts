import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notableFiguresApi } from '../api'
import type { CreateNotableFigureRequest } from '../types'

export const NOTABLE_KEY = 'notableFigures'

export function useNotableFigures(params?: { search?: string; relationship?: string }) {
  return useQuery({
    queryKey: [NOTABLE_KEY, params],
    queryFn: () => notableFiguresApi.getAll(params),
  })
}

export function useCreateNotableFigure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNotableFigureRequest) => notableFiguresApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTABLE_KEY] }),
  })
}

export function useUpdateNotableFigure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateNotableFigureRequest }) =>
      notableFiguresApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTABLE_KEY] }),
  })
}

export function useDeleteNotableFigure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notableFiguresApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTABLE_KEY] }),
  })
}
