// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
export type AccessCodeRow = Database['public']['Tables']['access_codes']['Row']
export type PropertyRow = Database['public']['Tables']['property']['Row']
export type PropertyImageRow = Database['public']['Tables']['property_image']['Row']
export type PropertyDetailRow = Database['public']['Tables']['property_detail']['Row']
export type PropertyReservationRow = Database['public']['Tables']['property_reservation']['Row']

export async function getAllPropertiesFull() {
  // 1. property 기본 정보
  const { data: properties, error } = await supabase
    .from('property')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!properties) return []

  const propertyIds = properties.map((p) => p.id)

  // 2. 이미지들
  const { data: images } = await supabase
    .from('property_image')
    .select('*')
    .in('property_id', propertyIds)
    .order('sort_order', { ascending: true })

  // 3. 상세정보
  const { data: details } = await supabase.from('property_detail').select('*').in('property_id', propertyIds)

  // 4. 예약정보
  const { data: reservations } = await supabase
    .from('property_reservation')
    .select('*')
    .in('property_id', propertyIds)
    .eq('status', 'approved') // 확정 예약만

  // 5. 합치기
  return properties.map((p) => ({
    ...p,
    images: images?.filter((img) => img.property_id === p.id) || [],
    detail: details?.find((d) => d.property_id === p.id) || null,
    reservations: reservations?.filter((r) => r.property_id === p.id) || [],
  }))
}

/**
 * 숙소 수정
 */
export async function updateProperty({
  propertyId,
  property,
  images,
  detail,
}: {
  propertyId: number
  property?: Partial<PropertyRow>
  images?: Omit<PropertyImageRow, 'id' | 'property_id'>[]
  detail?: Partial<PropertyDetailRow>
}) {
  // 1. property 수정
  if (property) {
    const { error: propertyError } = await supabase.from('property').update(property).eq('id', propertyId)

    if (propertyError) throw propertyError
  }

  // 2. 이미지 업데이트 (여기서는 간단히 기존 삭제 후 재삽입)
  if (images) {
    // 기존 이미지 삭제
    await supabase.from('property_image').delete().eq('property_id', propertyId)
    // 새 이미지 삽입
    if (images.length > 0) {
      const { error: imageError } = await supabase.from('property_image').insert(
        images.map((img, index) => ({
          ...img,
          property_id: propertyId,
          sort_order: index,
        })),
      )
      if (imageError) throw imageError
    }
  }

  // 3. 상세 정보 업데이트
  if (detail) {
    const { data: existingDetail } = await supabase
      .from('property_detail')
      .select('id')
      .eq('property_id', propertyId)
      .single()

    if (existingDetail) {
      const { error: detailError } = await supabase.from('property_detail').update(detail).eq('property_id', propertyId)
      if (detailError) throw detailError
    } else {
      const { error: detailError } = await supabase
        .from('property_detail')
        .insert([{ ...detail, property_id: propertyId }])
      if (detailError) throw detailError
    }
  }

  return true
}
