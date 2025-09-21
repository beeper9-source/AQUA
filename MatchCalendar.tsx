import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { Schedule } from '../types/tennis';
import { getPlayerNames } from '../utils/helpers';
import { ScheduleForm } from './ScheduleForm';

export const MatchCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { getFilteredSchedules, deleteSchedule } = useTennisStore();
  const schedules = getFilteredSchedules();

  // 선택된 날짜의 일정들
  const selectedDateSchedules = schedules.filter(schedule => 
    schedule.date.toDateString() === selectedDate.toDateString()
  );

  // 달력 생성
  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const daySchedules = schedules.filter(schedule => 
        schedule.date.toDateString() === currentDate.toDateString()
      );
      
      calendarDays.push({
        date: new Date(currentDate),
        schedules: daySchedules,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isSelected: currentDate.toDateString() === selectedDate.toDateString()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendarDays;
  };

  const calendarDays = generateCalendar();

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      await deleteSchedule(scheduleId);
    }
  };

  const handleCloseForm = () => {
    setShowScheduleForm(false);
    setEditingSchedule(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ocean-900">📅 경기 일정</h1>
          <p className="text-ocean-600 mt-2">경기 일정을 달력으로 확인하고 관리하세요 🐠</p>
        </div>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="flex items-center px-4 py-2 bg-ocean-gradient text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          새 일정 등록
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 달력 */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ocean-900">
              {selectedDate.getFullYear()}년 {monthNames[selectedDate.getMonth()]}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-ocean-400 hover:text-ocean-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm text-ocean-600 hover:text-ocean-800 transition-colors"
              >
                오늘
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-ocean-400 hover:text-ocean-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-ocean-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-ocean-100 rounded cursor-pointer transition-colors ${
                  day.isSelected
                    ? 'bg-ocean-100 border-ocean-300'
                    : day.isToday
                    ? 'bg-coral-50 border-coral-200'
                    : day.isCurrentMonth
                    ? 'bg-white hover:bg-ocean-50'
                    : 'bg-gray-50 text-gray-400'
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {day.schedules.slice(0, 2).map(schedule => (
                    <div
                      key={schedule.id}
                      className="text-xs bg-ocean-100 text-ocean-800 px-1 py-0.5 rounded truncate"
                    >
                      {getPlayerNames(schedule.players)}
                    </div>
                  ))}
                  {day.schedules.length > 2 && (
                    <div className="text-xs text-ocean-500">
                      +{day.schedules.length - 2}개 더
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 선택된 날짜의 일정 목록 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-ocean-200 p-6">
          <h3 className="text-lg font-semibold text-ocean-900 mb-4">
            {selectedDate.toLocaleDateString('ko-KR', { 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })} 일정
          </h3>

          {selectedDateSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto w-12 h-12 text-ocean-300 mb-3" />
              <p className="text-ocean-500">🐠 이 날짜에 예정된 일정이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-ocean-200 rounded-lg p-4 bg-ocean-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      schedule.status === 'scheduled' ? 'bg-ocean-100 text-ocean-800' :
                      'bg-coral-100 text-coral-800'
                    }`}>
                      {schedule.status === 'scheduled' ? '예정' : '취소'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="p-1.5 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-100 rounded transition-colors"
                        title="수정"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-1.5 text-coral-600 hover:text-coral-800 hover:bg-coral-100 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-ocean-900">
                    <p className="font-medium text-ocean-900">
                      🐠 {getPlayerNames(schedule.players)}
                    </p>
                    <p className="text-xs text-ocean-600">
                      {schedule.players.length}명 참여
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 일정 등록/수정 폼 */}
      {showScheduleForm && (
        <ScheduleForm 
          onClose={handleCloseForm}
          editingSchedule={editingSchedule}
        />
      )}
    </div>
  );
};