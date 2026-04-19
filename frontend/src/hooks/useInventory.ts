import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api'
import type { CreateInventoryItemRequest } from '../types'

export const INVENTORY_KEY = 'inventory'

export function useInventory(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: [INVENTORY_KEY, params],
    queryFn: () => inventoryApi.getAll(params),
  })
}

export function useCreateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVENTORY_KEY] }),
  })
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateInventoryItemRequest }) =>
      inventoryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVENTORY_KEY] }),
  })
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVENTORY_KEY] }),
  })
}
