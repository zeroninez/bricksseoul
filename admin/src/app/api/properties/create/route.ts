import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { data, error } = await supabase.rpc('fn_property_create', {
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

    return NextResponse.json({ id: data }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
