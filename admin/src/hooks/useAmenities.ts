// src/hooks/useAmenities.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Amenity = { code: string; label: string }

export function useAmenities() {
  return useQuery<Amenity[]>({
    queryKey: ['amenities'],
    queryFn: () => api('/api/amenities'), // -> /api/amenities 라우트에서 Supabase select
  })
}
