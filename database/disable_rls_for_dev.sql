-- ========================================
-- RLS 정책 완전 리셋 및 재설정
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- announcements 테이블의 모든 정책 삭제
DROP POLICY IF EXISTS "Anyone can view published announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can update announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can delete announcements" ON announcements;

-- created_by를 nullable로 변경
ALTER TABLE announcements ALTER COLUMN created_by DROP NOT NULL;

-- RLS 비활성화 (개발용)
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- bulletins도 동일하게
ALTER TABLE bulletins ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE bulletins DISABLE ROW LEVEL SECURITY;

-- mass_schedules도 RLS 비활성화
ALTER TABLE mass_schedules DISABLE ROW LEVEL SECURITY;

-- 완료!
-- 참고: 개발 단계에서는 RLS를 꺼두고, 나중에 인증 시스템 추가 후 다시 활성화합니다.
