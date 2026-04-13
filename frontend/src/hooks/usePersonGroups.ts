import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personGroupsApi } from '../api'
import type { CreatePersonGroupRequest, AddGroupMemberRequest } from '../types'

export const GROUPS_KEY = 'personGroups'

export function usePersonGroups() {
  return useQuery({
    queryKey: [GROUPS_KEY],
    queryFn: () => personGroupsApi.getAll(),
  })
}

export function useGroupMembers(groupId: number | null) {
  return useQuery({
    queryKey: [GROUPS_KEY, groupId, 'members'],
    queryFn: () => personGroupsApi.getMembers(groupId!),
    enabled: groupId != null,
  })
}

export function useCreatePersonGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePersonGroupRequest) => personGroupsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  })
}

export function useUpdatePersonGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreatePersonGroupRequest }) =>
      personGroupsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  })
}

export function useDeletePersonGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => personGroupsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GROUPS_KEY] }),
  })
}

export function useAddGroupMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data: AddGroupMemberRequest }) =>
      personGroupsApi.addMember(groupId, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [GROUPS_KEY, vars.groupId, 'members'] })
      qc.invalidateQueries({ queryKey: [GROUPS_KEY] })
    },
  })
}

export function useRemoveGroupMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
      personGroupsApi.removeMember(groupId, memberId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [GROUPS_KEY, vars.groupId, 'members'] })
      qc.invalidateQueries({ queryKey: [GROUPS_KEY] })
    },
  })
}
