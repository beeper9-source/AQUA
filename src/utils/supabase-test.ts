import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Supabase 연결 테스트 시작...');
    
    // 1. 기본 연결 테스트 - 코트 테이블 먼저 확인 (기본 데이터가 있을 가능성이 높음)
    const { data: courtsData, error: courtsError } = await supabase
      .from('courts')
      .select('*')
      .limit(5);
    
    if (courtsError) {
      console.error('❌ 코트 테이블 접근 오류:', courtsError);
      
      // 테이블이 없을 수 있으므로 생성 시도
      console.log('📝 테이블 생성이 필요할 수 있습니다. Supabase 대시보드에서 스키마를 확인하세요.');
      return { success: false, error: courtsError.message, needsSchema: true };
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('🏟️ 코트 데이터:', courtsData);
    
    // 2. 선수 테이블 확인
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('count', { count: 'exact', head: true });
    
    if (playersError) {
      console.warn('⚠️ 선수 테이블 오류 (정상일 수 있음):', playersError.message);
    } else {
      console.log('👥 선수 테이블 카운트:', playersData);
    }
    
    return { success: true, courts: courtsData, players: playersData };
  } catch (err) {
    console.error('💥 연결 테스트 실패:', err);
    return { success: false, error: err };
  }
};

// 앱 시작 시 자동으로 테스트 실행
testSupabaseConnection();
