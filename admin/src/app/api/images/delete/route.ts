// app/api/delete/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    // URL에서 파일 경로 추출
    // 예: https://xxx.supabase.co/storage/v1/object/public/property-images/uploads/123456-abc.jpg
    // -> uploads/123456-abc.jpg
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/property-images\/(.+)$/)

    if (!pathMatch || !pathMatch[1]) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const filePath = pathMatch[1]

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

    const { error: deleteErr } = await admin.storage.from('property-images').remove([filePath])

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: filePath }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Delete failed' }, { status: 500 })
  }
}
