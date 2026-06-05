import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationsApi } from '../api'
import type { CreateOrganizationRequest } from '../types'

export const ORGANIZATIONS_KEY = 'organizations'

export function useOrganizations(params?: { search?: string; type?: string; relationship?: string }) {
  return useQuery({
    queryKey: [ORGANIZATIONS_KEY, params],
    queryFn: () => organizationsApi.getAll(params),
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY] }),
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateOrganizationRequest }) =>
      organizationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY] }),
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => organizationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORGANIZATIONS_KEY] }),
  })
}
