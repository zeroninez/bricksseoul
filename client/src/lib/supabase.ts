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
 * 예약 요청 생성 함수
 * @param propertyId 숙소 ID
 * @param startDate 예약 시작 날짜 (YYYY-MM-DD)
 * @param endDate 예약 종료 날짜 (YYYY-MM-DD)
 * @param requesterEmail 요청자 이메일
 */
export async function createReservationRequest(
  propertyId: number,
  startDate: string,
  endDate: string,
  requesterEmail: string,
) {
  const { data, error } = await supabase
    .from('property_reservation')
    .insert([
      {
        property_id: propertyId,
        start_date: startDate,
        end_date: endDate,
        status: 'pending', // 예약 요청 상태
        requester_email: requesterEmail,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}
