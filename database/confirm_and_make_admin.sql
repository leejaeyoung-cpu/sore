-- ========================================
-- 이메일 확인 및 관리자 권한 부여
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- 1단계: 이메일 확인 처리
-- 여기에 가입한 이메일 입력하세요!
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your@email.com';  -- ← 여기를 실제 이메일로 변경!

-- 2단계: 관리자 권한 부여
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';  -- ← 여기를 실제 이메일로 변경!

-- 완료!
-- 이제 로그인하면 관리자 화면을 볼 수 있습니다.
