'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  PropertyCreatePayload,
  PropertyGetResponse,
  PropertyListItem,
  PropertyUpdatePayload,
} from '@/types/property'

// 키 헬퍼
const qk = {
  list: ['properties'] as const,
  detail: (id: string) => ['property', id] as const,
}

/** 목록 (필요시 쿼리스트링로 필터/페이지네이션 추가) */
export function usePropertyList() {
  return useQuery<PropertyListItem[]>({
    queryKey: qk.list,
    queryFn: () => api('/api/properties'),
  })
}

/** 단건 조회 */
export function usePropertyGet(id?: string) {
  return useQuery<PropertyGetResponse>({
    queryKey: id ? qk.detail(id) : ['property', 'empty'],
    queryFn: () => api(`/api/properties/get?id=${id}`),
    enabled: !!id,
  })
}

/** 생성 */
export function usePropertyCreate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PropertyCreatePayload) =>
      api<{ id: string }>('/api/properties/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.list })
    },
  })
}

/** 수정 (부분 업데이트 + 서버에서 컬렉션 치환) */
export function usePropertyUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PropertyUpdatePayload) =>
      api('/api/properties/update', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_res, vars) => {
      if (vars.id) qc.invalidateQueries({ queryKey: qk.detail(vars.id) })
      qc.invalidateQueries({ queryKey: qk.list })
    },
  })
}

/** 삭제 */
export function usePropertyDelete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/api/properties/delete?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.list })
    },
  })
}
