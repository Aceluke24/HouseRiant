import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '../api'
import type { CreateSkillRequest } from '../types'

export const SKILLS_KEY = 'skills'

export function useSkills(params?: { search?: string; category?: string; trained?: string }) {
  return useQuery({
    queryKey: [SKILLS_KEY, params],
    queryFn: () => skillsApi.getAll(params),
  })
}

export function useCreateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSkillRequest) => skillsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY] }),
  })
}

export function useUpdateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSkillRequest }) =>
      skillsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY] }),
  })
}

export function useDeleteSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => skillsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY] }),
  })
}
