# 테니스 경기 결과 추적기 🎾

일자별, 코트별 복식 테니스 경기 결과를 입력하고 관리할 수 있는 웹 애플리케이션입니다.

## 주요 기능

### 🏆 경기 관리
- **경기 결과 입력**: 날짜, 코트, 팀, 세트 스코어 등을 입력
- **일정 관리**: 달력 형태로 경기 일정 확인 및 관리
- **결과 조회**: 필터링을 통한 다양한 조건으로 경기 결과 검색

### 👥 선수 및 팀 관리
- **선수 등록**: 이름, 연락처, 연주 수준 등 선수 정보 관리
- **팀 생성**: 선수들을 조합하여 복식 팀 생성
- **수준별 관리**: 초급, 중급, 고급 수준별 선수 분류

### 📊 통계 및 분석
- **경기 통계**: 총 경기 수, 승률, 평균 경기 시간 등
- **선수 랭킹**: 승률 기반 선수 순위
- **코트별 사용률**: 각 코트별 경기 현황 분석

### 📤 데이터 공유
- **결과 공유**: 웹 공유, 클립보드 복사, 이메일 공유
- **데이터 내보내기**: CSV 형태로 경기 결과 다운로드
- **데이터 백업**: JSON 형태로 전체 데이터 백업

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **상태 관리**: Zustand
- **데이터베이스**: Supabase (PostgreSQL)
- **스타일링**: Tailwind CSS
- **폼 관리**: React Hook Form + Zod
- **빌드 도구**: Vite
- **아이콘**: Lucide React

## 설치 및 실행

### 1. Supabase 프로젝트 설정

1. **Supabase 프로젝트 생성**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - 프로젝트 URL과 anon key 확인

2. **데이터베이스 스키마 설정**
   - Supabase 대시보드의 SQL Editor에서 `src/lib/supabase-sql.sql` 파일 내용 실행
   - 테이블과 기본 데이터가 생성됩니다

3. **설정 파일 업데이트**
   - `supabase-config.js` 파일에서 실제 Supabase 프로젝트 정보로 업데이트:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_PROJECT_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

## 사용법

### 1. 선수 등록
- "선수 관리" 메뉴에서 새 선수 등록
- 이름, 연락처, 연주 수준 입력

### 2. 팀 생성
- "팀 관리" 메뉴에서 새 팀 생성
- 두 명의 선수를 선택하여 복식 팀 구성
- 팀 이름 설정 (선택사항)

### 3. 경기 결과 입력
- "경기 결과" 메뉴에서 새 경기 등록
- 날짜, 시간, 코트, 팀 선택
- 세트별 스코어 입력
- 승자 선택 및 경기 시간 기록

### 4. 결과 확인
- **대시보드**: 전체 통계 및 최근 경기 현황
- **일정**: 달력으로 경기 일정 확인
- **통계**: 상세한 경기 및 선수 통계 분석

### 5. 데이터 공유
- "공유" 메뉴에서 다양한 방법으로 결과 공유
- CSV 다운로드로 데이터 내보내기
- 백업 파일로 전체 데이터 보존

## 데이터베이스 구조

### 테이블 관계
```
players (선수)
  ↓
teams (팀) - player1_id, player2_id
  ↓
matches (경기) - team_a_id, team_b_id, court_id
  ↓
sets (세트) - match_id

courts (코트) - 독립적
```

### 주요 테이블
- **players**: 선수 정보 (이름, 연락처, 실력 등급)
- **teams**: 복식 팀 (2명의 선수로 구성)
- **courts**: 테니스 코트 정보 (이름, 표면, 실내/외)
- **matches**: 경기 정보 (날짜, 팀, 승자, 상태)
- **sets**: 세트별 스코어 정보

## 데이터 구조

### 선수 (Player)
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}
```

### 팀 (Team)
```typescript
{
  id: string;
  player1: Player;
  player2: Player;
  teamName?: string;
  createdAt: Date;
}
```

### 경기 (Match)
```typescript
{
  id: string;
  date: Date;
  courtId: string;
  courtName: string;
  teamA: Team;
  teamB: Team;
  sets: Set[];
  winner: 'teamA' | 'teamB';
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 주요 컴포넌트

- **Dashboard**: 전체 통계 및 현황 대시보드
- **MatchForm**: 경기 결과 입력/수정 폼
- **PlayerManagement**: 선수 관리 페이지
- **TeamManagement**: 팀 관리 페이지
- **MatchCalendar**: 달력 형태의 경기 일정
- **Statistics**: 상세 통계 분석
- **SharePage**: 데이터 공유 기능

## 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트에 대한 문의나 버그 리포트는 GitHub Issues를 통해 제출해 주세요.


