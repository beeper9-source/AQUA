# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트 생성
2. 프로젝트 URL과 anon key 확인

## 2. 데이터베이스 스키마 설정

Supabase 대시보드의 **SQL Editor**에서 다음 SQL을 실행하세요:

```sql
-- 기본 테이블 생성
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    skill_level VARCHAR(20) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player1_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_players CHECK (player1_id != player2_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
    team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    winner VARCHAR(10) CHECK (winner IN ('teamA', 'teamB')) NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_teams CHECK (team_a_id != team_b_id)
);

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
CREATE INDEX IF NOT EXISTS idx_sets_match_id ON sets(match_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Enable all access for all users" ON players FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON courts FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON teams FOR ALL USING (true);
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

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. 설정 파일 업데이트

`supabase-config.js` 파일에서 실제 Supabase 프로젝트 정보로 업데이트:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_PROJECT_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

## 4. 연결 테스트

앱을 실행하고 브라우저 콘솔에서 연결 상태를 확인하세요:

```bash
npm run dev
```

## 5. 문제 해결

### 연결 오류가 발생하는 경우:

1. **프로젝트 URL과 키 확인**: Supabase 대시보드에서 올바른 정보인지 확인
2. **프로젝트 상태 확인**: 프로젝트가 일시정지되지 않았는지 확인
3. **스키마 확인**: 위의 SQL이 모두 실행되었는지 확인
4. **RLS 정책 확인**: 테이블에 대한 접근 권한이 올바르게 설정되었는지 확인

### 임시 해결책:

Supabase 연결에 문제가 있다면 `src/App.tsx`에서 import를 변경하여 로컬스토리지 버전을 사용할 수 있습니다:

```typescript
// 로컬스토리지 버전 사용
import { useTennisStoreFallback as useTennisStore } from './store/tennisStore-fallback';
```

## 6. 데이터 마이그레이션

기존 로컬스토리지 데이터가 있다면:

1. 브라우저 개발자 도구 → Application → Local Storage에서 데이터 확인
2. Supabase 대시보드에서 직접 데이터 입력
3. 또는 앱에서 데이터를 다시 입력

## 7. 백업 및 복원

Supabase는 자동으로 데이터를 백업하지만, 추가 백업이 필요한 경우:

1. **데이터 내보내기**: Supabase 대시보드 → Database → Backups
2. **SQL 덤프**: pg_dump를 사용하여 전체 데이터베이스 백업
3. **앱 내 백업**: 설정 페이지에서 JSON 형태로 데이터 다운로드
