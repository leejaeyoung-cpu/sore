-- ========================================
-- 성당 관리 시스템 데이터베이스 스키마
-- ========================================
-- 
-- 실행 방법:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor 메뉴 클릭
-- 3. 이 파일의 내용을 복사하여 실행
--

-- ========================================
-- 1. 사용자 프로필 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'believer' CHECK (role IN ('admin', 'staff', 'believer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 자신의 프로필을 볼 수 있음
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 정책: 모든 사용자는 자신의 프로필을 수정할 수 있음
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 정책: 관리자는 모든 프로필을 볼 수 있음
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 2. 신자 정보 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS parishioners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  baptism_name TEXT,
  birth_date DATE,
  baptism_date DATE,
  confirmation_date DATE,
  address TEXT,
  family_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  notes TEXT,
  registered_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE parishioners ENABLE ROW LEVEL SECURITY;

-- 정책: 신자는 자신의 정보를 볼 수 있음
CREATE POLICY "Parishioners can view own info"
  ON parishioners FOR SELECT
  USING (user_id = auth.uid());

-- 정책: 관리자는 모든 신자 정보를 볼 수 있음
CREATE POLICY "Staff can view all parishioners"
  ON parishioners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 3. 주보 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS bulletins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  week_of DATE NOT NULL,
  content TEXT,
  pdf_url TEXT,
  cover_image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX bulletins_week_of_idx ON bulletins(week_of DESC);
CREATE INDEX bulletins_published_at_idx ON bulletins(published_at DESC);

ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 게시된 주보를 볼 수 있음
CREATE POLICY "Anyone can view published bulletins"
  ON bulletins FOR SELECT
  USING (published_at IS NOT NULL);

-- 정책: 관리자만 주보를 작성/수정/삭제할 수 있음
CREATE POLICY "Staff can manage bulletins"
  ON bulletins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 4. 공지사항 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'event', 'liturgy')),
  priority INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX announcements_published_at_idx ON announcements(published_at DESC);
CREATE INDEX announcements_priority_idx ON announcements(priority DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 게시된 공지를 볼 수 있음
CREATE POLICY "Anyone can view published announcements"
  ON announcements FOR SELECT
  USING (
    published_at IS NOT NULL AND 
    published_at <= NOW() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- 정책: 관리자만 공지를 관리할 수 있음
CREATE POLICY "Staff can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 5. 미사 시간표 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS mass_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=일요일, 6=토요일
  time TIME NOT NULL,
  type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'special', 'weekday')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX mass_schedules_day_time_idx ON mass_schedules(day_of_week, time);

ALTER TABLE mass_schedules ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 활성 미사 시간표를 볼 수 있음
CREATE POLICY "Anyone can view active schedules"
  ON mass_schedules FOR SELECT
  USING (is_active = TRUE);

-- 정책: 관리자만 미사 시간표를 관리할 수 있음
CREATE POLICY "Staff can manage schedules"
  ON mass_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 6. 행사 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_participants INTEGER,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  category TEXT DEFAULT 'general' CHECK (category IN ('retreat', 'volunteer', 'feast', 'education', 'general')),
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX events_start_date_idx ON events(start_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 행사를 볼 수 있음
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (TRUE);

-- 정책: 관리자만 행사를 관리할 수 있음
CREATE POLICY "Staff can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 7. 행사 참가 등록 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  notes TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(event_id, user_id)
);

CREATE INDEX event_registrations_event_idx ON event_registrations(event_id);
CREATE INDEX event_registrations_user_idx ON event_registrations(user_id);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 등록 정보를 볼 수 있음
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (user_id = auth.uid());

-- 정책: 사용자는 자신의 등록을 추가/수정할 수 있음
CREATE POLICY "Users can manage own registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own registrations"
  ON event_registrations FOR UPDATE
  USING (user_id = auth.uid());

-- 정책: 관리자는 모든 등록을 볼 수 있음
CREATE POLICY "Staff can view all registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 8. 헌금 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parishioner_id UUID REFERENCES parishioners(id),
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'special', 'building_fund', 'mission')),
  payment_method TEXT CHECK (payment_method IN ('card', 'bank_transfer', 'cash', 'mobile')),
  transaction_id TEXT,
  donated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  receipt_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX donations_parishioner_idx ON donations(parishioner_id);
CREATE INDEX donations_donated_at_idx ON donations(donated_at DESC);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 헌금 내역을 볼 수 있음
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  USING (
    parishioner_id IN (
      SELECT id FROM parishioners WHERE user_id = auth.uid()
    )
  );

-- 정책: 관리자는 모든 헌금 내역을 볼 수 있음
CREATE POLICY "Staff can view all donations"
  ON donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 9. 자동 updated_at 업데이트 함수
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 트리거 추가
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parishioners_updated_at BEFORE UPDATE ON parishioners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulletins_updated_at BEFORE UPDATE ON bulletins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. 초기 데이터 (샘플)
-- ========================================

-- 샘플 미사 시간표
INSERT INTO mass_schedules (day_of_week, time, type, description) VALUES
  (0, '09:00', 'regular', '주일 미사'),
  (0, '11:00', 'regular', '주일 미사'),
  (6, '19:00', 'regular', '토요일 저녁 미사'),
  (1, '06:30', 'weekday', '평일 미사'),
  (2, '06:30', 'weekday', '평일 미사'),
  (3, '06:30', 'weekday', '평일 미사'),
  (4, '06:30', 'weekday', '평일 미사'),
  (5, '06:30', 'weekday', '평일 미사')
ON CONFLICT DO NOTHING;

-- ========================================
-- 완료!
-- ========================================
-- 
-- 다음 단계:
-- 1. 이 SQL 스크립트를 Supabase SQL Editor에서 실행
-- 2. 테이블 생성 확인
-- 3. RLS 정책 확인
-- 4. 샘플 데이터 확인
--
