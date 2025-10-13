import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing property id' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('fn_property_get', { p_id: id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  return NextResponse.json(data)
}
