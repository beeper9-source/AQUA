-- 일정과 경기 결과 분리를 위한 업데이트된 Supabase 스키마

-- 기존 테이블 삭제 (순서 중요: 외래키 참조 때문에)
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- 선수 테이블 (기존 유지)
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 코트 테이블 (기존 유지)
CREATE TABLE IF NOT EXISTS courts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    surface VARCHAR(20) CHECK (surface IN ('hard', 'clay', 'grass', 'synthetic')) NOT NULL DEFAULT 'hard',
    is_indoor BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 경기 테이블 (개별 선수 기반으로 수정)
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
    
    -- 개별 선수 참조 (팀 테이블 제거)
    player_a1_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_a2_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_b1_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_b2_id UUID REFERENCES players(id) ON DELETE CASCADE,
    
    winner VARCHAR(10) CHECK (winner IN ('teamA', 'teamB')) NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건: 같은 선수가 중복 참여할 수 없음
    CONSTRAINT different_players_a CHECK (player_a1_id != player_a2_id),
    CONSTRAINT different_players_b CHECK (player_b1_id != player_b2_id),
    CONSTRAINT no_cross_team_duplicates CHECK (
        player_a1_id NOT IN (player_b1_id, player_b2_id) AND
        player_a2_id NOT IN (player_b1_id, player_b2_id)
    )
);

-- 세트 테이블 (기존 유지하되 matches 테이블 참조 수정)
CREATE TABLE IF NOT EXISTS sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    team_a_score INTEGER NOT NULL DEFAULT 0,
    team_b_score INTEGER NOT NULL DEFAULT 0,
    winner VARCHAR(10) CHECK (winner IN ('teamA', 'teamB')) NOT NULL,
    duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_players_skill_level ON players(skill_level);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_court_id ON matches(court_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_players ON matches(player_a1_id, player_a2_id, player_b1_id, player_b2_id);
CREATE INDEX IF NOT EXISTS idx_sets_match_id ON sets(match_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Enable all access for all users" ON players FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON courts FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON matches FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON sets FOR ALL USING (true);

-- 기본 코트 데이터 삽입
INSERT INTO courts (name, surface, is_indoor, is_active) VALUES
('코트 1', 'hard', false, true),
('코트 2', 'hard', false, true),
('코트 3', 'clay', true, true)
ON CONFLICT DO NOTHING;

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기존 데이터 마이그레이션을 위한 함수 (선택사항)
-- 기존 teams 테이블에서 matches 테이블로 데이터를 마이그레이션하려는 경우 사용
CREATE OR REPLACE FUNCTION migrate_teams_to_individual_players()
RETURNS void AS $$
BEGIN
    -- 이 함수는 기존 teams 기반 데이터를 개별 선수 기반으로 마이그레이션합니다
    -- 실제 마이그레이션이 필요한 경우에만 실행하세요
    
    RAISE NOTICE 'Teams 테이블이 제거되었습니다. 새로운 경기는 개별 선수로만 구성됩니다.';
END;
$$ LANGUAGE plpgsql;

-- 마이그레이션 함수 실행 (선택사항)
-- SELECT migrate_teams_to_individual_players();
