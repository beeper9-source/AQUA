-- 스키마 업데이트: schedules 테이블을 새로운 구조로 변경

-- 기존 schedules 테이블 삭제 (데이터도 함께 삭제됨)
DROP TABLE IF EXISTS schedules CASCADE;

-- 새로운 schedules 테이블 생성 (멀티선택 선수 지원)
CREATE TABLE schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    player_ids UUID[] NOT NULL, -- 선수 ID 배열
    
    status VARCHAR(20) CHECK (status IN ('scheduled', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건: 최소 2명 이상의 선수 필요
    CONSTRAINT min_players CHECK (array_length(player_ids, 1) >= 2),
    
    -- 외래키 제약조건 (배열의 각 요소가 players 테이블의 id를 참조)
    CONSTRAINT valid_player_ids CHECK (
        NOT EXISTS (
            SELECT 1 FROM unnest(player_ids) AS pid 
            WHERE pid NOT IN (SELECT id FROM players)
        )
    )
);

-- 인덱스 생성
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_player_ids ON schedules USING GIN(player_ids);

-- RLS 정책 설정
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on schedules" ON schedules FOR ALL USING (true);

-- 업데이트 트리거 적용
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
SELECT 'Schedules 테이블이 성공적으로 업데이트되었습니다!' as message;
