// admin/src/app/api/inquiries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 문의 상세 조회 (관리자 - 비밀번호 무시)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 1. 문의 정보 조회
    const { data: inquiry, error: inquiryError } = await supabase.from('inquiries').select('*').eq('id', id).single()

    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // 2. 메시지 목록 조회
    const { data: messages, error: messagesError } = await supabase
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Messages fetch error:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // password_hash는 노출하지 않음
    const { password_hash, ...inquiryData } = inquiry

    return NextResponse.json({
      data: {
        inquiry: {
          ...inquiryData,
          has_password: !!password_hash,
        },
        messages: messages || [],
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: 문의 상태 변경
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // 상태 검증
    if (!status || !['pending', 'replied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Status update error:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
