'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PropertyCreatePayload, PropertyUpdatePayload, PropertyListItem, PropertyGetResponse } from '@/types/property'

// 유틸
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'API Error')
  return data
}

// 목록
export function usePropertyList() {
  return useQuery<PropertyListItem[]>({
    queryKey: ['properties'],
    queryFn: () => api('/api/properties'),
  })
}

// 단건 조회
export function usePropertyGet(id: string | null) {
  return useQuery<PropertyGetResponse>({
    queryKey: ['property', id],
    queryFn: () => api(`/api/properties/get?id=${id}`),
    enabled: !!id,
  })
}

// 생성
export function usePropertyCreate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PropertyCreatePayload) =>
      api<{ id: string }>('/api/properties/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

// 수정
export function usePropertyUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PropertyUpdatePayload) =>
      api<{ success: boolean }>('/api/properties/update', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] })
    },
  })
}

// 삭제
export function usePropertyDelete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<{ success: boolean }>(`/api/properties/delete?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}
