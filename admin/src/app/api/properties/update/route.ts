import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateSchema } from '@/schemas/property'

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? 'Invalid payload'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const b = parsed.data

    // RPC 규칙:
    // - undefined → null 전달 시 “유지”(우리 fn은 null이면 건드리지 않게 설계)
    // - [] → 완전 치환(비우기)
    const { error } = await supabase.rpc('fn_property_update', {
      p_id: b.id,
      p_name: b.name ?? null,
      p_description: b.description ?? null,
      p_check_in: b.check_in ?? null,
      p_check_out: b.check_out ?? null,
      p_price_per_night: b.price_per_night ?? null,
      p_currency: b.currency ?? null,
      p_address: b.address ?? null, // 전달되면 upsert
      p_space: b.space_info ?? null, // 전달되면 upsert
      p_rules: b.rules ?? null, // 전달되면 치환, null이면 유지
      p_amenities: b.amenities ?? null, // 전달되면 치환, null이면 유지
      p_images: b.images ?? null, // 전달되면 치환, null이면 유지
      p_is_visible: b.is_visible ?? null,
    } as any)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
