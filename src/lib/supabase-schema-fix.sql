-- Supabase 스키마 수정: matches와 sets 테이블의 winner 컬럼을 result로 변경

-- 1. matches 테이블의 winner 컬럼을 result로 변경
ALTER TABLE matches RENAME COLUMN winner TO result;

-- 2. matches 테이블의 result 컬럼 제약조건 업데이트 (무승부 추가)
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_result_check;
ALTER TABLE matches ADD CONSTRAINT matches_result_check 
    CHECK (result IN ('teamA', 'teamB', 'draw'));

-- 3. sets 테이블의 winner 컬럼을 result로 변경
ALTER TABLE sets RENAME COLUMN winner TO result;

-- 4. sets 테이블의 result 컬럼 제약조건 업데이트 (무승부 추가)
ALTER TABLE sets DROP CONSTRAINT IF EXISTS sets_result_check;
ALTER TABLE sets ADD CONSTRAINT sets_result_check 
    CHECK (result IN ('teamA', 'teamB', 'draw'));

-- 5. 완료 메시지
SELECT 'matches와 sets 테이블의 컬럼명이 성공적으로 업데이트되었습니다!' as message;
