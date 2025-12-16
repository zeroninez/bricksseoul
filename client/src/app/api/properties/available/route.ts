// api/properties/available/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const checkInDate = searchParams.get('check_in')
    const checkOutDate = searchParams.get('check_out')

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ error: 'check_in and check_out parameters are required' }, { status: 400 })
    }

    // 1. 모든 숙소 가져오기 (기존 API와 동일한 구조)
    const { data: allProperties, error: propertiesError } = await supabase
      .from('properties')
      .select(
        `
        id,
        name,
        price_per_night,
        currency,
        created_at,
        property_images!left (
          url,
          is_primary,
          sort_order
        ),
        property_address!left (
          address1,
          address2
        )
      `,
      )
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (propertiesError) {
      console.error('Properties fetch error:', propertiesError)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    if (!allProperties || allProperties.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // 2. 각 숙소별로 날짜 겹침 확인
    const availableProperties = []

    for (const property of allProperties) {
      // 해당 숙소에서 선택한 날짜와 겹치는 예약 찾기
      const { data: conflictingReservations, error: conflictError } = await supabase
        .from('reservations')
        .select('id')
        .eq('property_id', property.id)
        .neq('status', 'cancelled')
        .lt('check_in_date', checkOutDate) // 기존 체크인 < 새 체크아웃
        .gt('check_out_date', checkInDate) // 기존 체크아웃 > 새 체크인

      if (conflictError) {
        console.error(`Conflict check error for property ${property.id}:`, conflictError)
        continue
      }

      // 겹치는 예약이 없으면 예약 가능
      if (!conflictingReservations || conflictingReservations.length === 0) {
        availableProperties.push(property)
      }
    }

    // 3. 기존 API와 동일한 형식으로 가공
    const list = availableProperties.map((p: any) => {
      const imgs = (p.property_images ?? []) as Array<{ url: string; is_primary: boolean; sort_order: number }>
      const thumbnail =
        imgs.find((i) => i.is_primary)?.url ??
        imgs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ??
        null

      return {
        id: p.id,
        name: p.name,
        price_per_night: p.price_per_night,
        currency: p.currency,
        created_at: p.created_at,
        thumbnail,
        images: imgs.map((i) => ({ url: i.url })),
        location: [p.property_address?.address1, p.property_address?.address2].filter(Boolean).join(' ') || null,
      }
    })

    return NextResponse.json({ data: list })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
