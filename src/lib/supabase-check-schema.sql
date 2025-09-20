-- 현재 데이터베이스 스키마 상태 확인

-- 1. matches 테이블의 컬럼 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;

-- 2. sets 테이블의 컬럼 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'sets' 
ORDER BY ordinal_position;

-- 3. courts 테이블 존재 여부 확인
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'courts'
) as courts_table_exists;

-- 4. matches 테이블의 제약조건 확인
SELECT constraint_name, constraint_type, check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'matches' 
    AND tc.constraint_type = 'CHECK';

-- 5. sets 테이블의 제약조건 확인
SELECT constraint_name, constraint_type, check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'sets' 
    AND tc.constraint_type = 'CHECK';
