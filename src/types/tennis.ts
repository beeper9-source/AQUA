export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

export interface Court {
  id: string;
  name: string;
  location: string;
  surface: 'hard' | 'clay' | 'grass' | 'synthetic';
  isIndoor: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  date: Date;
  players: Player[];
  status: 'scheduled' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  scheduleId?: string; // 일정과 연결
  date: Date;
  playerA1: Player;
  playerA2: Player;
  playerB1: Player;
  playerB2: Player;
  sets: Set[];
  result: 'teamA' | 'teamB' | 'draw'; // 승/패/무승부
  duration: number; // in minutes
  status: 'completed';
  notes?: string;
  courtId: string;
  courtName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Set {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
  result: 'teamA' | 'teamB' | 'draw';
  duration?: number; // in minutes
}


export interface MatchFilters {
  dateFrom?: Date;
  dateTo?: Date;
  playerId?: string;
  courtId?: string;
  status?: Match['status'];
}

export interface ScheduleFilters {
  dateFrom?: Date;
  dateTo?: Date;
  playerId?: string;
  status?: Schedule['status'];
}

export interface MatchStats {
  totalMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  averageDuration: number;
  mostActivePlayer: string;
  mostActiveCourt: string;
  winRate: Record<string, number>;
}

export interface ShareData {
  matches: Match[];
  filters: MatchFilters;
  generatedAt: Date;
  shareId: string;
}


