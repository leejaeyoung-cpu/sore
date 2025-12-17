-- app_settings 테이블 생성
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽을 수 있음
CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  USING (true);

-- 관리자만 수정 가능
CREATE POLICY "Admins can update app settings"
  ON app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- 초기값 설정 (동영상 URL)
INSERT INTO app_settings (key, value)
VALUES ('home_video_url', 'https://youtu.be/F0sfWC0fi8o')
ON CONFLICT (key) DO NOTHING;
