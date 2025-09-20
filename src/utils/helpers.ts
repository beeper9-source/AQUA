import { Match, MatchStats, Player, Court } from '../types/tennis';

export const generateId = (): string => {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
};

export const calculateMatchStats = (matches: Match[]): MatchStats => {
  const completedMatches = matches.filter(m => m.status === 'completed');
  const cancelledMatches = matches.filter(m => m.status === 'cancelled');
  
  const totalDuration = completedMatches.reduce((sum, match) => sum + match.duration, 0);
  const averageDuration = completedMatches.length > 0 ? totalDuration / completedMatches.length : 0;
  
  
  // Find most active player
  const playerCounts: Record<string, number> = {};
  matches.forEach(match => {
    [match.playerA1, match.playerA2, match.playerB1, match.playerB2]
      .forEach(player => {
        playerCounts[player.id] = (playerCounts[player.id] || 0) + 1;
      });
  });
  
  const mostActivePlayer = Object.entries(playerCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

  // Find most active court
  const courtCounts: Record<string, number> = {};
  matches.forEach(match => {
    courtCounts[match.courtId] = (courtCounts[match.courtId] || 0) + 1;
  });
  
  const mostActiveCourt = Object.entries(courtCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  
  // Calculate win rates - 승수와 전체 경기 수를 모두 추적
  const winCount: Record<string, number> = {};
  const totalMatchCount: Record<string, number> = {};
  
  completedMatches.forEach(match => {
    // 모든 선수에게 경기 참여 횟수 추가
    [match.playerA1, match.playerA2, match.playerB1, match.playerB2].forEach(player => {
      totalMatchCount[player.id] = (totalMatchCount[player.id] || 0) + 1;
    });
    
    // 승리한 팀의 선수들에게 승수 추가
    if (match.result === 'teamA') {
      [match.playerA1, match.playerA2].forEach(player => {
        winCount[player.id] = (winCount[player.id] || 0) + 1;
      });
    } else if (match.result === 'teamB') {
      [match.playerB1, match.playerB2].forEach(player => {
        winCount[player.id] = (winCount[player.id] || 0) + 1;
      });
    }
    // 무승부는 승수에 포함되지 않음
  });
  
  // 승률 계산 (승수 / 전체 경기 수 * 100)
  const winRate: Record<string, number> = {};
  Object.keys(totalMatchCount).forEach(playerId => {
    const wins = winCount[playerId] || 0;
    const totalMatches = totalMatchCount[playerId] || 0;
    winRate[playerId] = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    
  });
  
  return {
    totalMatches: matches.length,
    completedMatches: completedMatches.length,
    cancelledMatches: cancelledMatches.length,
    averageDuration,
    mostActivePlayer,
    mostActiveCourt,
    winRate
  };
};

export const getPlayerName = (player: Player): string => {
  return player.name;
};

export const getTeamName = (player1: Player, player2: Player): string => {
  return `${player1.name} & ${player2.name}`;
};

export const getPlayerNames = (players: Player[]): string => {
  return players.map(p => p.name).join(', ');
};

export const getMatchWinner = (match: Match): string => {
  if (match.result === 'teamA') {
    return getTeamName(match.playerA1, match.playerA2);
  } else if (match.result === 'teamB') {
    return getTeamName(match.playerB1, match.playerB2);
  } else {
    return '무승부';
  }
};

export const getMatchScore = (match: Match): string => {
  return match.sets.map(set => `${set.teamAScore}-${set.teamBScore}`).join(' / ');
};

export const exportMatchesToCSV = (matches: Match[]): string => {
  const headers = [
    '날짜',
    '팀A',
    '팀B',
    '승자',
    '세트 스코어',
    '경기 시간(분)',
    '코트',
    '상태'
  ];
  
  const rows = matches.map(match => [
    formatDateTime(match.date),
    getTeamName(match.playerA1, match.playerA2),
    getTeamName(match.playerB1, match.playerB2),
    getMatchWinner(match),
    getMatchScore(match),
    match.duration.toString(),
    match.courtName,
    match.status
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};


