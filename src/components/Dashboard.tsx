import React from 'react';
import { Trophy, Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { formatDuration } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const { getMatchStats, players, getActiveCourts } = useTennisStore();
  const stats = getMatchStats();
  const activeCourts = getActiveCourts();

  const statCards = [
    {
      title: '총 경기 수',
      value: stats.totalMatches,
      icon: Trophy,
      color: 'bg-ocean-gradient',
      change: stats.completedMatches
    },
    {
      title: '등록된 선수',
      value: players.length,
      icon: Users,
      color: 'bg-coral-gradient',
      change: players.filter(p => p.skillLevel === 'advanced').length
    },
    {
      title: '평균 경기 시간',
      value: formatDuration(Math.round(stats.averageDuration)),
      icon: Clock,
      color: 'bg-pearl-gradient',
      change: stats.completedMatches
    },
    {
      title: '활성 코트',
      value: activeCourts.length,
      icon: TrendingUp,
      color: 'bg-wave-gradient',
      change: activeCourts.filter(c => c.isActive).length
    }
  ];

  return (
    <div className="space-y-6 bg-gradient-to-br from-ocean-50 to-wave-50 min-h-screen p-6">
      <div className="relative">
        <h1 className="text-3xl font-bold text-ocean-900 animate-wave">🌊 Aqua Tennis 대시보드</h1>
        <p className="text-ocean-600 mt-2">수족관에서 펼쳐지는 테니스 경기를 확인하세요 🐠</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6 hover:shadow-xl transition-all duration-300 animate-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ocean-600">{card.title}</p>
                <p className="text-2xl font-bold text-ocean-900 mt-1">{card.value}</p>
                <p className="text-xs text-ocean-500 mt-1">
                  {index === 0 && '🏆 완료된 경기'}
                  {index === 1 && '⭐ 고급 선수'}
                  {index === 2 && '⏱️ 완료된 경기'}
                  {index === 3 && '🏟️ 활성 코트'}
                  : {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center shadow-md`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 활동 */}
      <div className="grid lg:grid-cols-1 gap-6">
        {/* 최근 경기 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6 animate-float">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ocean-900">🐠 최근 경기</h3>
            <TrendingUp className="w-5 h-5 text-ocean-400 animate-wave" />
          </div>
          <RecentMatches />
        </div>
      </div>

      {/* 선수 랭킹 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6 animate-float">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ocean-900">🏆 선수 랭킹</h3>
          <Trophy className="w-5 h-5 text-ocean-400 animate-wave" />
        </div>
        <PlayerRanking />
      </div>

      {/* 코트별 사용 현황 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6 animate-float">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ocean-900">🏟️ 코트별 사용 현황</h3>
          <TrendingUp className="w-5 h-5 text-ocean-400 animate-wave" />
        </div>
        <CourtUsage />
      </div>
    </div>
  );
};

const RecentMatches: React.FC = () => {
  const { getFilteredMatches } = useTennisStore();
  const matches = getFilteredMatches()
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto w-12 h-12 text-ocean-300 mb-3 animate-wave" />
        <p className="text-ocean-500">🐠 최근 경기가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <div key={match.id} className="flex items-center justify-between p-3 bg-ocean-50 rounded-lg hover:bg-ocean-100 transition-colors">
          <div>
            <p className="text-sm font-medium text-ocean-900">
              🐠 {match.playerA1.name} & {match.playerA2.name} vs {match.playerB1.name} & {match.playerB2.name}
            </p>
            <p className="text-xs text-ocean-500">{match.date.toLocaleDateString('ko-KR')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-ocean-600">
              {match.result === 'teamA' ? 
                `🏆 ${match.playerA1.name}팀 승` : 
                match.result === 'teamB' ?
                `🏆 ${match.playerB1.name}팀 승` :
                '🤝 무승부'
              }
            </p>
            <p className="text-xs text-ocean-500">⏱️ {formatDuration(match.duration)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};


const PlayerRanking: React.FC = () => {
  const { players, getMatchStats } = useTennisStore();
  const stats = getMatchStats();

  const playerStats = players.map(player => ({
    ...player,
    winRate: stats.winRate[player.id] || 0
  })).sort((a, b) => b.winRate - a.winRate);

  return (
    <div className="space-y-3">
      {playerStats.slice(0, 5).map((player, index) => (
        <div key={player.id} className="flex items-center justify-between p-3 bg-ocean-50 rounded-lg hover:bg-ocean-100 transition-colors">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-ocean-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-ocean-900">{player.name}</p>
              <p className="text-xs text-ocean-500">{player.skillLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-ocean-900">
              🏆 {player.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-ocean-500">승률</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const CourtUsage: React.FC = () => {
  const { courts, matches } = useTennisStore();
  
  const courtStats = courts.map(court => {
    const courtMatches = matches.filter(match => match.courtId === court.id);
    return {
      ...court,
      matchCount: courtMatches.length,
      totalDuration: courtMatches.reduce((sum, match) => sum + match.duration, 0)
    };
  }).sort((a, b) => b.matchCount - a.matchCount);

  if (courtStats.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="mx-auto w-12 h-12 text-ocean-300 mb-3 animate-wave" />
        <p className="text-ocean-500">🏟️ 코트 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courtStats.map((court) => (
        <div key={court.id} className="flex items-center justify-between p-3 bg-ocean-50 rounded-lg hover:bg-ocean-100 transition-colors">
          <div>
            <p className="text-sm font-medium text-ocean-900">
              🏟️ {court.name}
            </p>
            <p className="text-xs text-ocean-500">{court.location} • {court.surface}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-ocean-600">
              {court.matchCount}경기
            </p>
            <p className="text-xs text-ocean-500">{formatDuration(court.totalDuration)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
