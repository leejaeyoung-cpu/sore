-- posts 테이블의 관계 설정 수정

-- 1. author_id가 profiles 테이블을 참조하도록 설정
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

ALTER TABLE posts
ADD CONSTRAINT posts_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES profiles(id)
ON DELETE SET NULL;

-- 2. group_id가 groups 테이블을 참조하도록 설정
-- (groups 테이블이 존재한다고 가정)
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_group_id_fkey;

ALTER TABLE posts
ADD CONSTRAINT posts_group_id_fkey
FOREIGN KEY (group_id)
REFERENCES groups(id)
ON DELETE SET NULL;

-- 3. Supabase가 관계를 인식하도록 주석 추가 (선택 사항이지만 도움됨)
COMMENT ON CONSTRAINT posts_author_id_fkey ON posts IS 'Links posts to their authors in profiles table';
COMMENT ON CONSTRAINT posts_group_id_fkey ON posts IS 'Links posts to their groups';
