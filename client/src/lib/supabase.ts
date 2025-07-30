// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 입장코드 타입 정의
export interface AccessCode {
  id: number
  code: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Property {
  id: number
  title: string
  location: string
  description: string | null
  content: string | null // HTML 컨텐츠
  featured_image_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Property Read
export const loadAllProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Property[]
}

export const loadProperty = async (id: number) => {
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).eq('is_published', true).single()

  if (error) throw error
  return data as Property
}
