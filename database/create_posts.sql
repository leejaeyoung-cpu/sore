-- ========================================
-- 게시글 테이블
-- ========================================
-- 자유게시판 및 단체별 게시판 게시글

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 소속 (NULL이면 전체 게시판)
  group_id UUID REFERENCES groups ON DELETE SET NULL,
  
  -- 작성자
  author_id UUID REFERENCES auth.users ON DELETE SET NULL NOT NULL,
  
  -- 내용
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- 미디어
  image_url TEXT,
  video_url TEXT,  -- 동영상 URL (YouTube 또는 업로드된 파일)
  
  -- 메타데이터
  view_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  
  -- 타임스탬프
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- 제약 조건
  CONSTRAINT valid_title CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS posts_group_id_idx ON posts(group_id);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_pinned_published_idx ON posts(is_pinned DESC, published_at DESC) WHERE published_at IS NOT NULL;

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책 1: 전체 게시판 (group_id가 NULL)은 모두 볼 수 있음
CREATE POLICY "Anyone can view public posts"
  ON posts FOR SELECT
  USING (
    group_id IS NULL AND 
    published_at IS NOT NULL
  );

-- 정책 2: 그룹 게시글은 해당 그룹 멤버만 볼 수 있음
CREATE POLICY "Group members can view group posts"
  ON posts FOR SELECT
  USING (
    group_id IS NOT NULL AND
    published_at IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = posts.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- 정책 3: 관리자는 모든 게시글 조회 가능
CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- 정책 4: 인증된 사용자는 전체 게시판에 글 작성 가능
CREATE POLICY "Authenticated users can create public posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    group_id IS NULL AND
    author_id = auth.uid()
  );

-- 정책 5: 그룹 멤버는 해당 그룹 게시판에 글 작성 가능
CREATE POLICY "Group members can create group posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    group_id IS NOT NULL AND
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = posts.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- 정책 6: 작성자는 자신의 게시글 수정 가능
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- 정책 7: 작성자는 자신의 게시글 삭제 가능
CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  USING (author_id = auth.uid());

-- 정책 8: 관리자는 모든 게시글 관리 가능
CREATE POLICY "Admins can manage all posts"
  ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Trigger: updated_at 자동 업데이트
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 완료!
-- ========================================
