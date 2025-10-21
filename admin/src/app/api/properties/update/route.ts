import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Missing property id' }, { status: 400 })
    }

    const { error } = await supabase.rpc('fn_property_update', {
      p_id: body.id,
      p_name: body.name,
      p_description: body.description,
      p_check_in: body.check_in,
      p_check_out: body.check_out,
      p_price_per_night: body.price_per_night,
      p_currency: body.currency,
      p_address: body.address,
      p_space: body.space_info,
      p_rules: body.rules,
      p_amenities: body.amenities,
      p_images: body.images,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
