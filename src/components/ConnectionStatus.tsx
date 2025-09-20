import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase
          .from('courts')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          setConnectionStatus('error');
          setErrorMessage(error.message);
        } else {
          setConnectionStatus('connected');
          setErrorMessage('');
        }
      } catch (err) {
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : '알 수 없는 오류');
      }
    };

    checkConnection();
    
    // 30초마다 연결 상태 확인
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Database className="w-4 h-4 text-ocean-500 animate-pulse" />;
      case 'connected':
        return <Wifi className="w-4 h-4 text-ocean-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-coral-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return '연결 확인 중...';
      case 'connected':
        return 'Supabase 연결됨';
      case 'error':
        return '연결 오류';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'text-ocean-600';
      case 'connected':
        return 'text-ocean-600';
      case 'error':
        return 'text-coral-600';
    }
  };

  if (connectionStatus === 'connected') {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-ocean-50 border border-ocean-200 rounded-lg">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          🌊 {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-coral-50 border border-coral-200 rounded-lg">
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        🚨 {getStatusText()}
      </span>
      {errorMessage && (
        <div className="group relative">
          <AlertCircle className="w-4 h-4 text-coral-500 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-ocean-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};
