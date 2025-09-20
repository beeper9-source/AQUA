import React, { useState } from 'react';
import { Share2, Copy, Download, Mail, MessageSquare } from 'lucide-react';
import { useTennisStore } from '../store/tennisStore';
import { formatDateTime, getTeamName, getMatchWinner, getMatchScore, exportMatchesToCSV, copyToClipboard } from '../utils/helpers';

export const SharePage: React.FC = () => {
  const { getFilteredMatches, getMatchStats } = useTennisStore();
  const matches = getFilteredMatches();
  const stats = getMatchStats();
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const summary = `테니스 경기 결과 요약\n\n` +
      `📊 총 경기 수: ${stats.totalMatches}\n` +
      `✅ 완료된 경기: ${stats.completedMatches}\n` +
      `⏱️ 평균 경기 시간: ${Math.round(stats.averageDuration)}분\n` +
      `👥 등록된 선수: ${matches.length > 0 ? matches.reduce((acc, match) => {
        const players = new Set();
        players.add(match.playerA1.id);
        players.add(match.playerA2.id);
        players.add(match.playerB1.id);
        players.add(match.playerB2.id);
        return acc + players.size;
      }, 0) / matches.length : 0}명\n\n`;

    const recentMatches = matches
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(match => 
        `${formatDateTime(match.date)} - ${getMatchWinner(match)} 승 (${getMatchScore(match)})`
      ).join('\n');

    return summary + '🏆 최근 경기 결과:\n' + recentMatches;
  };

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(generateShareText());
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCSV = () => {
    const csv = exportMatchesToCSV(matches);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tennis-matches-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '테니스 경기 결과',
          text: generateShareText(),
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('테니스 경기 결과 공유');
    const body = encodeURIComponent(generateShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">경기 결과 공유</h1>
        <p className="text-gray-600 mt-2">경기 결과를 다른 사람들과 공유하세요</p>
      </div>

      {/* 공유 옵션 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleShareViaWebShare}
          className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-6 h-6 text-primary-600" />
          <span className="font-medium text-gray-900">공유하기</span>
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-6 h-6 text-tennis-600" />
          <span className="font-medium text-gray-900">
            {copied ? '복사됨!' : '클립보드 복사'}
          </span>
        </button>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Download className="w-6 h-6 text-court-600" />
          <span className="font-medium text-gray-900">CSV 다운로드</span>
        </button>

        <button
          onClick={handleEmailShare}
          className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Mail className="w-6 h-6 text-purple-600" />
          <span className="font-medium text-gray-900">이메일 공유</span>
        </button>
      </div>

      {/* 미리보기 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">공유 내용 미리보기</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {generateShareText()}
          </pre>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 경기 수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMatches}</p>
            </div>
            <div className="w-12 h-12 bg-tennis-500 rounded-lg flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">완료된 경기</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedMatches}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 경기 시간</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(stats.averageDuration)}분
              </p>
            </div>
            <div className="w-12 h-12 bg-court-500 rounded-lg flex items-center justify-center">
              <Copy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 최근 경기 결과 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 경기 결과</h3>
        {matches.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="mx-auto w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">공유할 경기 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .slice(0, 10)
              .map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getTeamName(match.playerA1, match.playerA2)} vs {getTeamName(match.playerB1, match.playerB2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(match.date)} • {match.courtName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-tennis-600">
                      {getMatchWinner(match)} 승
                    </p>
                    <p className="text-xs text-gray-500">
                      {getMatchScore(match)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};


