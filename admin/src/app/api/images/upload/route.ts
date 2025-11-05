import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    // 고유 파일명 생성
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase() // 확장자 추출
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `uploads/${filename}`

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    const { error: uploadErr } = await admin.storage
      .from('property-images')
      .upload(path, file, { contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}` })
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

    const { data } = admin.storage.from('property-images').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Upload failed' }, { status: 500 })
  }
}
