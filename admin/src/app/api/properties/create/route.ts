import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSchema } from '@/schemas/property'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? 'Invalid payload'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const b = parsed.data

    const { data, error } = await supabase.rpc('fn_property_create', {
      p_name: b.name,
      p_description: b.description ?? null,
      p_check_in: b.check_in ?? null,
      p_check_out: b.check_out ?? null,
      p_price_per_night: b.price_per_night,
      p_currency: b.currency ?? 'KRW',
      p_address: b.address ?? null, // {iframe_src,address1,address2,guide}
      p_space: b.space_info ?? null, // {available_people,living_rooms,bedrooms,bathrooms}
      p_rules: b.rules ?? [],
      p_amenities: b.amenities ?? [],
      p_images: b.images ?? [],
      p_is_visible: b.is_visible ?? true,
    } as any)

    if (error) throw error
    return NextResponse.json({ id: data }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
