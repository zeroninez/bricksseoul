// admin/src/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 모든 문의 목록 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 필터링: pending, replied
    const searchQuery = searchParams.get('search_query')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let query = supabase
      .from('inquiries')
      .select('id, subject, email, status, created_at, updated_at, password_hash, reservation_code, category')
      .order('created_at', { ascending: false })

    // 상태 필터
    if (status && ['pending', 'replied'].includes(status)) {
      query = query.eq('status', status)
    }

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

    // password_hash는 boolean으로만 노출
    const sanitizedData = data.map((inquiry) => ({
      id: inquiry.id,
      subject: inquiry.subject,
      category: inquiry.category,
      email: inquiry.email,
      status: inquiry.status,
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at,
      has_password: !!inquiry.password_hash,
      reservation_code: inquiry.reservation_code,
    }))

    return NextResponse.json({ data: sanitizedData })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
