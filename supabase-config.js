// Supabase 설정 파일
// 실제 사용 시에는 아래 값들을 Supabase 프로젝트에서 가져온 값으로 교체하세요

const SUPABASE_CONFIG = {
    // Supabase 프로젝트 URL (예: https://your-project-id.supabase.co)
    url: 'https://nqwjvrznwzmfytjlpfsk.supabase.co',
    
    // Supabase anon public key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd2p2cnpud3ptZnl0amxwZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzA4NTEsImV4cCI6MjA3Mzk0Njg1MX0.R3Y2Xb9PmLr3sCLSdJov4Mgk1eAmhaCIPXEKq6u8NQI'
};

// Supabase 클라이언트 초기화
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// 설정 검증 함수
function validateSupabaseConfig() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL_HERE' || 
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        console.error('Supabase 설정이 완료되지 않았습니다. supabase-config.js 파일을 확인하세요.');
        return false;
    }
    return true;
}

// 전역으로 사용할 수 있도록 export
window.supabaseClient = supabase;
window.validateSupabaseConfig = validateSupabaseConfig;

