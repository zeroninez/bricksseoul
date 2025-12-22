// api/admin/reservations/[id]/route.ts

// (GET - 단일 조회, PATCH - 수정, DELETE - 삭제)

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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
      .eq('id', id)
      .single()

    if (error || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // 데이터 가공
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
      updated_at: reservation.updated_at,
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, email, guest_count, check_in_date, check_out_date, total_price, special_requests } = body

    // 업데이트할 데이터 준비
    const updateData: any = {}

    if (status !== undefined) {
      updateData.status = status

      // 상태에 따라 타임스탬프 업데이트
      if (status === 'confirmed' && !updateData.confirmed_at) {
        updateData.confirmed_at = new Date().toISOString()
      }
      if (status === 'cancelled' && !updateData.cancelled_at) {
        updateData.cancelled_at = new Date().toISOString()
      }
    }

    if (email !== undefined) updateData.email = email
    if (guest_count !== undefined) updateData.guest_count = guest_count
    if (check_in_date !== undefined) updateData.check_in_date = check_in_date
    if (check_out_date !== undefined) updateData.check_out_date = check_out_date
    if (total_price !== undefined) updateData.total_price = total_price
    if (special_requests !== undefined) updateData.special_requests = special_requests

    // 예약 업데이트
    const { data, error } = await supabase.from('reservations').update(updateData).eq('id', id).select().single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Reservation updated successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { error } = await supabase.from('reservations').delete().eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
