import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Users, Trophy, Plus, X } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Match, Set } from '../types/tennis';

interface MatchFormProps {
  onClose: () => void;
  match?: Match;
}

const matchSchema = z.object({
  date: z.date(),
  time: z.string().min(1, '시간을 입력하세요'),
  courtId: z.string().min(1, '코트를 선택하세요'),
  playerA1Id: z.string().min(1, '팀A 선수1을 선택하세요'),
  playerA2Id: z.string().min(1, '팀A 선수2를 선택하세요'),
  playerB1Id: z.string().min(1, '팀B 선수1을 선택하세요'),
  playerB2Id: z.string().min(1, '팀B 선수2를 선택하세요'),
  duration: z.number().min(1, '경기 시간을 입력하세요'),
  notes: z.string().optional()
});

type MatchFormData = z.infer<typeof matchSchema>;

export const MatchForm: React.FC<MatchFormProps> = ({ onClose, match }) => {
  const { players, courts, addMatch, updateMatch } = useTennisStore();
  const [sets, setSets] = useState<Omit<Set, 'winner'>[]>(
    match?.sets.map(s => ({
      setNumber: s.setNumber,
      teamAScore: s.teamAScore,
      teamBScore: s.teamBScore,
      duration: s.duration
    })) || [
      { setNumber: 1, teamAScore: 0, teamBScore: 0 },
      { setNumber: 2, teamAScore: 0, teamBScore: 0 },
      { setNumber: 3, teamAScore: 0, teamBScore: 0 }
    ]
  );
  const [winner, setWinner] = useState<'teamA' | 'teamB'>(match?.winner || 'teamA');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      date: match?.date || new Date(),
      time: match?.date ? match.date.toTimeString().slice(0, 5) : '',
      courtId: match?.courtId || '',
      playerA1Id: match?.playerA1?.id || '',
      playerA2Id: match?.playerA2?.id || '',
      playerB1Id: match?.playerB1?.id || '',
      playerB2Id: match?.playerB2?.id || '',
      duration: match?.duration || 60,
      notes: match?.notes || ''
    }
  });

  const watchedPlayerA1Id = watch('playerA1Id');
  const watchedPlayerA2Id = watch('playerA2Id');
  const watchedPlayerB1Id = watch('playerB1Id');
  const watchedPlayerB2Id = watch('playerB2Id');

  // 사용 가능한 선수 목록 (이미 선택된 선수 제외)
  const getAvailablePlayers = (excludeIds: string[]) => {
    return players.filter(player => !excludeIds.includes(player.id));
  };

  const addSet = () => {
    const newSetNumber = Math.max(...sets.map(s => s.setNumber), 0) + 1;
    setSets([...sets, { setNumber: newSetNumber, teamAScore: 0, teamBScore: 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: keyof Set, value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);

    // 자동으로 승자 결정
    if (field === 'teamAScore' || field === 'teamBScore') {
      const set = newSets[index];
      if (set.teamAScore > set.teamBScore) {
        setWinner('teamA');
      } else if (set.teamBScore > set.teamAScore) {
        setWinner('teamB');
      }
    }
  };

  const onSubmit = async (data: MatchFormData) => {
    try {
      const [hours, minutes] = data.time.split(':').map(Number);
      const matchDate = new Date(data.date);
      matchDate.setHours(hours, minutes, 0, 0);

      // 선택된 선수 정보 가져오기
      const playerA1 = players.find(p => p.id === data.playerA1Id);
      const playerA2 = players.find(p => p.id === data.playerA2Id);
      const playerB1 = players.find(p => p.id === data.playerB1Id);
      const playerB2 = players.find(p => p.id === data.playerB2Id);

      if (!playerA1 || !playerA2 || !playerB1 || !playerB2) {
        alert('모든 선수를 선택해주세요.');
        return;
      }

      const matchData = {
        date: matchDate,
        courtId: data.courtId,
        courtName: courts.find(c => c.id === data.courtId)?.name || '',
        playerA1,
        playerA2,
        playerB1,
        playerB2,
        sets: sets.map(set => ({
          ...set,
          winner: set.teamAScore > set.teamBScore ? 'teamA' as const : 'teamB' as const
        })),
        winner,
        duration: data.duration,
        status: 'completed' as const,
        notes: data.notes
      };

      if (match) {
        await updateMatch(match.id, matchData);
      } else {
        await addMatch(matchData);
      }

      onClose();
    } catch (error) {
      console.error('경기 저장 오류:', error);
      alert('경기 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {match ? '경기 수정' : '새 경기 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                날짜
              </label>
              <input
                type="date"
                {...register('date', { valueAsDate: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                시간
              </label>
              <input
                type="time"
                {...register('time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* 코트 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코트
            </label>
            <select
              {...register('courtId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">코트를 선택하세요</option>
              {courts
                .filter(c => c.isActive)
                .sort((a, b) => {
                  // 코트 이름에서 숫자 추출하여 정렬 (코트1, 코트2, ...)
                  const aNum = parseInt(a.name.replace(/[^\d]/g, '')) || 0;
                  const bNum = parseInt(b.name.replace(/[^\d]/g, '')) || 0;
                  return aNum - bNum;
                })
                .map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name} ({court.surface})
                  </option>
                ))}
            </select>
            {errors.courtId && (
              <p className="text-red-500 text-sm mt-1">{errors.courtId.message}</p>
            )}
          </div>

          {/* 선수 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">선수 구성</h3>
            
            {/* 팀 A */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 A - 선수 1
                </label>
                <select
                  {...register('playerA1Id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선수1을 선택하세요</option>
                  {getAvailablePlayers([watchedPlayerA2Id, watchedPlayerB1Id, watchedPlayerB2Id]).map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.skillLevel})
                    </option>
                  ))}
                </select>
                {errors.playerA1Id && (
                  <p className="text-red-500 text-sm mt-1">{errors.playerA1Id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 A - 선수 2
                </label>
                <select
                  {...register('playerA2Id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선수2를 선택하세요</option>
                  {getAvailablePlayers([watchedPlayerA1Id, watchedPlayerB1Id, watchedPlayerB2Id]).map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.skillLevel})
                    </option>
                  ))}
                </select>
                {errors.playerA2Id && (
                  <p className="text-red-500 text-sm mt-1">{errors.playerA2Id.message}</p>
                )}
              </div>
            </div>

            {/* 팀 B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 B - 선수 1
                </label>
                <select
                  {...register('playerB1Id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선수1을 선택하세요</option>
                  {getAvailablePlayers([watchedPlayerA1Id, watchedPlayerA2Id, watchedPlayerB2Id]).map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.skillLevel})
                    </option>
                  ))}
                </select>
                {errors.playerB1Id && (
                  <p className="text-red-500 text-sm mt-1">{errors.playerB1Id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 B - 선수 2
                </label>
                <select
                  {...register('playerB2Id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">선수2를 선택하세요</option>
                  {getAvailablePlayers([watchedPlayerA1Id, watchedPlayerA2Id, watchedPlayerB1Id]).map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.skillLevel})
                    </option>
                  ))}
                </select>
                {errors.playerB2Id && (
                  <p className="text-red-500 text-sm mt-1">{errors.playerB2Id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 세트 점수 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">세트 점수</h3>
              <button
                type="button"
                onClick={addSet}
                className="flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                세트 추가
              </button>
            </div>

            <div className="space-y-3">
              {sets.map((set, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">세트 {set.setNumber}</span>
                    {sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={set.teamAScore}
                      onChange={(e) => updateSet(index, 'teamAScore', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={set.teamBScore}
                      onChange={(e) => updateSet(index, 'teamBScore', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">시간:</span>
                    <input
                      type="number"
                      min="0"
                      value={set.duration || ''}
                      onChange={(e) => updateSet(index, 'duration', parseInt(e.target.value) || 0)}
                      placeholder="분"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 승자 선택 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Trophy className="w-4 h-4 inline mr-2" />
                승자
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="teamA"
                    checked={winner === 'teamA'}
                    onChange={(e) => setWinner(e.target.value as 'teamA' | 'teamB')}
                    className="mr-2"
                  />
                  팀 A 승리
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="teamB"
                    checked={winner === 'teamB'}
                    onChange={(e) => setWinner(e.target.value as 'teamA' | 'teamB')}
                    className="mr-2"
                  />
                  팀 B 승리
                </label>
              </div>
            </div>
          </div>

          {/* 경기 시간 및 메모 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                경기 시간 (분)
              </label>
              <input
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="경기에 대한 추가 정보를 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {match ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};