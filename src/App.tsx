import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MatchList } from './components/MatchList';
import { PlayerManagement } from './components/PlayerManagement';
import { MatchCalendar } from './components/MatchCalendar';
import { Statistics } from './components/Statistics';
import { SharePage } from './components/SharePage';
import { Settings } from './components/Settings';
import { useTennisStore } from './store/tennisStore';
// import { useTennisStoreFallback as useTennisStore } from './store/tennisStore-fallback';
import './utils/supabase-test';

function App() {
  const { loadAllData, isLoading } = useTennisStore();

  useEffect(() => {
    // 앱 시작 시 데이터 로드
    loadAllData();
  }, [loadAllData]);

      if (isLoading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-wave-50 flex items-center justify-center relative overflow-hidden">
            {/* 수족관 배경 효과 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-20 w-3 h-3 bg-ocean-400 rounded-full animate-bubble"></div>
              <div className="absolute top-40 right-32 w-2 h-2 bg-coral-400 rounded-full animate-bubble" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-32 left-32 w-2.5 h-2.5 bg-ocean-300 rounded-full animate-bubble" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-coral-300 rounded-full animate-bubble" style={{animationDelay: '3s'}}></div>
            </div>
            <div className="text-center relative z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
              <p className="text-ocean-600">🌊 수족관 데이터를 불러오는 중... 🐠</p>
            </div>
          </div>
        );
      }

  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-ocean-50 to-wave-50">
        <Navigation />
        <main className="flex-1 p-8 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<MatchList />} />
            <Route path="/players" element={<PlayerManagement />} />
            <Route path="/calendar" element={<MatchCalendar />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;


