-- ========================================
-- RLS 정책 문제 해결
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- RLS 비활성화
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for auth users" ON profiles;

-- RLS 다시 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 새 정책: 인증된 사용자가 프로필 생성 가능
CREATE POLICY "Enable insert for authenticated users"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 새 정책: 인증된 사용자가 모든 프로필 조회 가능
CREATE POLICY "Enable read for authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- 새 정책: 사용자가 자신의 프로필 수정 가능
CREATE POLICY "Enable update for users based on id"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 완료!
-- 브라우저 새로고침하세요.
