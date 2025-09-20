import { createClient } from '@supabase/supabase-js';

// Supabase 설정 - 실제 값은 supabase-config.js에서 가져옴
declare global {
  interface Window {
    supabaseClient: any;
    validateSupabaseConfig: () => boolean;
  }
}

// Supabase 클라이언트 초기화 - 실제 프로젝트 정보 사용
export const supabase = createClient(
  'https://nqwjvrznwzmfytjlpfsk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd2p2cnpud3ptZnl0amxwZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzA4NTEsImV4cCI6MjA3Mzk0Njg1MX0.R3Y2Xb9PmLr3sCLSdJov4Mgk1eAmhaCIPXEKq6u8NQI'
);

// 데이터베이스 테이블 타입 정의
export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          skill_level: 'beginner' | 'intermediate' | 'advanced';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          phone?: string;
          skill_level: 'beginner' | 'intermediate' | 'advanced';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          skill_level?: 'beginner' | 'intermediate' | 'advanced';
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          team_name?: string;
          created_at: string;
          updated_at: string;
          player1?: Database['public']['Tables']['players']['Row'];
          player2?: Database['public']['Tables']['players']['Row'];
        };
        Insert: {
          id?: string;
          player1_id: string;
          player2_id: string;
          team_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player1_id?: string;
          player2_id?: string;
          team_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      courts: {
        Row: {
          id: string;
          name: string;
          location?: string;
          surface: 'hard' | 'clay' | 'grass' | 'synthetic';
          is_indoor: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string;
          surface: 'hard' | 'clay' | 'grass' | 'synthetic';
          is_indoor: boolean;
          is_active: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          surface?: 'hard' | 'clay' | 'grass' | 'synthetic';
          is_indoor?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          date: string;
          court_id: string;
          team_a_id: string;
          team_b_id: string;
          winner: 'teamA' | 'teamB';
          duration: number;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string;
          created_at: string;
          updated_at: string;
          court?: Database['public']['Tables']['courts']['Row'];
          team_a?: Database['public']['Tables']['teams']['Row'];
          team_b?: Database['public']['Tables']['teams']['Row'];
        };
        Insert: {
          id?: string;
          date: string;
          court_id: string;
          team_a_id: string;
          team_b_id: string;
          winner: 'teamA' | 'teamB';
          duration: number;
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          court_id?: string;
          team_a_id?: string;
          team_b_id?: string;
          winner?: 'teamA' | 'teamB';
          duration?: number;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sets: {
        Row: {
          id: string;
          match_id: string;
          set_number: number;
          team_a_score: number;
          team_b_score: number;
          winner: 'teamA' | 'teamB';
          duration?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          set_number: number;
          team_a_score: number;
          team_b_score: number;
          winner: 'teamA' | 'teamB';
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          set_number?: number;
          team_a_score?: number;
          team_b_score?: number;
          winner?: 'teamA' | 'teamB';
          duration?: number;
          created_at?: string;
        };
      };
    };
  };
}

// 타입 헬퍼
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
