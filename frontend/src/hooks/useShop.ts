import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shopApi } from '../api'
import type { CreateShopItemRequest } from '../types'

export const SHOP_KEY = 'shop'

export function useShopItems(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: [SHOP_KEY, params],
    queryFn: () => shopApi.getAll(params),
  })
}

export function useCreateShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateShopItemRequest) => shopApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SHOP_KEY] }),
  })
}

export function useUpdateShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateShopItemRequest }) =>
      shopApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SHOP_KEY] }),
  })
}

export function useDeleteShopItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => shopApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SHOP_KEY] }),
  })
}
