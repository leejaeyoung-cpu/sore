-- ========================================
-- RLS 정책 수정 - 익명 사용자도 읽기 허용
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- mass_schedules: 기존 정책 삭제 후 새로 생성
DROP POLICY IF EXISTS "Anyone can view active schedules" ON mass_schedules;

CREATE POLICY "Anyone can view active schedules"
  ON mass_schedules FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- announcements: 기존 정책 삭제 후 새로 생성
DROP POLICY IF EXISTS "Anyone can view published announcements" ON announcements;

CREATE POLICY "Anyone can view published announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (
    published_at IS NOT NULL AND 
    published_at <= NOW() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- bulletins: 기존 정책 삭제 후 새로 생성
DROP POLICY IF EXISTS "Anyone can view published bulletins" ON bulletins;

CREATE POLICY "Anyone can view published bulletins"
  ON bulletins FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL);

-- events: 기존 정책 삭제 후 새로 생성
DROP POLICY IF EXISTS "Anyone can view events" ON events;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- 완료!
-- 이제 브라우저를 새로고침하면 데이터가 표시됩니다.
