import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarApi } from '../api'
import type { CreateCalendarEventRequest } from '../types'

export const CALENDAR_KEY = 'calendar'

export function useCalendar() {
  return useQuery({
    queryKey: [CALENDAR_KEY],
    queryFn: () => calendarApi.getAll(),
  })
}

export function useCreateCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCalendarEventRequest) => calendarApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
  })
}

export function useUpdateCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCalendarEventRequest }) =>
      calendarApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
  })
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => calendarApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
  })
}

export function useCreateRecurringCalendarEvents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (events: CreateCalendarEventRequest[]) => calendarApi.batchCreate(events),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
  })
}

export function useDeleteCalendarEventGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId: number) => calendarApi.deleteGroup(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CALENDAR_KEY] }),
  })
}
