import React, { useState } from 'react';
import { Trophy, TrendingUp, BarChart3, PieChart, Users, Clock, Calendar, Filter, X } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { formatDuration } from '../utils/helpers';

export const Statistics: React.FC = () => {
  const { getMatchStats, players, courts, getFilteredMatches } = useTennisStore();
  const stats = getMatchStats();
  const allMatches = getFilteredMatches();
  
  // 기간 필터 상태
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // 기간 필터링된 경기 데이터
  const matches = React.useMemo(() => {
    let filteredMatches = allMatches;
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredMatches = filteredMatches.filter(match => match.date >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // 해당 날짜의 끝까지 포함
      filteredMatches = filteredMatches.filter(match => match.date <= toDate);
    }
    
    return filteredMatches;
  }, [allMatches, dateFrom, dateTo]);

  // 필터링된 통계 데이터
  const filteredStats = React.useMemo(() => {
    const completedMatches = matches.filter(m => m.status === 'completed');
    const totalDuration = completedMatches.reduce((sum, match) => sum + match.duration, 0);
    const averageDuration = completedMatches.length > 0 ? totalDuration / completedMatches.length : 0;
    
    return {
      ...stats,
      totalMatches: matches.length,
      completedMatches: completedMatches.length,
      averageDuration
    };
  }, [matches, stats]);

  // 필터 초기화
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  // 월별 경기 통계
  const monthlyStats = React.useMemo(() => {
    const monthlyData: Record<string, number> = {};
    matches.forEach(match => {
      const monthKey = `${match.date.getFullYear()}-${match.date.getMonth() + 1}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    return Object.entries(monthlyData).map(([month, count]) => ({
      month: month.replace('-', '년 ') + '월',
      count
    }));
  }, [matches]);

  // 코트별 사용률
  const courtUsage = React.useMemo(() => {
    return courts
      .sort((a, b) => {
        // 코트 이름에서 숫자 추출하여 정렬 (코트1, 코트2, ...)
        const aNum = parseInt(a.name.replace(/[^\d]/g, '')) || 0;
        const bNum = parseInt(b.name.replace(/[^\d]/g, '')) || 0;
        return aNum - bNum;
      })
      .map(court => {
        const courtMatches = matches.filter(match => match.courtId === court.id);
        const totalDuration = courtMatches.reduce((sum, match) => sum + match.duration, 0);
        return {
          name: court.name,
          matchCount: courtMatches.length,
          totalDuration,
          averageDuration: courtMatches.length > 0 ? totalDuration / courtMatches.length : 0
        };
      });
  }, [courts, matches]);

  // 선수별 통계
  const playerStats = React.useMemo(() => {
    return players.map(player => {
      const playerMatches = matches.filter(match => 
        match.playerA1.id === player.id ||
        match.playerA2.id === player.id ||
        match.playerB1.id === player.id ||
        match.playerB2.id === player.id
      );
      
      const wins = playerMatches.filter(match => {
        const isPlayerInTeamA = match.playerA1.id === player.id || match.playerA2.id === player.id;
        const isPlayerInTeamB = match.playerB1.id === player.id || match.playerB2.id === player.id;
        
        if (isPlayerInTeamA) {
          return match.result === 'teamA';
        } else if (isPlayerInTeamB) {
          return match.result === 'teamB';
        }
        return false;
      }).length;

      return {
        ...player,
        totalMatches: playerMatches.length,
        wins,
        winRate: playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0,
        totalDuration: playerMatches.reduce((sum, match) => sum + match.duration, 0)
      };
    }).sort((a, b) => {
      // 승률 기준으로 정렬 (승률이 같으면 경기 수로 정렬)
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      return b.totalMatches - a.totalMatches;
    });
  }, [players, matches]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">통계 분석</h1>
          <p className="text-gray-600 mt-2">경기 데이터를 분석하여 인사이트를 얻어보세요</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
        >
          <Filter className="w-4 h-4 mr-2" />
          기간 필터
        </button>
      </div>

      {/* 기간 필터 섹션 */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              기간 설정
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
          
          {(dateFrom || dateTo) && (
            <div className="mt-4 p-3 bg-ocean-50 rounded-lg">
              <p className="text-sm text-ocean-700">
                📅 필터 적용됨: 
                {dateFrom && ` ${dateFrom}부터`}
                {dateTo && ` ${dateTo}까지`}
                {' '}(총 {matches.length}경기)
              </p>
            </div>
          )}
        </div>
      )}

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 경기 수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredStats.totalMatches}</p>
              <p className="text-xs text-gray-500 mt-1">완료: {filteredStats.completedMatches}</p>
            </div>
            <div className="w-12 h-12 bg-tennis-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 경기 시간</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatDuration(Math.round(filteredStats.averageDuration))}
              </p>
              <p className="text-xs text-gray-500 mt-1">총 {formatDuration(matches.reduce((sum, match) => sum + match.duration, 0))}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">등록된 선수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{players.length}</p>
              <p className="text-xs text-gray-500 mt-1">활성 코트: {courts.filter(c => c.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-court-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 코트</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{courts.filter(c => c.isActive).length}</p>
              <p className="text-xs text-gray-500 mt-1">총 {courts.length}개</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 월별 경기 현황 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">월별 경기 현황</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          {monthlyStats.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">데이터가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyStats.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-tennis-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.count / Math.max(...monthlyStats.map(d => d.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{data.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 코트별 사용률 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">코트별 사용률</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {courtUsage.map((court, index) => (
              <div key={court.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{court.name}</p>
                  <p className="text-xs text-gray-500">
                    {court.matchCount}경기 • 평균 {formatDuration(Math.round(court.averageDuration))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{court.matchCount}</p>
                  <p className="text-xs text-gray-500">경기</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 선수 랭킹 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">선수 랭킹 (승률 기준)</h3>
          <Trophy className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">순위</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">선수명</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">수준</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">경기 수</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">승률</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">총 경기 시간</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.slice(0, 10).map((player, index) => (
                <tr key={player.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{player.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      player.skillLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                      player.skillLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {player.skillLevel === 'beginner' ? '초급' :
                       player.skillLevel === 'intermediate' ? '중급' : '고급'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{player.totalMatches}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{player.winRate.toFixed(1)}%</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{formatDuration(player.totalDuration)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


