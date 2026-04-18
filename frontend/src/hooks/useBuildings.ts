import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buildingsApi } from '../api'
import type { CreateBuildingRequest } from '../types'

export const BUILDINGS_KEY = 'buildings'

export function useBuildings() {
  return useQuery({
    queryKey: [BUILDINGS_KEY],
    queryFn: () => buildingsApi.getAll(),
  })
}

export function useCreateBuilding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBuildingRequest) => buildingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}

export function useUpdateBuilding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBuildingRequest }) =>
      buildingsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}

export function useDeleteBuilding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => buildingsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}

export function useAssignResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ buildingId, residentId }: { buildingId: number; residentId: number }) =>
      buildingsApi.assignResident(buildingId, residentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}

export function useUnassignResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ buildingId, residentId }: { buildingId: number; residentId: number }) =>
      buildingsApi.unassignResident(buildingId, residentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}

export function useAddAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ buildingId, residentId, assignmentType }: { buildingId: number; residentId: number; assignmentType?: string }) =>
      buildingsApi.addAssignment(buildingId, { residentId, assignmentType }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}

export function useRemoveAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ buildingId, assignmentId }: { buildingId: number; assignmentId: number }) =>
      buildingsApi.removeAssignment(buildingId, assignmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BUILDINGS_KEY] }),
  })
}
