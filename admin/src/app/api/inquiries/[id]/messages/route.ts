// admin/src/app/api/inquiries/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST: 답글 작성 (관리자)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Request body parse error:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { content, sender_name } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // 문의 존재 확인
    const { data: inquiry, error: inquiryError } = await supabase.from('inquiries').select('id').eq('id', id).single()

    if (inquiryError) {
      console.error('Inquiry fetch error:', inquiryError)
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // 답글 작성
    const { data: message, error: messageError } = await supabase
      .from('inquiry_messages')
      .insert({
        inquiry_id: id,
        sender_type: 'admin',
        sender_name: sender_name || 'Admin',
        content: content.trim(),
      })
      .select()
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      return NextResponse.json({ error: 'Failed to create message', details: messageError.message }, { status: 500 })
    }

    // 문의 상태를 'replied'로 변경 + updated_at 갱신
    const { error: updateError } = await supabase
      .from('inquiries')
      .update({
        status: 'replied',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Status update error:', updateError)
      // 상태 업데이트 실패해도 답글은 성공했으므로 계속 진행
    }

    return NextResponse.json({ data: message })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
