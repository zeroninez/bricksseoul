// api/properties/route.ts

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // 기본 숙소 목록 + 대표 이미지 + 주소만 가져오기
  const { data, error } = await supabase
    .from('properties')
    .select(
      `
      id,
      name,
      price_per_night,
      currency,
      created_at,
      property_images!left (
        url,
        is_primary,
        sort_order
      ),
      property_address!left (
        address1,
        address2
      ),
      is_visible
    `,
    )
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 이미지/주소 형태를 프론트에 맞게 가공
  const list = (data ?? []).map((p: any) => {
    const imgs = (p.property_images ?? []) as Array<{ url: string; is_primary: boolean; sort_order: number }>
    const thumbnail =
      imgs.find((i) => i.is_primary)?.url ??
      imgs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url ??
      null

    return {
      id: p.id,
      name: p.name,
      price_per_night: p.price_per_night,
      currency: p.currency,
      thumbnail,
      images: imgs.map((i) => ({ url: i.url })),
      address1: p.property_address?.address1 ?? null, // ← 분리해서 그대로
      address2: p.property_address?.address2 ?? null,
      is_visible: p.is_visible, // ← 추가
    }
  })

  return NextResponse.json(list)
}
