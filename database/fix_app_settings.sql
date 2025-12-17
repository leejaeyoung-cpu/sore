-- 기존 테이블이 있다면 삭제 (타입 불일치 해결을 위해)
DROP TABLE IF EXISTS app_settings;

-- app_settings 테이블 다시 생성
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT, -- JSON이 아닌 일반 텍스트로 저장
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

-- 초기값 설정
INSERT INTO app_settings (key, value)
VALUES ('home_video_url', 'https://youtu.be/F0sfWC0fi8o');
