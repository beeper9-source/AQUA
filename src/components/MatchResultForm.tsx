import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Trophy, X, Users, CalendarDays } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Match, Player, Schedule } from '../types/tennis';

interface MatchResultFormProps {
  onClose: () => void;
  match?: Match;
}

const matchResultSchema = z.object({
  scheduleId: z.string().min(1, '경기 일정을 선택하세요'),
  courtId: z.string().min(1, '코트를 선택하세요'),
  playerA1Id: z.string().min(1, 'A팀 1번 선수를 선택하세요'),
  playerA2Id: z.string().min(1, 'A팀 2번 선수를 선택하세요'),
  playerB1Id: z.string().min(1, 'B팀 1번 선수를 선택하세요'),
  playerB2Id: z.string().min(1, 'B팀 2번 선수를 선택하세요'),
  result: z.enum(['teamA', 'teamB', 'draw'], {
    required_error: '경기 결과를 선택하세요'
  }),
  duration: z.number().min(1, '경기 시간을 입력하세요'),
  notes: z.string().optional()
});

type MatchResultFormData = z.infer<typeof matchResultSchema>;

export const MatchResultForm: React.FC<MatchResultFormProps> = ({ onClose, match }) => {
  const { players, schedules, courts, addMatch } = useTennisStore();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<MatchResultFormData>({
    resolver: zodResolver(matchResultSchema),
    defaultValues: {
      scheduleId: match?.scheduleId || '',
      courtId: match?.courtId || '00000000-0000-0000-0000-000000000002',
      playerA1Id: match?.playerA1?.id || '',
      playerA2Id: match?.playerA2?.id || '',
      playerB1Id: match?.playerB1?.id || '',
      playerB2Id: match?.playerB2?.id || '',
      result: match?.result || 'teamA',
      duration: match?.duration || 20,
      notes: match?.notes || ''
    }
  });

  const watchedScheduleId = watch('scheduleId');
  const watchedPlayerA1Id = watch('playerA1Id');
  const watchedPlayerA2Id = watch('playerA2Id');
  const watchedPlayerB1Id = watch('playerB1Id');
  const watchedPlayerB2Id = watch('playerB2Id');

  // 선택된 선수들을 제외한 선수 목록을 반환하는 함수
  const getAvailablePlayersFor = (excludePlayerId?: string) => {
    const selectedPlayerIds = [watchedPlayerA1Id, watchedPlayerA2Id, watchedPlayerB1Id, watchedPlayerB2Id]
      .filter(id => id && id !== excludePlayerId);
    
    return availablePlayers.filter(player => 
      !selectedPlayerIds.includes(player.id)
    );
  };

  // 일정 선택 시 해당 일정의 선수들만 사용 가능하도록 설정
  useEffect(() => {
    if (watchedScheduleId) {
      const schedule = schedules.find(s => s.id === watchedScheduleId);
      setSelectedSchedule(schedule || null);
      
      if (schedule) {
        setAvailablePlayers(schedule.players);
        // 선수 선택 초기화
        setValue('playerA1Id', '');
        setValue('playerA2Id', '');
        setValue('playerB1Id', '');
        setValue('playerB2Id', '');
      }
    } else {
      setSelectedSchedule(null);
      setAvailablePlayers([]);
    }
  }, [watchedScheduleId, schedules, setValue]);

  const onSubmit = async (data: MatchResultFormData) => {
    try {
      if (!selectedSchedule) {
        alert('경기 일정을 선택해주세요.');
        return;
      }

      // 선택된 선수들 찾기
      const playerA1 = availablePlayers.find(p => p.id === data.playerA1Id);
      const playerA2 = availablePlayers.find(p => p.id === data.playerA2Id);
      const playerB1 = availablePlayers.find(p => p.id === data.playerB1Id);
      const playerB2 = availablePlayers.find(p => p.id === data.playerB2Id);

      if (!playerA1 || !playerA2 || !playerB1 || !playerB2) {
        alert('모든 선수를 선택해주세요.');
        return;
      }

      // 중복 선수 체크
      const selectedPlayers = [playerA1.id, playerA2.id, playerB1.id, playerB2.id];
      const uniquePlayers = new Set(selectedPlayers);
      if (uniquePlayers.size !== 4) {
        alert('중복된 선수를 선택할 수 없습니다.');
        return;
      }

      const selectedCourt = courts.find(c => c.id === data.courtId);
      if (!selectedCourt) {
        alert('선택한 코트를 찾을 수 없습니다.');
        return;
      }

      const matchData = {
        scheduleId: selectedSchedule.id,
        date: selectedSchedule.date,
        playerA1,
        playerA2,
        playerB1,
        playerB2,
        sets: [
          {
            setNumber: 1,
            teamAScore: data.result === 'teamA' ? 6 : data.result === 'teamB' ? 4 : 5,
            teamBScore: data.result === 'teamB' ? 6 : data.result === 'teamA' ? 4 : 5,
            result: data.result
          }
        ],
        result: data.result,
        duration: data.duration,
        status: 'completed' as const,
        notes: data.notes,
        courtId: data.courtId,
        courtName: selectedCourt.name
      };

      await addMatch(matchData);
      onClose();
    } catch (error) {
      console.error('경기 결과 저장 오류:', error);
      alert('경기 결과 저장 중 오류가 발생했습니다.');
    }
  };

  const watchedValues = watch();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-ocean-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-ocean-900">🏆 복식 경기 결과 등록</h2>
          <button
            onClick={onClose}
            className="text-ocean-500 hover:text-ocean-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 경기 일정 선택 */}
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              <CalendarDays className="w-4 h-4 inline mr-2" />
              경기 일정 선택
            </label>
            {schedules.length === 0 ? (
              <div className="text-center py-8 bg-coral-50 border border-coral-200 rounded-lg">
                <CalendarDays className="mx-auto w-12 h-12 text-coral-400 mb-3" />
                <p className="text-coral-700 font-medium mb-2">📅 등록된 일정이 없습니다</p>
                <p className="text-coral-600 text-sm">
                  먼저 <strong>"경기 일정"</strong> 메뉴에서 경기 일정을 등록해주세요
                </p>
                <p className="text-coral-500 text-xs mt-2">
                  일정을 등록한 후에만 경기 결과를 입력할 수 있습니다
                </p>
              </div>
            ) : (
              <select
                {...register('scheduleId')}
                className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="">일정을 선택하세요</option>
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.date.toLocaleDateString('ko-KR')} - {schedule.players.map(p => p.name).join(', ')}
                  </option>
                ))}
              </select>
            )}
            {errors.scheduleId && (
              <p className="text-coral-500 text-sm mt-1">{errors.scheduleId.message}</p>
            )}
          </div>

          {/* 코트 선택 */}
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              🏟️ 코트 선택
            </label>
            <select
              {...register('courtId')}
              className="w-full p-3 border border-ocean-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white/80"
            >
              <option value="">코트를 선택하세요</option>
              {courts.filter(court => court.isActive).map(court => (
                <option key={court.id} value={court.id}>
                  {court.name} ({court.location}) - {court.surface}
                </option>
              ))}
            </select>
            {errors.courtId && (
              <p className="text-coral-500 text-sm mt-1">{errors.courtId.message}</p>
            )}
          </div>

          {/* 선택된 일정 정보 표시 */}
          {selectedSchedule && (
            <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4">
              <h4 className="font-medium text-ocean-900 mb-2">📅 선택된 일정 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-ocean-700">날짜:</span>
                  <span className="ml-2 text-ocean-600">
                    {selectedSchedule.date.toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-ocean-700">참여 선수:</span>
                  <span className="ml-2 text-ocean-600">
                    {selectedSchedule.players.length}명
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-ocean-700">선수 목록:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedSchedule.players.map(player => (
                      <span
                        key={player.id}
                        className="inline-flex items-center px-2 py-1 bg-ocean-100 text-ocean-800 text-xs rounded-full"
                      >
                        {player.name} ({player.skillLevel})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* 선수 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ocean-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              🐠 선수 구성 (복식)
            </h3>
            
            {selectedSchedule ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* A팀 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-ocean-800 bg-ocean-100 px-3 py-2 rounded-lg">
                    A팀
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      1번 선수
                    </label>
                    <select
                      {...register('playerA1Id')}
                      className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="">선수를 선택하세요</option>
                      {getAvailablePlayersFor(watchedPlayerA1Id).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.skillLevel})
                        </option>
                      ))}
                    </select>
                    {errors.playerA1Id && (
                      <p className="text-coral-500 text-sm mt-1">{errors.playerA1Id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      2번 선수
                    </label>
                    <select
                      {...register('playerA2Id')}
                      className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="">선수를 선택하세요</option>
                      {getAvailablePlayersFor(watchedPlayerA2Id).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.skillLevel})
                        </option>
                      ))}
                    </select>
                    {errors.playerA2Id && (
                      <p className="text-coral-500 text-sm mt-1">{errors.playerA2Id.message}</p>
                    )}
                  </div>
                </div>

                {/* B팀 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-ocean-800 bg-coral-100 px-3 py-2 rounded-lg">
                    B팀
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      1번 선수
                    </label>
                    <select
                      {...register('playerB1Id')}
                      className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="">선수를 선택하세요</option>
                      {getAvailablePlayersFor(watchedPlayerB1Id).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.skillLevel})
                        </option>
                      ))}
                    </select>
                    {errors.playerB1Id && (
                      <p className="text-coral-500 text-sm mt-1">{errors.playerB1Id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ocean-700 mb-2">
                      2번 선수
                    </label>
                    <select
                      {...register('playerB2Id')}
                      className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    >
                      <option value="">선수를 선택하세요</option>
                      {getAvailablePlayersFor(watchedPlayerB2Id).map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({player.skillLevel})
                        </option>
                      ))}
                    </select>
                    {errors.playerB2Id && (
                      <p className="text-coral-500 text-sm mt-1">{errors.playerB2Id.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Users className="mx-auto w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600">
                  먼저 경기 일정을 선택해주세요
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  일정을 선택하면 해당 날짜의 참여 선수들만 선택할 수 있습니다
                </p>
              </div>
            )}
          </div>

          {/* 경기 결과 */}
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-3">
              🏆 경기 결과
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center p-4 border border-ocean-200 rounded-lg cursor-pointer hover:bg-ocean-50 transition-colors">
                <input
                  type="radio"
                  value="teamA"
                  {...register('result')}
                  className="mr-3 text-ocean-600"
                />
                <div>
                  <div className="font-medium text-ocean-900">A팀 승리</div>
                  <div className="text-sm text-ocean-600">A팀이 이겼습니다</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-ocean-200 rounded-lg cursor-pointer hover:bg-ocean-50 transition-colors">
                <input
                  type="radio"
                  value="teamB"
                  {...register('result')}
                  className="mr-3 text-ocean-600"
                />
                <div>
                  <div className="font-medium text-ocean-900">B팀 승리</div>
                  <div className="text-sm text-ocean-600">B팀이 이겼습니다</div>
                </div>
              </label>

              <label className="flex items-center p-4 border border-ocean-200 rounded-lg cursor-pointer hover:bg-ocean-50 transition-colors">
                <input
                  type="radio"
                  value="draw"
                  {...register('result')}
                  className="mr-3 text-ocean-600"
                />
                <div>
                  <div className="font-medium text-ocean-900">무승부</div>
                  <div className="text-sm text-ocean-600">경기가 무승부로 끝났습니다</div>
                </div>
              </label>
            </div>
            {errors.result && (
              <p className="text-coral-500 text-sm mt-1">{errors.result.message}</p>
            )}
          </div>

          {/* 경기 시간 */}
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              경기 시간 (분)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              {...register('duration', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              placeholder="20"
            />
            {errors.duration && (
              <p className="text-coral-500 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              📝 메모
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
              placeholder="경기에 대한 추가 정보를 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ocean-700 bg-ocean-100 rounded-md hover:bg-ocean-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-ocean-gradient text-white rounded-md hover:shadow-lg transition-all"
            >
              경기 결과 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
