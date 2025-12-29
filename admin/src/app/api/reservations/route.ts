// admin/src/app/api/reservations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // 필터 파라미터
    const status = searchParams.get('status')
    const propertyId = searchParams.get('property_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const email = searchParams.get('email')
    const code = searchParams.get('code')

    // 페이지네이션
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // ✅ 모든 필드 조회
    let query = supabase.from('reservations').select(
      `
        *,
        properties!inner (
          id,
          name,
          check_in,
          check_out,
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
      { count: 'exact' },
    )

    // 필터 적용
    if (status) {
      query = query.eq('status', status)
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    if (startDate) {
      query = query.gte('check_in_date', startDate)
    }

    if (endDate) {
      query = query.lte('check_out_date', endDate)
    }

    if (email) {
      query = query.ilike('email', `%${email}%`)
    }

    if (code) {
      query = query.ilike('reservation_code', `%${code.toUpperCase()}%`)
    }

    // 정렬 및 페이지네이션
    const {
      data: reservations,
      error,
      count,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      console.error('Reservations fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }

    // ✅ 모든 필드 포함
    const formattedReservations = reservations?.map((reservation: any) => {
      const property = reservation.properties
      const imgs = (property.property_images ?? []) as Array<{
        url: string
        is_primary: boolean
        sort_order: number
      }>
      const thumbnail =
        imgs.find((i) => i.is_primary)?.url ??
        imgs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ??
        null

      return {
        id: reservation.id,
        reservation_code: reservation.reservation_code,
        email: reservation.email,
        guest_count: reservation.guest_count,
        check_in_date: reservation.check_in_date,
        check_out_date: reservation.check_out_date,
        total_price: reservation.total_price,
        status: reservation.status,
        special_requests: reservation.special_requests,
        confirmed_at: reservation.confirmed_at,
        cancelled_at: reservation.cancelled_at,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        options: reservation.options,
        invoice: reservation.invoice,
        property: {
          id: property.id,
          name: property.name,
          thumbnail,
          check_in_time: property.check_in || null,
          check_out_time: property.check_out || null,
          address: {
            address1: property.property_address?.address1 || null,
            address2: property.property_address?.address2 || null,
          },
        },
      }
    })

    return NextResponse.json({
      data: formattedReservations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
