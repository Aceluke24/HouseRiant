import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chronicleApi, tagsApi } from '../api'
import type { CreateChronicleEntryRequest, CreateTagRequest } from '../types'

export const CHRONICLE_KEY = 'chronicle'
export const TAGS_KEY = 'tags'

export function useChronicleEntries(params?: { search?: string; tag?: string }) {
  return useQuery({
    queryKey: [CHRONICLE_KEY, params],
    queryFn: () => chronicleApi.getAll(params),
  })
}

export function useCreateChronicleEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChronicleEntryRequest) => chronicleApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CHRONICLE_KEY] }),
  })
}

export function useUpdateChronicleEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateChronicleEntryRequest }) =>
      chronicleApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CHRONICLE_KEY] }),
  })
}

export function useDeleteChronicleEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => chronicleApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CHRONICLE_KEY] }),
  })
}

export function useTags() {
  return useQuery({
    queryKey: [TAGS_KEY],
    queryFn: () => tagsApi.getAll(),
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAGS_KEY] }),
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TAGS_KEY] })
      qc.invalidateQueries({ queryKey: [CHRONICLE_KEY] })
    },
  })
}
