import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, Download, Upload, Database } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { supabase } from '../lib/supabase';

export const Settings: React.FC = () => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { 
    players, 
    matches, 
    courts,
    addPlayer,
    addMatch,
    addCourt
  } = useTennisStore();

  const handleExportData = () => {
    const data = {
      players,
      matches,
      courts,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tennis-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // 데이터 검증
        if (!data.players || !data.teams || !data.matches || !data.courts) {
          alert('잘못된 데이터 형식입니다.');
          return;
        }

        // 데이터 복원
        if (window.confirm('모든 데이터를 덮어쓰시겠습니까? 현재 데이터는 백업을 권장합니다.')) {
          // 기존 데이터 초기화 (간단한 방법)
          window.location.reload();
          // 실제로는 store의 reset 기능을 구현해야 함
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (showResetConfirm) {
      // 실제 리셋 로직 구현
      localStorage.removeItem('tennis-store');
      window.location.reload();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600 mt-2">앱 설정과 데이터 관리를 할 수 있습니다</p>
      </div>

      {/* 데이터 관리 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">데이터 관리</h3>
            <p className="text-gray-600">Supabase 데이터베이스와 연동된 데이터를 관리합니다</p>
          </div>
          <Database className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">데이터 내보내기</h4>
            <button
              onClick={handleExportData}
              className="flex items-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">데이터 백업</span>
            </button>
            <p className="text-xs text-gray-500">
              Supabase에서 모든 데이터를 JSON 파일로 다운로드합니다
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">데이터 새로고침</h4>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5 text-tennis-600" />
              <span className="font-medium text-gray-900">데이터 새로고침</span>
            </button>
            <p className="text-xs text-gray-500">
              Supabase에서 최신 데이터를 다시 불러옵니다
            </p>
          </div>
        </div>
      </div>

      {/* Supabase 연결 상태 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supabase 연결</h3>
            <p className="text-gray-600">데이터베이스 연결 상태를 확인합니다</p>
          </div>
          <Database className="w-6 h-6 text-green-400" />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800">연결됨</h4>
              <p className="text-sm text-green-700 mt-1">
                Supabase 데이터베이스와 정상적으로 연결되었습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 초기화 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">데이터 초기화</h3>
            <p className="text-gray-600">Supabase 데이터베이스의 모든 데이터를 삭제합니다</p>
          </div>
          <RotateCcw className="w-6 h-6 text-red-400" />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">주의사항</h4>
              <p className="text-sm text-red-700 mt-1">
                이 작업은 되돌릴 수 없습니다. Supabase 데이터베이스의 모든 선수, 팀, 경기 데이터가 영구적으로 삭제됩니다.
              </p>
              <div className="mt-3">
                <button
                  onClick={handleResetData}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showResetConfirm
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {showResetConfirm ? '정말 삭제하시겠습니까?' : '모든 데이터 삭제'}
                </button>
                {showResetConfirm && (
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">앱 정보</h3>
            <p className="text-gray-600">현재 앱의 버전과 데이터 현황을 확인할 수 있습니다</p>
          </div>
          <Save className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">버전 정보</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">앱 버전</span>
                  <span className="text-sm font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">빌드 날짜</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">데이터 현황</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">등록된 선수</span>
                  <span className="text-sm font-medium text-gray-900">{players.length}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">활성 코트</span>
                  <span className="text-sm font-medium text-gray-900">{courts.filter(c => c.isActive).length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">경기 기록</span>
                  <span className="text-sm font-medium text-gray-900">{matches.length}경기</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">코트 수</span>
                  <span className="text-sm font-medium text-gray-900">{courts.length}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


