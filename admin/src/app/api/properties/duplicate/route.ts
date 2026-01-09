// admin/src/app/api/properties/duplicate/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSchema } from '@/schemas/property'
import { PropertyGetResponse } from '@/types/property'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: '숙소 ID가 필요합니다.' }, { status: 400 })
    }

    // 1. 원본 숙소 데이터 가져오기 (fn_property_get 사용)
    const { data: rawData, error: fetchError } = await supabase.rpc('fn_property_get', {
      p_id: id,
    })

    if (fetchError || !rawData) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: '숙소를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 타입 캐스팅
    const originalData = rawData as PropertyGetResponse

    // 2. 복제할 데이터 준비 - createSchema 형식으로 변환
    const duplicateData = {
      name: `${originalData.name} (복사본)`,
      description: originalData.description,
      check_in: originalData.check_in,
      check_out: originalData.check_out,
      price_per_night: originalData.price_per_night,
      currency: originalData.currency,
      address: originalData.address,
      space_info: originalData.space_info,
      rules: originalData.rules,
      amenities: originalData.amenities?.map((a) => a.code) || [], // AmenityItem[] → string[]
      images: originalData.images,
      is_visible: false, // 복제된 숙소는 기본적으로 숨김 상태
    }

    // 3. createSchema로 검증
    const parsed = createSchema.safeParse(duplicateData)
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? '복제 데이터 검증 실패'
      console.error('Validation error:', parsed.error)
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const b = parsed.data

    // 4. 새로운 숙소 생성 (fn_property_create 사용)
    const { data: newPropertyId, error: createError } = await supabase.rpc('fn_property_create', {
      p_name: b.name,
      p_description: b.description ?? null,
      p_check_in: b.check_in ?? null,
      p_check_out: b.check_out ?? null,
      p_price_per_night: b.price_per_night,
      p_currency: b.currency ?? 'KRW',
      p_address: b.address ?? null,
      p_space: b.space_info ?? null,
      p_rules: b.rules ?? [],
      p_amenities: b.amenities ?? [],
      p_images: b.images ?? [],
      p_is_visible: b.is_visible ?? false,
    } as any)

    if (createError) {
      console.error('Create error:', createError)
      return NextResponse.json({ error: '숙소 복제에 실패했습니다.' }, { status: 500 })
    }

    // 5. 생성된 숙소 정보 조회
    const { data: rawNewData, error: getError } = await supabase.rpc('fn_property_get', {
      p_id: newPropertyId,
    })

    if (getError) {
      console.error('Get new property error:', getError)
      // 숙소는 생성되었지만 조회 실패 - 부분 성공으로 처리
      return NextResponse.json({
        success: true,
        data: { id: newPropertyId, name: b.name },
        message: '숙소가 복제되었습니다.',
      })
    }

    const newPropertyData = rawNewData as PropertyGetResponse

    return NextResponse.json({
      success: true,
      data: newPropertyData,
      message: '숙소가 성공적으로 복제되었습니다.',
    })
  } catch (error) {
    console.error('Duplicate property error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
