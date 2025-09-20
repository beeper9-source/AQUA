import { create } from 'zustand';
import { Match, Player, Court, MatchFilters, MatchStats } from '../types/tennis';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/supabase';

interface TennisState {
  // Data
  matches: Match[];
  players: Player[];
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

export const useTennisStore = create<TennisState>((set, get) => ({
  // Initial state
  matches: [],
  players: [],
  courts: [],
  selectedMatch: null,
  filters: {},
  isLoading: false,
  
  // Player actions
  addPlayer: async (playerData) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          name: playerData.name,
          email: playerData.email,
          phone: playerData.phone,
          skill_level: playerData.skillLevel
        })
        .select()
        .single();

      if (error) throw error;

      const player: Player = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        skillLevel: data.skill_level,
        createdAt: new Date(data.created_at)
      };

      set((state) => ({
        players: [...state.players, player],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding player:', error);
      set({ isLoading: false });
    }
  },

  updatePlayer: async (id, updates) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('players')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          skill_level: updates.skillLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedPlayer: Player = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        skillLevel: data.skill_level,
        createdAt: new Date(data.created_at)
      };

      set((state) => ({
        players: state.players.map(p => 
          p.id === id ? updatedPlayer : p
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating player:', error);
      set({ isLoading: false });
    }
  },

  deletePlayer: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        players: state.players.filter(p => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting player:', error);
      set({ isLoading: false });
    }
  },
  
  // Court actions
  addCourt: async (courtData) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('courts')
        .insert({
          name: courtData.name,
          location: courtData.location,
          surface: courtData.surface,
          is_indoor: courtData.isIndoor,
          is_active: courtData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const court: Court = {
        id: data.id,
        name: data.name,
        location: data.location,
        surface: data.surface,
        isIndoor: data.is_indoor,
        isActive: data.is_active
      };

      set((state) => ({
        courts: [...state.courts, court],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding court:', error);
      set({ isLoading: false });
    }
  },

  updateCourt: async (id, updates) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('courts')
        .update({
          name: updates.name,
          location: updates.location,
          surface: updates.surface,
          is_indoor: updates.isIndoor,
          is_active: updates.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCourt: Court = {
        id: data.id,
        name: data.name,
        location: data.location,
        surface: data.surface,
        isIndoor: data.is_indoor,
        isActive: data.is_active
      };

      set((state) => ({
        courts: state.courts.map(c => 
          c.id === id ? updatedCourt : c
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating court:', error);
      set({ isLoading: false });
    }
  },

  deleteCourt: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        courts: state.courts.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting court:', error);
      set({ isLoading: false });
    }
  },

  // Match actions
  addMatch: async (matchData) => {
    set({ isLoading: true });
    try {
      // 1. 경기 데이터 삽입 (개별 선수 기반)
      const { data: matchDataResult, error: matchError } = await supabase
        .from('matches')
        .insert({
          date: matchData.date.toISOString(),
          court_id: matchData.courtId,
          player_a1_id: matchData.playerA1.id,
          player_a2_id: matchData.playerA2.id,
          player_b1_id: matchData.playerB1.id,
          player_b2_id: matchData.playerB2.id,
          winner: matchData.winner,
          duration: matchData.duration,
          status: matchData.status || 'completed',
          notes: matchData.notes
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // 2. 세트 데이터 삽입
      if (matchData.sets && matchData.sets.length > 0) {
        const setsData = matchData.sets.map(set => ({
          match_id: matchDataResult.id,
          set_number: set.setNumber,
          team_a_score: set.teamAScore,
          team_b_score: set.teamBScore,
          winner: set.winner,
          duration: set.duration
        }));

        const { error: setsError } = await supabase
          .from('sets')
          .insert(setsData);

        if (setsError) throw setsError;
      }

      // 3. 전체 경기 데이터 조회 (관계 포함)
      const { data: fullMatch, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          court:courts(*),
          player_a1:players!matches_player_a1_id_fkey(*),
          player_a2:players!matches_player_a2_id_fkey(*),
          player_b1:players!matches_player_b1_id_fkey(*),
          player_b2:players!matches_player_b2_id_fkey(*),
          sets(*)
        `)
        .eq('id', matchDataResult.id)
        .single();

      if (fetchError) throw fetchError;

      const newMatch: Match = {
        id: fullMatch.id,
        date: new Date(fullMatch.date),
        courtId: fullMatch.court_id,
        courtName: fullMatch.court?.name || '',
        playerA1: fullMatch.player_a1,
        playerA2: fullMatch.player_a2,
        playerB1: fullMatch.player_b1,
        playerB2: fullMatch.player_b2,
        sets: fullMatch.sets.map(set => ({
          setNumber: set.set_number,
          teamAScore: set.team_a_score,
          teamBScore: set.team_b_score,
          winner: set.winner,
          duration: set.duration
        })),
        winner: fullMatch.winner,
        duration: fullMatch.duration,
        status: fullMatch.status,
        notes: fullMatch.notes,
        createdAt: new Date(fullMatch.created_at),
        updatedAt: new Date(fullMatch.updated_at)
      };

      set((state) => ({
        matches: [newMatch, ...state.matches],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding match:', error);
      set({ isLoading: false });
    }
  },

  updateMatch: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updateData: any = {};
      
      if (updates.date) updateData.date = updates.date.toISOString();
      if (updates.courtId) updateData.court_id = updates.courtId;
      if (updates.playerA1) updateData.player_a1_id = updates.playerA1.id;
      if (updates.playerA2) updateData.player_a2_id = updates.playerA2.id;
      if (updates.playerB1) updateData.player_b1_id = updates.playerB1.id;
      if (updates.playerB2) updateData.player_b2_id = updates.playerB2.id;
      if (updates.winner) updateData.winner = updates.winner;
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.status) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        matches: state.matches.map(m => 
          m.id === id ? { ...m, ...updates } : m
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating match:', error);
      set({ isLoading: false });
    }
  },

  deleteMatch: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        matches: state.matches.filter(m => m.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting match:', error);
      set({ isLoading: false });
    }
  },

  setSelectedMatch: (match) => set({ selectedMatch: match }),

  // Filter actions
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  
  // Data loading actions
  loadAllData: async () => {
    set({ isLoading: true });
    try {
      console.log('🚀 Supabase 데이터 로딩 시작...');
      
      // 연결 테스트 먼저 수행
      const { data: testData, error: testError } = await supabase
        .from('courts')
        .select('count', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Supabase 연결 실패:', testError);
        throw new Error(`Supabase 연결 오류: ${testError.message}`);
      }
      
      console.log('✅ Supabase 연결 확인됨');
      
      // 먼저 기본 데이터부터 로드 (코트, 선수)
      const [playersResult, courtsResult] = await Promise.all([
        supabase.from('players').select('*').order('created_at', { ascending: false }),
        supabase.from('courts').select('*').order('name')
      ]);

      if (playersResult.error) {
        console.warn('⚠️ 선수 데이터 로드 오류 (계속 진행):', playersResult.error);
      }
      if (courtsResult.error) {
        console.error('❌ 코트 데이터 로드 오류:', courtsResult.error);
        throw courtsResult.error;
      }

      console.log('📊 기본 데이터 로드 완료:', { 
        players: playersResult.data?.length || 0, 
        courts: courtsResult.data?.length || 0 
      });

      // 선수가 있을 때만 경기 데이터 로드
      let matchesResult = { data: [], error: null };

      if (playersResult.data && playersResult.data.length > 0) {
        console.log('👥 선수 데이터가 있으므로 경기 데이터 로드 시작...');
        
        matchesResult = await supabase
          .from('matches')
          .select(`
            *,
            court:courts(*),
            player_a1:players!matches_player_a1_id_fkey(*),
            player_a2:players!matches_player_a2_id_fkey(*),
            player_b1:players!matches_player_b1_id_fkey(*),
            player_b2:players!matches_player_b2_id_fkey(*),
            sets(*)
          `)
          .order('date', { ascending: false });

        if (matchesResult.error) {
          console.warn('⚠️ 경기 데이터 로드 오류 (계속 진행):', matchesResult.error);
        }
      } else {
        console.log('👤 선수 데이터가 없으므로 경기 데이터는 로드하지 않음');
      }

      // 데이터 변환 (안전하게)
      const players: Player[] = (playersResult.data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        skillLevel: p.skill_level,
        createdAt: new Date(p.created_at)
      }));

      const courts: Court[] = (courtsResult.data || []).map(c => ({
        id: c.id,
        name: c.name,
        location: c.location,
        surface: c.surface,
        isIndoor: c.is_indoor,
        isActive: c.is_active
      }));

      const matches: Match[] = (matchesResult.data || []).map(m => ({
        id: m.id,
        date: new Date(m.date),
        courtId: m.court_id,
        courtName: m.court?.name || '',
        playerA1: m.player_a1,
        playerA2: m.player_a2,
        playerB1: m.player_b1,
        playerB2: m.player_b2,
        sets: (m.sets || []).map(set => ({
          setNumber: set.set_number,
          teamAScore: set.team_a_score,
          teamBScore: set.team_b_score,
          winner: set.winner,
          duration: set.duration
        })),
        winner: m.winner,
        duration: m.duration,
        status: m.status,
        notes: m.notes,
        createdAt: new Date(m.created_at),
        updatedAt: new Date(m.updated_at)
      }));

      console.log('데이터 로드 완료:', {
        players: players.length,
        courts: courts.length,
        matches: matches.length
      });

      set({
        players,
        courts,
        matches,
        isLoading: false
      });

    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error);
      
      // 기본 데이터라도 설정
      set({
        players: [],
        courts: [
          {
            id: 'default-court-1',
            name: '코트 1',
            surface: 'hard',
            isIndoor: false,
            isActive: true
          },
          {
            id: 'default-court-2',
            name: '코트 2',
            surface: 'hard',
            isIndoor: false,
            isActive: true
          }
        ],
        matches: [],
        isLoading: false
      });
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),

  // Computed values
  getFilteredMatches: () => {
    const { matches, filters } = get();
    return matches.filter(match => {
      if (filters.dateFrom && match.date < filters.dateFrom) return false;
      if (filters.dateTo && match.date > filters.dateTo) return false;
      if (filters.courtId && match.courtId !== filters.courtId) return false;
      if (filters.playerId) {
        const playerInMatch = match.playerA1.id === filters.playerId ||
                             match.playerA2.id === filters.playerId ||
                             match.playerB1.id === filters.playerId ||
                             match.playerB2.id === filters.playerId;
        if (!playerInMatch) return false;
      }
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
}));

// Helper function import
import { calculateMatchStats } from '../utils/helpers';
