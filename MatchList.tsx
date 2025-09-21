import React, { useState } from 'react';
import { Calendar, Clock, Trophy, Edit, Trash2, Filter, Share2, Plus } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Match } from '../types/tennis';
import { formatDateTime, formatDuration, getTeamName, getMatchWinner, getMatchScore } from '../utils/helpers';
import { MatchResultForm } from './MatchResultForm';

export const MatchList: React.FC = () => {
  const { getFilteredMatches } = useTennisStore();
  const matches = getFilteredMatches();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMatchResultForm, setShowMatchResultForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { deleteMatch, setFilters, filters } = useTennisStore();

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowMatchResultForm(true);
  };

  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('이 경기 결과를 삭제하시겠습니까?')) {
      deleteMatch(matchId);
    }
  };

  const handleShareMatches = () => {
    const matchData = {
      matches: matches,
      timestamp: new Date().toISOString(),
      count: matches.length
    };
    
    const shareText = `테니스 경기 결과 공유\n\n총 ${matches.length}경기\n\n` +
      matches.slice(0, 5).map(match => 
        `${formatDateTime(match.date)} - ${getMatchWinner(match)} 승 (${getMatchScore(match)})`
      ).join('\n') +
      (matches.length > 5 ? `\n... 및 ${matches.length - 5}경기 더` : '');
    
    if (navigator.share) {
      navigator.share({
        title: '테니스 경기 결과',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('경기 결과가 클립보드에 복사되었습니다!');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ocean-900">🏆 경기 결과</h1>
          <p className="text-ocean-600 mt-2">완료된 경기 결과를 확인하고 관리하세요 🐠</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMatchResultForm(true)}
            className="flex items-center px-4 py-2 bg-ocean-gradient text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 경기 결과
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-ocean-700 bg-ocean-100 rounded-lg hover:bg-ocean-200 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            필터
          </button>
          <button
            onClick={handleShareMatches}
            className="flex items-center px-3 py-2 text-ocean-700 bg-ocean-100 rounded-lg hover:bg-ocean-200 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </button>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6">
          <h3 className="text-lg font-semibold text-ocean-900 mb-4">🔍 필터 옵션</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">시작 날짜</label>
              <input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateFrom: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">종료 날짜</label>
              <input
                type="date"
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateTo: e.target.value ? new Date(e.target.value) : undefined
                })}
                className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">상태</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  status: e.target.value as Match['status'] || undefined
                })}
                className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="">모든 상태</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="w-full px-4 py-2 text-ocean-700 bg-ocean-100 rounded-md hover:bg-ocean-200 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 경기 결과 목록 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto w-16 h-16 text-ocean-300 mb-4" />
            <h3 className="text-lg font-medium text-ocean-900 mb-2">🏆 완료된 경기가 없습니다</h3>
            <p className="text-ocean-500">경기를 완료하면 결과가 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="divide-y divide-ocean-200">
            {matches.map((match) => (
              <div key={match.id} className="p-6 hover:bg-ocean-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center text-sm text-ocean-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDateTime(match.date)}
                      </div>
                      <div className="flex items-center text-sm text-ocean-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(match.duration)}
                      </div>
                      <div className="flex items-center text-sm text-ocean-600">
                        🏟️ {match.courtName}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-lg font-semibold text-ocean-900 mb-2">
                        🐠 {getTeamName(match.playerA1, match.playerA2)} vs {getTeamName(match.playerB1, match.playerB2)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-ocean-600">
                        <div>
                          <span className="font-medium">팀 A:</span> {match.playerA1.name} & {match.playerA2.name}
                        </div>
                        <div>
                          <span className="font-medium">팀 B:</span> {match.playerB1.name} & {match.playerB2.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-ocean-700">
                        <Trophy className="w-5 h-5 mr-2 text-coral-500" />
                        <span className="font-semibold">
                          🏆 {getMatchWinner(match)}
                          {match.result !== 'draw' && ' 승'}
                        </span>
                      </div>
                      <div className="text-ocean-600">
                        스코어: {getMatchScore(match)}
                      </div>
                      {match.notes && (
                        <div className="text-ocean-600">
                          📝 {match.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleEditMatch(match)}
                      className="p-2 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-100 rounded-lg transition-colors"
                      title="결과 수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="p-2 text-coral-600 hover:text-coral-800 hover:bg-coral-100 rounded-lg transition-colors"
                      title="결과 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 경기 결과 등록 폼 */}
      {showMatchResultForm && (
        <MatchResultForm 
          match={selectedMatch || undefined}
          onClose={() => {
            setShowMatchResultForm(false);
            setSelectedMatch(null);
          }} 
        />
      )}
    </div>
  );
};