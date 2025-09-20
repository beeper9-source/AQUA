-- 최종 Supabase 스키마 수정: result 컬럼 사용 및 courts 테이블 복원

-- 1. matches 테이블에 result 컬럼이 없다면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'result') THEN
        ALTER TABLE matches ADD COLUMN result VARCHAR(10) CHECK (result IN ('teamA', 'teamB', 'draw'));
    END IF;
END $$;

-- 2. sets 테이블에 result 컬럼이 없다면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sets' AND column_name = 'result') THEN
        ALTER TABLE sets ADD COLUMN result VARCHAR(10) CHECK (result IN ('teamA', 'teamB', 'draw'));
    END IF;
END $$;

-- 3. 기존 winner 컬럼이 있다면 result로 데이터 복사 후 삭제
DO $$ 
BEGIN
    -- matches 테이블
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'matches' AND column_name = 'winner') THEN
        
        -- winner 데이터를 result로 복사
        UPDATE matches SET result = winner WHERE result IS NULL;
        
        -- winner 컬럼 삭제
        ALTER TABLE matches DROP COLUMN winner;
    END IF;
    
    -- sets 테이블
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sets' AND column_name = 'winner') THEN
        
        -- winner 데이터를 result로 복사
        UPDATE sets SET result = winner WHERE result IS NULL;
        
        -- winner 컬럼 삭제
        ALTER TABLE sets DROP COLUMN winner;
    END IF;
END $$;

-- 4. courts 테이블 생성 (없다면)
CREATE TABLE IF NOT EXISTS courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    surface VARCHAR(20) NOT NULL CHECK (surface IN ('hard', 'clay', 'grass', 'synthetic')),
    is_indoor BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. matches 테이블에 코트 관련 컬럼 추가 (없다면)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'court_id') THEN
        ALTER TABLE matches ADD COLUMN court_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'court_name') THEN
        ALTER TABLE matches ADD COLUMN court_name VARCHAR(100);
    END IF;
END $$;

-- 6. 외래키 제약조건 추가 (없다면)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'matches_court_id_fkey') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_court_id_fkey 
        FOREIGN KEY (court_id) REFERENCES courts(id);
    END IF;
END $$;

-- 7. 기본 코트 데이터 삽입
INSERT INTO courts (id, name, location, surface, is_indoor, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '기본 코트', '기본 위치', 'hard', false, true),
    ('00000000-0000-0000-0000-000000000002', '코트 1', '메인 구장', 'hard', false, true),
    ('00000000-0000-0000-0000-000000000003', '코트 2', '서브 구장', 'clay', false, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    surface = EXCLUDED.surface,
    is_indoor = EXCLUDED.is_indoor,
    is_active = EXCLUDED.is_active;

-- 8. 기존 matches 데이터에 기본 코트 정보 업데이트 (court_id가 NULL인 경우)
UPDATE matches 
SET 
    court_id = '00000000-0000-0000-0000-000000000001',
    court_name = '기본 코트'
WHERE court_id IS NULL OR court_name IS NULL;

-- 9. RLS 정책 설정
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Allow all operations on courts" ON courts;

-- 새로운 RLS 정책 생성
CREATE POLICY "Allow all operations on courts" ON courts FOR ALL USING (true) WITH CHECK (true);

-- 10. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_courts_is_active ON courts(is_active);
CREATE INDEX IF NOT EXISTS idx_courts_surface ON courts(surface);

-- 11. 완료 메시지
SELECT '스키마 수정 완료! result 컬럼 사용 및 courts 테이블 복원 완료' as message;
