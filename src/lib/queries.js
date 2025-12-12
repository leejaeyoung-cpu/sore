// Supabase 데이터 조회 헬퍼 함수들

import { supabase } from './supabase'

// ========================================
// 공지사항 관련
// ========================================

// 활성 공지사항 가져오기
export async function getActiveAnnouncements(limit = 5) {
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .not('published_at', 'is', null)
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('공지사항 조회 오류:', error)
        return []
    }

    return data || []
}

// ========================================
// 주보 관련
// ========================================

// 최신 주보 가져오기
export async function getLatestBulletins(limit = 5) {
    const { data, error } = await supabase
        .from('bulletins')
        .select('*')
        .not('published_at', 'is', null)
        .order('week_of', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('주보 조회 오류:', error)
        return []
    }

    return data || []
}

// ========================================
// 미사 시간 관련
// ========================================

// 활성 미사 시간표 가져오기
export async function getMassSchedules() {
    const { data, error } = await supabase
        .from('mass_schedules')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('time', { ascending: true })

    if (error) {
        console.error('미사 시간표 조회 오류:', error)
        return []
    }

    return data || []
}

// 요일별로 그룹화된 미사 시간표
export async function getMassSchedulesByDay() {
    const schedules = await getMassSchedules()

    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const grouped = {}

    schedules.forEach(schedule => {
        const day = days[schedule.day_of_week]
        if (!grouped[day]) {
            grouped[day] = []
        }
        grouped[day].push(schedule)
    })

    return grouped
}

// ========================================
// 유틸리티 함수
// ========================================

// 날짜 포맷팅 (한국어)
export function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date)
}

// 시간 포맷팅
export function formatTime(timeString) {
    const [hour, minute] = timeString.split(':')
    const h = parseInt(hour)
    const ampm = h >= 12 ? '오후' : '오전'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${ampm} ${displayHour}:${minute}`
}

console.log('✅ Supabase 쿼리 헬퍼 로드 완료')
