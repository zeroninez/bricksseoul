// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type AccessCodeRow = Database['public']['Tables']['access_codes']['Row']

// Supabase에서 select로 받을 형태(조인 포함)
export type AccessLogRow = {
  id: number
  access_code_id: number | null
  accessed_at: string | null
  user_agent: string | null
  ip_address: string | null // ← 여기서 명확히 string|null
  user_type?: string | null
  access_codes: { code: string; name: string }
}
