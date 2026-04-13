import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { familiesApi } from '../api'
import type { CreateFamilyRequest } from '../types'

export const FAMILIES_KEY = 'families'

export function useFamilies() {
  return useQuery({
    queryKey: [FAMILIES_KEY],
    queryFn: () => familiesApi.getAll(),
  })
}

export function useCreateFamily() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFamilyRequest) => familiesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FAMILIES_KEY] }),
  })
}

export function useUpdateFamily() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateFamilyRequest }) =>
      familiesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FAMILIES_KEY] }),
  })
}

export function useDeleteFamily() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => familiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FAMILIES_KEY] }),
  })
}
