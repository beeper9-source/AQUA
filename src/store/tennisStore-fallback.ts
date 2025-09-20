import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Match, Player, Team, Court, MatchFilters, MatchStats } from '../types/tennis';
import { calculateMatchStats } from '../utils/helpers';

interface TennisState {
  // Data
  matches: Match[];
  players: Player[];
  teams: Team[];
  courts: Court[];
  
  // UI State
  selectedMatch: Match | null;
  filters: MatchFilters;
  isLoading: boolean;
  
  // Actions - Data Loading
  loadAllData: () => Promise<void>;
  
  // Actions - Players
  addPlayer: (player: Omit<Player, 'id' | 'createdAt'>) => Promise<void>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  
  // Actions - Teams
  createTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Promise<void>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  
  // Actions - Courts
  addCourt: (court: Omit<Court, 'id'>) => Promise<void>;
  updateCourt: (id: string, updates: Partial<Court>) => Promise<void>;
  deleteCourt: (id: string) => Promise<void>;
  
  // Actions - Matches
  addMatch: (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMatch: (id: string, updates: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  setSelectedMatch: (match: Match | null) => void;
  
  // Actions - Filters
  setFilters: (filters: MatchFilters) => void;
  clearFilters: () => void;
  
  // Actions - UI
  setIsLoading: (loading: boolean) => void;
  
  // Computed
  getFilteredMatches: () => Match[];
  getMatchStats: () => MatchStats;
  getPlayersBySkillLevel: (level: Player['skillLevel']) => Player[];
  getActiveCourts: () => Court[];
}

// 임시 로컬스토리지 버전 (Supabase 연결 문제 시 사용)
export const useTennisStoreFallback = create<TennisState>()(
  persist(
    (set, get) => ({
      // Initial state
      matches: [],
      players: [],
      teams: [],
      courts: [
        {
          id: 'court-1',
          name: '코트 1',
          surface: 'hard',
          isIndoor: false,
          isActive: true
        },
        {
          id: 'court-2',
          name: '코트 2',
          surface: 'hard',
          isIndoor: false,
          isActive: true
        }
      ],
      selectedMatch: null,
      filters: {},
      isLoading: false,
      
      // 기본 액션들 (동기식)
      loadAllData: async () => {
        console.log('로컬스토리지에서 데이터 로드');
        set({ isLoading: false });
      },
      
      addPlayer: async (playerData) => {
        const player: Player = {
          ...playerData,
          id: `player-${Date.now()}`,
          createdAt: new Date()
        };
        set((state) => ({
          players: [...state.players, player]
        }));
      },
      
      updatePlayer: async (id, updates) => {
        set((state) => ({
          players: state.players.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },
      
      deletePlayer: async (id) => {
        set((state) => ({
          players: state.players.filter(p => p.id !== id),
          teams: state.teams.filter(t => 
            t.player1.id !== id && t.player2.id !== id
          )
        }));
      },
      
      createTeam: async (teamData) => {
        const team: Team = {
          ...teamData,
          id: `team-${Date.now()}`,
          createdAt: new Date()
        };
        set((state) => ({
          teams: [...state.teams, team]
        }));
      },
      
      updateTeam: async (id, updates) => {
        set((state) => ({
          teams: state.teams.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        }));
      },
      
      deleteTeam: async (id) => {
        set((state) => ({
          teams: state.teams.filter(t => t.id !== id),
          matches: state.matches.filter(m => 
            m.teamA.id !== id && m.teamB.id !== id
          )
        }));
      },
      
      addCourt: async (courtData) => {
        const court: Court = {
          ...courtData,
          id: `court-${Date.now()}`
        };
        set((state) => ({
          courts: [...state.courts, court]
        }));
      },
      
      updateCourt: async (id, updates) => {
        set((state) => ({
          courts: state.courts.map(c => 
            c.id === id ? { ...c, ...updates } : c
          )
        }));
      },
      
      deleteCourt: async (id) => {
        set((state) => ({
          courts: state.courts.filter(c => c.id !== id)
        }));
      },
      
      addMatch: async (matchData) => {
        const match: Match = {
          ...matchData,
          id: `match-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        set((state) => ({
          matches: [...state.matches, match]
        }));
      },
      
      updateMatch: async (id, updates) => {
        set((state) => ({
          matches: state.matches.map(m => 
            m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
          )
        }));
      },
      
      deleteMatch: async (id) => {
        set((state) => ({
          matches: state.matches.filter(m => m.id !== id),
          selectedMatch: state.selectedMatch?.id === id ? null : state.selectedMatch
        }));
      },
      
      setSelectedMatch: (match) => set({ selectedMatch: match }),
      setFilters: (filters) => set({ filters }),
      clearFilters: () => set({ filters: {} }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      getFilteredMatches: () => {
        const { matches, filters } = get();
        return matches.filter(match => {
          if (filters.dateFrom && match.date < filters.dateFrom) return false;
          if (filters.dateTo && match.date > filters.dateTo) return false;
          if (filters.courtId && match.courtId !== filters.courtId) return false;
          if (filters.playerId) {
            const playerInMatch = match.teamA.player1.id === filters.playerId ||
                                 match.teamA.player2.id === filters.playerId ||
                                 match.teamB.player1.id === filters.playerId ||
                                 match.teamB.player2.id === filters.playerId;
            if (!playerInMatch) return false;
          }
          if (filters.teamId && match.teamA.id !== filters.teamId && match.teamB.id !== filters.teamId) return false;
          if (filters.status && match.status !== filters.status) return false;
          return true;
        });
      },
      
      getMatchStats: () => {
        const { matches } = get();
        return calculateMatchStats(matches);
      },
      
      getPlayersBySkillLevel: (level) => {
        const { players } = get();
        return players.filter(p => p.skillLevel === level);
      },
      
      getActiveCourts: () => {
        const { courts } = get();
        return courts.filter(c => c.isActive);
      }
    }),
    {
      name: 'tennis-store-fallback'
    }
  )
);
