// src/app/api/reservations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 요청 데이터 검증
    const {
      property_id,
      email,
      guest_count,
      check_in_date,
      check_out_date,
      total_price,
      invoice,
      special_requests,
      options,
    } = body

    // 필수 필드 검증
    if (!property_id || !email || !guest_count || !check_in_date || !check_out_date || total_price === undefined) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 })
    }

    // 날짜 검증
    const checkIn = new Date(check_in_date)
    const checkOut = new Date(check_out_date)

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: '퇴실일은 입실일보다 이후여야 합니다.' }, { status: 400 })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 })
    }

    // 인원 수 검증
    if (guest_count < 1) {
      return NextResponse.json({ error: '인원 수는 1명 이상이어야 합니다.' }, { status: 400 })
    }

    // 가격 검증
    if (total_price < 0) {
      return NextResponse.json({ error: '가격은 0 이상이어야 합니다.' }, { status: 400 })
    }

    // 🔥 날짜 겹침 검증
    // 해당 숙소에서 취소되지 않은 예약 중 날짜가 겹치는지 확인
    // 조건: 새 체크인 < 기존 체크아웃 AND 새 체크아웃 > 기존 체크인
    const { data: conflictingReservations, error: conflictError } = await supabase
      .from('reservations')
      .select('id, check_in_date, check_out_date, reservation_code')
      .eq('property_id', property_id)
      .neq('status', 'cancelled') // 취소된 예약은 제외
      .lt('check_in_date', check_out_date) // 기존 체크인 < 새 체크아웃
      .gt('check_out_date', check_in_date) // 기존 체크아웃 > 새 체크인

    if (conflictError) {
      console.error('Conflict check error:', conflictError)
      return NextResponse.json({ error: '예약 가능 여부 확인 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 겹치는 예약이 있으면 거부
    if (conflictingReservations && conflictingReservations.length > 0) {
      return NextResponse.json(
        {
          error: 'The selected dates are not available. Please choose different dates.',
          conflicts: conflictingReservations.map((r) => ({
            check_in: r.check_in_date,
            check_out: r.check_out_date,
          })),
        },
        { status: 409 }, // 409 Conflict
      )
    }

    // 예약 생성
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        property_id,
        email,
        guest_count,
        check_in_date,
        check_out_date,
        total_price,
        invoice: invoice || null,
        special_requests: special_requests || null,
        options: options || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: '예약 생성에 실패했습니다.', details: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: '예약이 성공적으로 생성되었습니다.',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
