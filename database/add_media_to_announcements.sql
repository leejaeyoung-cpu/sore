-- ========================================
-- 공지사항에 이미지/동영상 추가
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- announcements 테이블에 image_url 컬럼 추가
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- announcements 테이블에 video_url 컬럼 추가
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 완료!
