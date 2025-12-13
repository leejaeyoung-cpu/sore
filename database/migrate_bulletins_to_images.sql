-- ========================================
-- 주보 테이블 업데이트 - PDF → 여러 이미지
-- ========================================
-- Supabase SQL Editor에서 실행하세요
--

-- 1. pdf_url 컬럼을 images로 변경 (JSONB 배열)
ALTER TABLE bulletins 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- 2. 기존 pdf_url 데이터가 있다면 images로 이동
UPDATE bulletins 
SET images = jsonb_build_array(
    jsonb_build_object('url', pdf_url, 'order', 0)
)
WHERE pdf_url IS NOT NULL AND pdf_url != '';

-- 3. pdf_url 컬럼은 일단 유지 (호환성)
-- 나중에 완전히 이동 후 삭제: ALTER TABLE bulletins DROP COLUMN pdf_url;

-- 완료!
