// api/admin/reservations/calendar/route.ts

// (GET - 달력용 예약 조회)

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const propertyId = searchParams.get('property_id')

    if (!year || !month) {
      return NextResponse.json({ error: 'year and month are required' }, { status: 400 })
    }

    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`

    let query = supabase
      .from('reservations')
      .select(
        `
        id,
        reservation_code,
        check_in_date,
        check_out_date,
        status,
        guest_count,
        property_id,
        properties!inner (
          id,
          name
        )
      `,
      )
      .neq('status', 'cancelled')
      .or(`check_in_date.lte.${endDate},check_out_date.gte.${startDate}`)

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data: reservations, error } = await query

    if (error) {
      console.error('Calendar fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
    }

    return NextResponse.json({ data: reservations })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
