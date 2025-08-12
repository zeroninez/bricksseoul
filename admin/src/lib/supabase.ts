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
  console.log('updateProperty 시작:', { propertyId, property, images })

  try {
    // 1. property 수정
    if (property) {
      console.log('Property 업데이트 중...')
      const { error: propertyError } = await supabase.from('property').update(property).eq('id', propertyId)

      if (propertyError) {
        console.error('Property 업데이트 오류:', propertyError)
        throw propertyError
      }
      console.log('Property 업데이트 완료')
    }

    // 2. 이미지 추가/수정/삭제
    if (images) {
      console.log('이미지 업데이트 시작, 받은 이미지:', images)

      // (1) 현재 DB의 이미지 목록 불러오기
      const { data: existingImages, error: fetchError } = await supabase
        .from('property_image')
        .select('*')
        .eq('property_id', propertyId)

      if (fetchError) {
        console.error('기존 이미지 조회 오류:', fetchError)
        throw fetchError
      }

      console.log('기존 이미지:', existingImages)

      const existingIds = existingImages?.map((img) => img.id) ?? []
      const incomingIds = images.filter((img) => img.id !== null && img.id !== undefined).map((img) => img.id!) // 새 이미지 제외

      console.log('기존 ID들:', existingIds)
      console.log('새로 받은 ID들:', incomingIds)

      // (2) 삭제할 이미지 = 기존에는 있는데, 새 배열에는 없는 것
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id))
      console.log('삭제할 이미지 ID들:', toDelete)

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase.from('property_image').delete().in('id', toDelete)
        if (deleteError) {
          console.error('이미지 삭제 오류:', deleteError)
          throw deleteError
        }
        console.log('이미지 삭제 완료:', toDelete)
      }

      // (3) 수정할 이미지 (id가 있고, 기존에도 있는)
      const toUpdate = images.filter((img) => img.id && existingIds.includes(img.id))
      console.log('수정할 이미지들:', toUpdate)

      for (const img of toUpdate) {
        const { id, ...rest } = img
        console.log(`이미지 ID ${id} 업데이트 중:`, rest)

        const { error: updateError } = await supabase.from('property_image').update(rest).eq('id', id!)
        if (updateError) {
          console.error(`이미지 ID ${id} 업데이트 오류:`, updateError)
          throw updateError
        }
        console.log(`이미지 ID ${id} 업데이트 완료`)
      }

      // (4) 새로 추가할 이미지 (id가 null이거나 undefined)
      const toInsert = images
        .filter((img) => img.id === null || img.id === undefined)
        .map((img) => {
          const { id, ...rest } = img // id 제거
          return { ...rest, property_id: propertyId }
        })

      console.log('추가할 이미지들:', toInsert)

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from('property_image').insert(toInsert)
        if (insertError) {
          console.error('이미지 추가 오류:', insertError)
          throw insertError
        }
        console.log('이미지 추가 완료:', toInsert)
      }
    }

    // 3. 상세 정보 업데이트
    if (detail) {
      console.log('Detail 업데이트 중...')
      const { data: existingDetail } = await supabase
        .from('property_detail')
        .select('id')
        .eq('property_id', propertyId)
        .single()

      if (existingDetail) {
        const { error: detailError } = await supabase
          .from('property_detail')
          .update(detail)
          .eq('property_id', propertyId)
        if (detailError) {
          console.error('Detail 업데이트 오류:', detailError)
          throw detailError
        }
      } else {
        const { error: detailError } = await supabase
          .from('property_detail')
          .insert([{ ...detail, property_id: propertyId }])
        if (detailError) {
          console.error('Detail 추가 오류:', detailError)
          throw detailError
        }
      }
      console.log('Detail 업데이트 완료')
    }

    console.log('updateProperty 완료')
    return true
  } catch (error) {
    console.error('updateProperty 전체 오류:', error)
    throw error
  }
}
