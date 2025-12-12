-- ========================================
-- 관리자 기능을 위한 RLS 정책 업데이트
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- announcements: 모든 사용자가 쓰기 가능하도록 임시 설정
-- (나중에 인증 시스템 추가 후 관리자만 가능하도록 변경)
CREATE POLICY "Anyone can insert announcements"
  ON announcements FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update announcements"
  ON announcements FOR UPDATE
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Anyone can delete announcements"
  ON announcements FOR DELETE
  TO anon, authenticated
  USING (TRUE);

-- bulletins: 쓰기 권한 추가
CREATE POLICY "Anyone can insert bulletins"
  ON bulletins FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update bulletins"
  ON bulletins FOR UPDATE
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Anyone can delete bulletins"
  ON bulletins FOR DELETE
  TO anon, authenticated
  USING (TRUE);

-- mass_schedules: 쓰기 권한 추가
CREATE POLICY "Anyone can insert mass_schedules"
  ON mass_schedules FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update mass_schedules"
  ON mass_schedules FOR UPDATE
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Anyone can delete mass_schedules"
  ON mass_schedules FOR DELETE
  TO anon, authenticated
  USING (TRUE);

-- 완료!
-- 참고: 이 정책은 개발용입니다. 
-- 프로덕션에서는 인증 시스템을 추가하고 관리자만 쓰기 가능하도록 변경해야 합니다.
