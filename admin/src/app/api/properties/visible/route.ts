// admin/src/app/api/properties/visible/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body.id !== 'string' || typeof body.is_visible !== 'boolean') {
      return NextResponse.json({ error: 'id (string)와 is_visible (boolean)이 필요합니다.' }, { status: 400 })
    }

    const { id, is_visible } = body

    const { error } = await supabase.from('properties').update({ is_visible }).eq('id', id)

    if (error) {
      console.error('Failed to update is_visible:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Unexpected error in /api/properties/visible:', err)
    return NextResponse.json({ error: err?.message ?? 'Unknown server error' }, { status: 500 })
  }
}
