import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type GuestbookRow = {
  id: string
  user_id: string | null
  user_name: string
  archetype: string
  element: string
  country_code: string
  country: string
  country_flag: string
  rating: number
  content: string
  created_at: string
}
