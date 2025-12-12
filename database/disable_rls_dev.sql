-- ========================================
-- 개발용: RLS 완전히 비활성화
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- profiles 테이블의 RLS 완전 비활성화
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 프로필이 존재하는지 확인
SELECT id, email, role FROM profiles;

-- 만약 프로필이 없다면 수동 생성:
-- INSERT INTO profiles (id, email, role)
-- VALUES ('84e28fad-8f4a-4e43-9af5-3cd771c9ad0c', '가입한이메일@example.com', 'admin');

-- 또는 role을 admin으로 변경:
-- UPDATE profiles SET role = 'admin' WHERE id = '84e28fad-8f4a-4e43-9af5-3cd771c9ad0c';
