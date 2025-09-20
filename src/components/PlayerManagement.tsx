import React, { useState } from 'react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Player } from '../types/tennis';
import { PlayerForm } from './PlayerForm';

export const PlayerManagement: React.FC = () => {
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { players, deletePlayer } = useTennisStore();

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (window.confirm('이 선수를 삭제하시겠습니까? 관련된 팀과 경기 정보도 함께 삭제됩니다.')) {
      deletePlayer(playerId);
    }
  };

  const getSkillLevelColor = (level: Player['skillLevel']) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
    }
  };

  const getSkillLevelLabel = (level: Player['skillLevel']) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">선수 관리</h1>
          <p className="text-gray-600 mt-2">등록된 선수들을 관리하고 새로운 선수를 추가하세요</p>
        </div>
        <button
          onClick={() => setShowPlayerForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          새 선수 등록
        </button>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 선수가 없습니다</h3>
          <p className="text-gray-500 mb-4">새로운 선수를 등록해보세요.</p>
          <button
            onClick={() => setShowPlayerForm(true)}
            className="btn-primary"
          >
            첫 번째 선수 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div key={player.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-tennis-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(player.skillLevel)}`}>
                      {getSkillLevelLabel(player.skillLevel)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditPlayer(player)}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {player.email && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">이메일:</span> {player.email}
                  </div>
                )}
                {player.phone && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">전화:</span> {player.phone}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">가입일:</span> {player.createdAt.toLocaleDateString('ko-KR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPlayerForm && (
        <PlayerForm
          player={selectedPlayer || undefined}
          onClose={() => {
            setShowPlayerForm(false);
            setSelectedPlayer(null);
          }}
        />
      )}
    </div>
  );
};


