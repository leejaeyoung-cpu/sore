-- ========================================
-- 신규 사용자 이메일 확인 처리
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- 옵션 1: 특정 사용자만 확인
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = '신자이메일@example.com';  -- 실제 이메일로 변경

-- 옵션 2: 모든 미확인 사용자 확인
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 확인
SELECT email, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 완료!
-- 이제 로그인할 수 있습니다.
