import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Users, 
  Settings, 
  BarChart3,
  Calendar,
  Share2,
  Waves,
  Fish,
  Anchor
} from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: '대시보드', icon: Home },
    { path: '/players', label: '선수 관리', icon: Fish },
    { path: '/calendar', label: '경기 일정', icon: Calendar },
    { path: '/matches', label: '경기 결과', icon: Trophy },
    { path: '/stats', label: '통계', icon: BarChart3 },
    { path: '/share', label: '공유', icon: Share2 },
    { path: '/settings', label: '설정', icon: Anchor }
  ];

  return (
    <nav className="bg-gradient-to-b from-ocean-50 to-wave-50 border-r border-ocean-200 w-64 min-h-screen relative overflow-hidden">
      {/* 수족관 배경 효과 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-4 w-2 h-2 bg-ocean-400 rounded-full animate-bubble"></div>
        <div className="absolute top-20 right-8 w-1 h-1 bg-coral-400 rounded-full animate-bubble" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-32 left-8 w-1.5 h-1.5 bg-ocean-300 rounded-full animate-bubble" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-48 right-4 w-1 h-1 bg-coral-300 rounded-full animate-bubble" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 left-6 w-2 h-2 bg-ocean-500 rounded-full animate-bubble" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="p-6 relative z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-ocean-gradient rounded-lg flex items-center justify-center animate-float">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-ocean-900">Aqua Tennis</h1>
        </div>

        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ocean-100 text-ocean-700 shadow-sm'
                      : 'text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 연결 상태 표시 */}
        <div className="mt-6">
          <ConnectionStatus />
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-ocean-200">
        <div className="text-xs text-ocean-500 text-center">
          <p>Aqua Tennis Tracker</p>
          <p>v1.0.0 - Supabase</p>
        </div>
      </div>
    </nav>
  );
};


