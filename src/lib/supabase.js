import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!')
    console.error('VITE_SUPABASE_URL:', supabaseUrl)
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '미설정')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'church-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: false
    }
})

// 연결 테스트
console.log('✅ Supabase 클라이언트 초기화 완료')
console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔐 세션 저장: localStorage')
