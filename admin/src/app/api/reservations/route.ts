// api/admin/reservations/route.ts

// (GET - 전체 조회, POST - 생성)

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // 필터 파라미터
    const status = searchParams.get('status') // requested, confirmed, cancelled
    const propertyId = searchParams.get('property_id')
    const startDate = searchParams.get('start_date') // 기간 필터 시작
    const endDate = searchParams.get('end_date') // 기간 필터 끝
    const email = searchParams.get('email') // 이메일 검색
    const code = searchParams.get('code') // 예약 코드 검색

    // 페이지네이션
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // 쿼리 시작
    let query = supabase.from('reservations').select(
      `
        *,
        properties!inner (
          id,
          name,
          property_images!left (
            url,
            is_primary,
            sort_order
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

    // 데이터 가공
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
        property: {
          id: property.id,
          name: property.name,
          thumbnail,
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
