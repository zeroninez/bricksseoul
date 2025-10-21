import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing property id' }, { status: 400 })
  }

  const { error } = await supabase.rpc('fn_property_delete', { p_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
