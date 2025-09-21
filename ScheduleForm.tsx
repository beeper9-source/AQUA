import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, X } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Schedule } from '../types/tennis';

interface ScheduleFormProps {
  onClose: () => void;
  schedule?: Schedule;
  editingSchedule?: Schedule | null;
}

const scheduleSchema = z.object({
  date: z.date(),
  playerIds: z.array(z.string()).min(2, '최소 2명의 선수를 선택하세요'),
  notes: z.string().optional()
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ onClose, schedule, editingSchedule }) => {
  const { players, addSchedule, updateSchedule } = useTennisStore();
  
  // editingSchedule이 있으면 그것을 사용, 없으면 schedule 사용
  const currentSchedule = editingSchedule || schedule;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: currentSchedule?.date || new Date(),
      playerIds: currentSchedule?.players?.map(p => p.id) || [],
      notes: currentSchedule?.notes || ''
    }
  });

  const watchedPlayerIds = watch('playerIds');

  // 멀티선택 핸들러
  const handlePlayerToggle = (currentIds: string[], playerId: string, checked: boolean) => {
    if (checked) {
      // 선수 추가
      return [...currentIds, playerId];
    } else {
      // 선수 제거
      return currentIds.filter(id => id !== playerId);
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      // 선택된 선수 정보 가져오기
      const selectedPlayers = players.filter(p => data.playerIds.includes(p.id));

      if (selectedPlayers.length < 2) {
        alert('최소 2명의 선수를 선택해주세요.');
        return;
      }

      const scheduleData = {
        date: data.date,
        players: selectedPlayers,
        status: 'scheduled' as const,
        notes: data.notes
      };

      if (currentSchedule) {
        await updateSchedule(currentSchedule.id, scheduleData);
      } else {
        await addSchedule(scheduleData);
      }

      onClose();
    } catch (error) {
      console.error('일정 저장 오류:', error);
      alert('일정 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-ocean-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-ocean-900">
            {currentSchedule ? '일정 수정' : '새 일정 등록'}
          </h2>
          <button
            onClick={onClose}
            className="text-ocean-500 hover:text-ocean-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              날짜
            </label>
            <input
              type="date"
              {...register('date', { valueAsDate: true })}
              className="w-full px-3 py-2 border border-ocean-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            {errors.date && (
              <p className="text-coral-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* 선수 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-ocean-900">🐠 선수 선택</h3>
            <p className="text-sm text-ocean-600">참여할 선수들을 체크하세요 (최소 2명)</p>
            
            <Controller
              name="playerIds"
              control={control}
              render={({ field }) => (
                <div className="max-h-60 overflow-y-auto border border-ocean-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {players.map(player => {
                      const isSelected = field.value?.includes(player.id) || false;
                      return (
                        <label
                          key={player.id}
                          className="flex items-center p-3 border border-ocean-200 rounded-lg cursor-pointer hover:bg-ocean-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newPlayerIds = handlePlayerToggle(field.value || [], player.id, e.target.checked);
                              field.onChange(newPlayerIds);
                            }}
                            className="mr-3 w-4 h-4 text-ocean-600 bg-gray-100 border-ocean-300 rounded focus:ring-ocean-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-ocean-900">
                              {player.name}
                            </div>
                            <div className="text-sm text-ocean-600">
                              {player.skillLevel} • {player.email || '이메일 없음'}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="text-ocean-500">
                              ✓
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            />
            
            {errors.playerIds && (
              <p className="text-coral-500 text-sm mt-1">{errors.playerIds.message}</p>
            )}
            
            {watchedPlayerIds && watchedPlayerIds.length > 0 && (
              <div className="bg-ocean-50 rounded-lg p-3">
                <p className="text-sm font-medium text-ocean-900 mb-2">
                  선택된 선수 ({watchedPlayerIds.length}명):
                </p>
                <div className="flex flex-wrap gap-2">
                  {watchedPlayerIds.map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    return player ? (
                      <span
                        key={playerId}
                        className="inline-flex items-center px-2 py-1 bg-ocean-100 text-ocean-800 text-sm rounded-full"
                      >
                        {player.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
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
              placeholder="일정에 대한 추가 정보를 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ocean-700 bg-ocean-100 rounded-md hover:bg-ocean-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-ocean-gradient text-white rounded-md hover:shadow-lg transition-all"
            >
              {currentSchedule ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
