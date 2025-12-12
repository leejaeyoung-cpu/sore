-- ========================================
-- 프로필 수동 생성 (name 포함)
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- RLS 비활성화
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 프로필 생성
INSERT INTO profiles (id, email, name, role)
VALUES (
    '84e28fad-8f4a-4e43-9af5-3cd771c9ad0c',
    'brookin@hanmail.net',
    '관리자',  -- ← 원하는 이름으로 변경 가능
    'admin'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', name = '관리자';

-- 확인
SELECT * FROM profiles;

-- 완료! 브라우저 새로고침하세요.
