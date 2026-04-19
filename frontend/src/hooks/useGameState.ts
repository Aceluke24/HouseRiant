import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamestateApi } from '../api'
import type { UpdateGameDateRequest } from '../types'

export const GAME_STATE_KEY = 'gameState'

export function useGameState() {
  return useQuery({
    queryKey: [GAME_STATE_KEY],
    queryFn: () => gamestateApi.get(),
  })
}

export function useUpdateGameDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGameDateRequest) => gamestateApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GAME_STATE_KEY] }),
  })
}
