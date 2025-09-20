-- 일정과 경기 결과 분리를 위한 최종 Supabase 스키마

-- 기존 테이블 삭제 (순서 중요: 외래키 참조 때문에)
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- 선수 테이블
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코트 테이블
CREATE TABLE IF NOT EXISTS courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    surface VARCHAR(20) CHECK (surface IN ('hard', 'clay', 'grass', 'synthetic')) DEFAULT 'hard',
    is_indoor BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- 일정 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    player_ids UUID[] NOT NULL, -- 선수 ID 배열
    
    status VARCHAR(20) CHECK (status IN ('scheduled', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건: 최소 2명 이상의 선수 필요
    CONSTRAINT min_players CHECK (array_length(player_ids, 1) >= 2)
);

-- 경기 결과 테이블 (일정과 연결)
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL, -- 일정과 연결
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
    
    -- 개별 선수 참조
    player_a1_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_a2_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_b1_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_b2_id UUID REFERENCES players(id) ON DELETE CASCADE,
    
    winner VARCHAR(10) CHECK (winner IN ('teamA', 'teamB')) NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('completed')) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건: 같은 선수가 중복 참여할 수 없음
    CONSTRAINT different_players_a CHECK (player_a1_id != player_a2_id),
    CONSTRAINT different_players_b CHECK (player_b1_id != player_b2_id),
    CONSTRAINT different_players_cross CHECK (
        player_a1_id != player_b1_id AND 
        player_a1_id != player_b2_id AND
        player_a2_id != player_b1_id AND 
        player_a2_id != player_b2_id
    )
);

-- 세트 테이블
CREATE TABLE IF NOT EXISTS sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    team_a_score INTEGER NOT NULL DEFAULT 0,
    team_b_score INTEGER NOT NULL DEFAULT 0,
    winner VARCHAR(10) CHECK (winner IN ('teamA', 'teamB')),
    duration INTEGER, -- 분 단위
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT valid_set_number CHECK (set_number >= 1 AND set_number <= 5),
    CONSTRAINT valid_scores CHECK (team_a_score >= 0 AND team_b_score >= 0),
    UNIQUE(match_id, set_number)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_player_ids ON schedules USING GIN(player_ids);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_court ON matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_schedule ON matches(schedule_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_a1 ON matches(player_a1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_a2 ON matches(player_a2_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_b1 ON matches(player_b1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_b2 ON matches(player_b2_id);

CREATE INDEX IF NOT EXISTS idx_sets_match ON sets(match_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 모든 데이터에 접근할 수 있도록 설정 (개발용)
-- 실제 운영에서는 적절한 인증 및 권한 관리가 필요합니다
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all operations on courts" ON courts FOR ALL USING (true);
CREATE POLICY "Allow all operations on schedules" ON schedules FOR ALL USING (true);
CREATE POLICY "Allow all operations on matches" ON matches FOR ALL USING (true);
CREATE POLICY "Allow all operations on sets" ON sets FOR ALL USING (true);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 데이터 삽입
INSERT INTO courts (name, surface, is_indoor, is_active) VALUES
    ('코트 1', 'hard', false, true),
    ('코트 2', 'hard', false, true),
    ('실내 코트 A', 'synthetic', true, true),
    ('실내 코트 B', 'synthetic', true, true)
ON CONFLICT DO NOTHING;

-- 완료 메시지
SELECT 'Supabase 스키마가 성공적으로 생성되었습니다!' as message;
