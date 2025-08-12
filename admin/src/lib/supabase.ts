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

export async function getAllProperties() {
  // 1. property 기본 정보
  const { data: properties, error } = await supabase
    .from('property')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!properties) return []

  const propertyIds = properties.map((p) => p.id)

  // 2. 이미지 첫번째만
  const { data: image } = await supabase
    .from('property_image')
    .select('*')
    .in('property_id', propertyIds)
    .order('sort_order', { ascending: true })
    .limit(1)

  // 5. 합치기
  return properties.map((p) => ({
    ...p,
    thumbnail: image?.find((img) => img.property_id === p.id) || null,
  }))
}

export async function getPropertyBySlug(slug: string) {
  // 1. property 기본 정보
  const { data: properties, error } = await supabase.from('property').select('*').eq('slug', slug).single()
  // slug로 단일 조회
  if (error) throw error
  if (!properties) return null
  const propertyId = properties.id
  // 2. 이미지들
  const { data: images } = await supabase.from('property_image').select('*').eq('property_id', propertyId)
  // property_id로 단일 조회
  // 3. 상세정보
  const { data: details } = await supabase.from('property_detail').select('*').eq('property_id', propertyId)
  // property_id로 단일 조회
  // 4. 예약정보
  const { data: reservations } = await supabase
    .from('property_reservation')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'approved') // 확정 예약만
  // property_id로 단일 조회
  // 5. 합치기
  return {
    ...properties,
    images: images || [],
    detail: details?.[0] || null,
    reservations: reservations || [],
  }
}

/**
 * 숙소 수정
 */
export async function updateProperty({
  propertyId,
  property,
  detail,
  images,
}: {
  propertyId: number
  property?: Partial<PropertyRow>
  detail?: Partial<PropertyDetailRow>
  images?: Partial<PropertyImageRow>[]
}) {
  // 1. property 수정
  if (property) {
    const { error: propertyError } = await supabase.from('property').update(property).eq('id', propertyId)

    if (propertyError) throw propertyError
  }

  // 2. 이미지 추가/수정/삭제
  if (images) {
    // (1) 현재 DB의 이미지 목록 불러오기
    const { data: existingImages, error: fetchError } = await supabase
      .from('property_image')
      .select('*')
      .eq('property_id', propertyId)
    if (fetchError) throw fetchError

    const existingIds = existingImages?.map((img) => img.id) ?? []
    const incomingIds = images.filter((img) => !!img.id).map((img) => img.id!) // 새 이미지 제외

    // (2) 삭제할 이미지 = 기존에는 있는데, 새 배열에는 없는 것
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id))
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase.from('property_image').delete().in('id', toDelete)
      if (deleteError) throw deleteError
    }

    // (3) 수정할 이미지 (id가 있고, 기존에도 있는)
    const toUpdate = images.filter((img) => img.id && existingIds.includes(img.id))
    for (const img of toUpdate) {
      const { id, ...rest } = img
      const { error: updateError } = await supabase.from('property_image').update(rest).eq('id', id!)
      if (updateError) throw updateError
    }

    // (4) 새로 추가할 이미지 (id가 없음)
    const toInsert = images.filter((img) => !img.id).map((img) => ({ ...img, property_id: propertyId }))
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('property_image').insert(toInsert)
      if (insertError) throw insertError
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
