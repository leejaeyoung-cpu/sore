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

// ========================================
// FCM 토큰 관련 (로컬 스토리지 사용)
// ========================================

// FCM 토큰 저장 - 로컬 스토리지 우선, Supabase는 선택적
export async function saveFCMToken(token, deviceInfo = {}) {
    console.log('💾 FCM 토큰 저장 시작:', token.substring(0, 30) + '...')

    // 1. 로컬 스토리지에 저장 (항상 성공)
    try {
        const tokenData = {
            token,
            deviceInfo,
            is_subscribed: true,
            savedAt: new Date().toISOString()
        }
        localStorage.setItem('fcm_token', JSON.stringify(tokenData))
        console.log('✅ 로컬 스토리지에 토큰 저장 완료')
    } catch (e) {
        console.error('로컬 스토리지 저장 실패:', e)
    }

    // 2. Supabase에도 저장 시도 (실패해도 괜찮음)
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from('fcm_tokens')
                .upsert({
                    user_id: user.id,
                    token: token,
                    device_info: deviceInfo,
                    is_subscribed: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'token'
                })

            if (error) {
                console.warn('Supabase 저장 실패 (로컬은 성공):', error.message)
            } else {
                console.log('✅ Supabase에도 토큰 저장 완료')
            }
        } else {
            console.log('⚠️ 로그인 안 됨 - 로컬 스토리지만 사용')
        }
    } catch (e) {
        console.warn('Supabase 연결 실패 (로컬은 성공):', e.message)
    }

    return { data: { success: true } }
}

// 구독 상태 조회 - 로컬 스토리지 우선
export async function getSubscriptionStatus() {
    // 1. 로컬 스토리지 확인
    try {
        const stored = localStorage.getItem('fcm_token')
        if (stored) {
            const tokenData = JSON.parse(stored)
            console.log('📱 로컬 스토리지에서 구독 상태:', tokenData.is_subscribed)
            return tokenData.is_subscribed
        }
    } catch (e) {
        console.error('로컬 스토리지 읽기 실패:', e)
    }

    // 2. Supabase 확인 (로그인된 경우만)
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return false

        const { data, error } = await supabase
            .from('fcm_tokens')
            .select('is_subscribed')
            .eq('user_id', user.id)
            .single()

        if (error || !data) return false

        return data.is_subscribed
    } catch (e) {
        return false
    }
}

// 구독 상태 토글 - 로컬 스토리지 우선
export async function toggleNotificationSubscription(enableSubscription = true) {
    console.log('🔄 구독 상태 변경:', enableSubscription)

    // 1. 로컬 스토리지 업데이트
    try {
        const stored = localStorage.getItem('fcm_token')
        if (stored) {
            const tokenData = JSON.parse(stored)
            tokenData.is_subscribed = enableSubscription
            tokenData.updatedAt = new Date().toISOString()
            localStorage.setItem('fcm_token', JSON.stringify(tokenData))
            console.log('✅ 로컬 스토리지 구독 상태 업데이트')
        }
    } catch (e) {
        console.error('로컬 스토리지 업데이트 실패:', e)
    }

    // 2. Supabase 업데이트 시도
    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { data: { success: true } }
        }

        const { error } = await supabase
            .from('fcm_tokens')
            .update({
                is_subscribed: enableSubscription,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)

        if (error) {
            console.warn('Supabase 업데이트 실패 (로컬은 성공):', error.message)
        }
    } catch (e) {
        console.warn('Supabase 연결 실패 (로컬은 성공):', e.message)
    }

    return { data: { success: true } }
}

// ========================================
// 그룹(단체) 관련
// ========================================

// 활성 그룹 목록 조회
export async function getGroups() {
    const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

    if (error) {
        console.error('그룹 조회 오류:', error)
        return []
    }

    return data || []
}

