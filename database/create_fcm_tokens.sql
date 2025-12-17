-- FCM 토큰 테이블 생성
CREATE TABLE IF NOT EXISTS fcm_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  device_info JSONB,
  is_subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 토큰을 관리할 수 있음
CREATE POLICY "Users can manage own tokens"
  ON fcm_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 정책: 관리자는 모든 토큰을 볼 수 있음 (알림 전송용)
CREATE POLICY "Admins can view all tokens"
  ON fcm_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- 서비스 역할(Service Role) 키를 사용하는 서버 사이드 함수(Vercel Function)가 접근할 수 있도록 정책 추가 필요할 수 있음.
-- 하지만 Service Role 키는 RLS를 우회하므로 별도 정책 불필요.
