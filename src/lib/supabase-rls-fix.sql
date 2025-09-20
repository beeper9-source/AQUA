-- Supabase RLS (Row Level Security) 정책 수정

-- 1. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Allow all operations on players" ON players;
DROP POLICY IF EXISTS "Allow all operations on courts" ON courts;
DROP POLICY IF EXISTS "Allow all operations on schedules" ON schedules;
DROP POLICY IF EXISTS "Allow all operations on matches" ON matches;
DROP POLICY IF EXISTS "Allow all operations on sets" ON sets;

-- 2. 모든 테이블의 RLS 활성화
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 RLS 정책 생성 (모든 사용자가 모든 작업 가능)
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on courts" ON courts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sets" ON sets FOR ALL USING (true) WITH CHECK (true);

-- 4. 완료 메시지
SELECT 'RLS 정책이 성공적으로 업데이트되었습니다!' as message;
