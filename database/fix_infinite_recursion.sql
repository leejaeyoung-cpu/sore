-- ========================================
-- RLS 무한 재귀 문제 해결
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- mass_schedules: 관리자 정책 삭제 (이미 anon으로 읽기 가능하므로 불필요)
DROP POLICY IF EXISTS "Staff can manage schedules" ON mass_schedules;

-- announcements: 관리자 정책 삭제
DROP POLICY IF EXISTS "Staff can manage announcements" ON announcements;

-- bulletins: 관리자 정책 삭제
DROP POLICY IF EXISTS "Staff can manage bulletins" ON bulletins;

-- events: 관리자 정책 삭제
DROP POLICY IF EXISTS "Staff can manage events" ON events;

-- profiles: 관리자 정책 삭제 (무한 재귀 원인)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 완료!
-- 이제 브라우저를 새로고침하세요.
-- 
-- 참고: 관리자 기능은 나중에 인증 시스템을 추가할 때 다시 설정할 예정입니다.
