import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { worldLocationsApi } from '../api'
import type { CreateWorldLocationRequest } from '../types'

export const WORLD_LOCATIONS_KEY = 'worldLocations'

export function useWorldLocations() {
  return useQuery({
    queryKey: [WORLD_LOCATIONS_KEY],
    queryFn: () => worldLocationsApi.getAll(),
  })
}

export function useCreateWorldLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWorldLocationRequest) => worldLocationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WORLD_LOCATIONS_KEY] }),
  })
}

export function useUpdateWorldLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateWorldLocationRequest }) =>
      worldLocationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WORLD_LOCATIONS_KEY] }),
  })
}

export function useDeleteWorldLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => worldLocationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WORLD_LOCATIONS_KEY] }),
  })
}
