-- ========================================
-- 단체(그룹) 테이블
-- ========================================
-- 성당 내 각종 단체 관리 (레지오, 성가대, 청년회 등)

CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 기본 정보
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- 제약 조건
  CONSTRAINT unique_display_order UNIQUE(display_order),
  CONSTRAINT valid_display_order CHECK (display_order BETWEEN 1 AND 100)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS groups_active_order_idx ON groups(is_active, display_order) WHERE is_active = true;

-- RLS 활성화
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 활성화된 그룹 조회 가능
CREATE POLICY "Anyone can view active groups"
  ON groups FOR SELECT
  USING (is_active = true);

-- 정책: 관리자만 그룹 관리 가능
CREATE POLICY "Admins can manage groups"
  ON groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Trigger: updated_at 자동 업데이트
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 초기 데이터: 단체 1~10 생성
-- ========================================

INSERT INTO groups (name, description, display_order) VALUES
  ('단체1', '단체1 설명 (나중에 수정)', 1),
  ('단체2', '단체2 설명 (나중에 수정)', 2),
  ('단체3', '단체3 설명 (나중에 수정)', 3),
  ('단체4', '단체4 설명 (나중에 수정)', 4),
  ('단체5', '단체5 설명 (나중에 수정)', 5),
  ('단체6', '단체6 설명 (나중에 수정)', 6),
  ('단체7', '단체7 설명 (나중에 수정)', 7),
  ('단체8', '단체8 설명 (나중에 수정)', 8),
  ('단체9', '단체9 설명 (나중에 수정)', 9),
  ('단체10', '단체10 설명 (나중에 수정)', 10)
ON CONFLICT (display_order) DO NOTHING;

-- ========================================
-- 완료!
-- ========================================
