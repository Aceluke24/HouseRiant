import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api'
import type { CreateTaskRequest } from '../types'

export const TASKS_KEY = 'tasks'

export function useTasks(params?: { search?: string; status?: string; category?: string }) {
  return useQuery({
    queryKey: [TASKS_KEY, params],
    queryFn: () => tasksApi.getAll(params),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTaskRequest }) =>
      tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  })
}
