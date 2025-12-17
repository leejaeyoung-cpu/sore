-- ========================================
-- 단체 회원 테이블
-- ========================================
-- 사용자와 단체의 매핑 관계 관리

CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 관계
  group_id UUID REFERENCES groups ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  
  -- 역할
  role TEXT DEFAULT 'member' NOT NULL,
  
  -- 타임스탬프
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- 제약 조건
  CONSTRAINT unique_group_user UNIQUE(group_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('leader', 'member'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS group_members_group_id_idx ON group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON group_members(user_id);
CREATE INDEX IF NOT EXISTS group_members_role_idx ON group_members(role);

-- RLS 활성화
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 소속 단체 조회 가능
CREATE POLICY "Users can view own memberships"
  ON group_members FOR SELECT
  USING (user_id = auth.uid());

-- 정책: 모든 인증된 사용자는 다른 사람의 소속도 조회 가능 (단체 멤버 목록)
CREATE POLICY "Authenticated users can view memberships"
  ON group_members FOR SELECT
  USING (auth.role() = 'authenticated');

-- 정책: 관리자만 멤버십 관리 가능
CREATE POLICY "Admins can manage memberships"
  ON group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- ========================================
-- 완료!
-- ========================================
