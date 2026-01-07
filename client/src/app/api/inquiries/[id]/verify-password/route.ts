// client/src/app/api/inquiries/[id]/verify-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// POST: 비밀번호 검증
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // 문의 조회
    const { data: inquiry, error } = await supabase.from('inquiries').select('password_hash').eq('id', id).single()

    if (error || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // 비밀번호가 설정되지 않은 경우
    if (!inquiry.password_hash) {
      return NextResponse.json({ verified: true })
    }

    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, inquiry.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
