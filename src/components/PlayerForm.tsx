import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, X } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Player } from '../types/tennis';

interface PlayerFormProps {
  onClose: () => void;
  player?: Player;
}

const playerSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요').optional().or(z.literal('')),
  phone: z.string().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced'])
});

type PlayerFormData = z.infer<typeof playerSchema>;

export const PlayerForm: React.FC<PlayerFormProps> = ({ onClose, player }) => {
  const { addPlayer, updatePlayer } = useTennisStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: player?.name || '',
      email: player?.email || '',
      phone: player?.phone || '',
      skillLevel: player?.skillLevel || 'beginner'
    }
  });

  const onSubmit = (data: PlayerFormData) => {
    const playerData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined
    };

    if (player) {
      updatePlayer(player.id, playerData);
    } else {
      addPlayer(playerData);
    }

    onClose();
  };

  const skillLevels = [
    { value: 'beginner', label: '초급', description: '기본적인 테니스 경험' },
    { value: 'intermediate', label: '중급', description: '다양한 스트로크 가능' },
    { value: 'advanced', label: '고급', description: '고급 테크닉 및 전략 활용' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {player ? '선수 정보 수정' : '새 선수 등록'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                이름 *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="선수 이름을 입력하세요"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="이메일을 입력하세요 (선택사항)"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="전화번호를 입력하세요 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                연주 수준 *
              </label>
              <div className="space-y-2">
                {skillLevels.map((level) => (
                  <label key={level.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={level.value}
                      {...register('skillLevel')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{level.label}</div>
                      <div className="text-xs text-gray-500">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.skillLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.skillLevel.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {player ? '수정하기' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


