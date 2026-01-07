// client/src/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// GET: 문의 목록 조회 (제목, 상태, 작성일만 - 내용은 상세에서)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('search_query')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let query = supabase
      .from('inquiries')
      .select('id, subject, email, status, created_at, updated_at, password_hash, category')
      .order('created_at', { ascending: false })

    // 검색 필터 (이메일 OR 제목)
    if (searchQuery && searchQuery.trim()) {
      query = query.or(`email.ilike.%${searchQuery.trim()}%,subject.ilike.%${searchQuery.trim()}%`)
    }

    // 월별 필터
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Inquiries fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
    }

    // password_hash는 boolean으로만 노출 (보안)
    const sanitizedData = data.map((inquiry) => ({
      id: inquiry.id,
      subject: inquiry.subject,
      category: inquiry.category,
      email: inquiry.email,
      status: inquiry.status,
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at,
      has_password: !!inquiry.password_hash,
    }))

    return NextResponse.json({ data: sanitizedData })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 새 문의 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, email, password, reservation_code, content, sender_name, category } = body

    // 필수 필드 검증
    if (!subject || !email || !content) {
      return NextResponse.json({ error: 'Subject, email, and content are required' }, { status: 400 })
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 제목 길이 검증
    if (subject.length > 200) {
      return NextResponse.json({ error: 'Subject is too long (max 200 characters)' }, { status: 400 })
    }

    // 비밀번호 해싱 (선택사항)
    let password_hash = null
    if (password && password.trim()) {
      password_hash = await bcrypt.hash(password, 10)
    }

    // 트랜잭션: inquiries + inquiry_messages 동시 생성
    // 1. inquiries 테이블에 삽입
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        subject,
        category,
        email,
        password_hash,
        reservation_code: reservation_code || null,
        status: 'pending',
      })
      .select()
      .single()

    if (inquiryError) {
      console.error('Inquiry creation error:', inquiryError)
      return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
    }

    // 2. inquiry_messages 테이블에 첫 메시지 삽입
    const { error: messageError } = await supabase.from('inquiry_messages').insert({
      inquiry_id: inquiry.id,
      sender_type: 'customer',
      sender_name: sender_name || null,
      content,
    })

    if (messageError) {
      console.error('Message creation error:', messageError)
      // 메시지 삽입 실패 시 문의도 삭제 (롤백)
      await supabase.from('inquiries').delete().eq('id', inquiry.id)
      return NextResponse.json({ error: 'Failed to create inquiry message' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        id: inquiry.id,
        subject: inquiry.subject,
        category: inquiry.category,
        email: inquiry.email,
        status: inquiry.status,
        created_at: inquiry.created_at,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
