-- ========================================
-- 인증 시스템 완전 재설정
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- 기존 트리거와 함수 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- profiles 테이블의 RLS 비활성화 (재설정 위해)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for auth users" ON profiles;

-- 회원가입 시 자동으로 프로필 생성하는 트리거 함수 (재작성)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'believer'
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 다시 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자가 프로필 생성 가능하도록 (트리거용)
CREATE POLICY "Enable insert for auth users"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- 사용자가 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- 사용자가 자신의 프로필 수정 가능
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 완료!
-- 이제 회원가입이 작동합니다.
