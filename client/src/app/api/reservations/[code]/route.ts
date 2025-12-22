import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params // await 추가!

    if (!code) {
      return NextResponse.json({ error: 'Reservation code is required' }, { status: 400 })
    }

    // 예약 정보 조회
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(
        `
        *,
        properties!inner (
          id,
          name,
          price_per_night,
          currency,
          property_images!left (
            url,
            is_primary,
            sort_order
          ),
          property_address!left (
            address1,
            address2
          )
        )
      `,
      )
      .eq('reservation_code', code.toUpperCase())
      .single()

    if (error || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // 이미지 정보 가공
    const property = reservation.properties as any
    const imgs = (property.property_images ?? []) as Array<{
      url: string
      is_primary: boolean
      sort_order: number
    }>
    const thumbnail =
      imgs.find((i) => i.is_primary)?.url ??
      imgs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ??
      null

    // 응답 데이터 구조화
    const response = {
      id: reservation.id,
      reservation_code: reservation.reservation_code,
      email: reservation.email,
      guest_count: reservation.guest_count,
      check_in_date: reservation.check_in_date,
      check_out_date: reservation.check_out_date,
      total_price: reservation.total_price,
      status: reservation.status,
      special_requests: reservation.special_requests,
      options: reservation.options,
      invoice: reservation.invoice,
      confirmed_at: reservation.confirmed_at,
      cancelled_at: reservation.cancelled_at,
      created_at: reservation.created_at,
      property: {
        id: property.id,
        name: property.name,
        price_per_night: property.price_per_night,
        currency: property.currency,
        thumbnail,
        images: imgs.map((i) => ({ url: i.url })),
        address: {
          address1: property.property_address?.address1,
          address2: property.property_address?.address2,
        },
      },
    }

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