// 내가 속한 그룹 조회
export async function getMyGroups() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('group_members')
        .select(`
            group_id,
            role,
            groups (*)
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error('내 그룹 조회 오류:', error)
        return []
    }

    return data?.map(m => ({ ...m.groups, role: m.role })) || []
}

// 그룹 멤버 목록 조회 (관리자용)
export async function getGroupMembers(groupId) {
    const { data, error } = await supabase
        .from('group_members')
        .select(`
            *,
            profiles (name, email, avatar_url)
        `)
        .eq('group_id', groupId)

    if (error) {
        console.error('그룹 멤버 조회 오류:', error)
        return []
    }

    return data || []
}

// ========================================
// 게시글 관련
// ========================================

// 게시글 목록 조회
export async function getPosts(groupId = null, limit = 20) {
    let query = supabase
        .from('posts')
        .select(`
            *,
            author:profiles(name, avatar_url),
            group:groups(name)
        `)
        .not('published_at', 'is', null)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit)

    if (groupId === null) {
        query = query.is('group_id', null) // 전체 게시판
    } else {
        query = query.eq('group_id', groupId) // 특정 그룹
    }

    const { data, error } = await query

    if (error) {
        console.error('게시글 조회 오류:', error)
        return []
    }

    return data || []
}

// 게시글 상세 조회
export async function getPost(postId) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles(name, avatar_url),
            group:groups(name)
        `)
        .eq('id', postId)
        .single()

    if (error) {
        console.error('게시글 상세 조회 오류:', error)
        return null
    }

    // 조회수 증가
    if (data) {
        incrementViewCount(postId)
    }

    return data
}

// 게시글 작성
export async function createPost(postData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    const { data, error } = await supabase
        .from('posts')
        .insert({
            ...postData,
            author_id: user.id,
            published_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('게시글 작성 오류:', error)
        return { error }
    }

    return { data }
}

// 게시글 수정
export async function updatePost(postId, updates) {
    const { data, error } = await supabase
        .from('posts')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single()

    if (error) {
        console.error('게시글 수정 오류:', error)
        return { error }
    }

    return { data }
}

// 게시글 삭제
export async function deletePost(postId) {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

    if (error) {
        console.error('게시글 삭제 오류:', error)
        return { error }
    }

    return { success: true }
}

// 조회수 증가
async function incrementViewCount(postId) {
    const { data, error } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single()

    if (!error && data) {
        await supabase
            .from('posts')
            .update({ view_count: data.view_count + 1 })
            .eq('id', postId)
    }
}

// ========================================
// 관리자 기능 관련
// ========================================

// 앱 설정 가져오기
export async function getAppSetting(key) {
    const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single()

    if (error) {
        // 테이블이 없을 수도 있으므로 에러 로그는 생략하거나 조용히 처리
        return null
    }

    return data?.value
}

// 앱 설정 업데이트
export async function updateAppSetting(key, value) {
    const { error } = await supabase
        .from('app_settings')
        .upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error(`설정 업데이트 오류 (${key}):`, error)
        return { error }
    }

    return { success: true }
}

// 모든 게시글 조회 (관리자용)
export async function getAllPostsAdmin() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles(name, email),
            group:groups(name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('전체 게시글 조회 오류:', error)
        return []
    }

    return data || []
}

// 그룹 멤버 역할 변경
export async function updateGroupMemberRole(groupId, userId, newRole) {
    const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error('멤버 역할 변경 오류:', error)
        return { error }
    }

    return { success: true }
}

// 그룹 멤버 강제 탈퇴
export async function removeGroupMember(groupId, userId) {
    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)

    if (error) {
        console.error('멤버 탈퇴 처리 오류:', error)
        return { error }
    }

    return { success: true }
}

// 구독자 수 조회 (관리자용)
export async function getSubscriberCount() {
    const { count, error } = await supabase
        .from('fcm_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('is_subscribed', true)

    if (error) {
        console.error('구독자 수 조회 오류:', error)
        return 0
    }

    return count || 0
}

console.log('✅ Supabase 쿼리 헬퍼 로드 완료 (게시판 포함)')
