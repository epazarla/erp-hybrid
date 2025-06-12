import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for development
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null }, error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ eq: () => ({ data: null, error: null }) }),
    delete: () => ({ eq: () => ({ data: null, error: null }) })
  })
};

// Gerçek Supabase client'ı yerine mock client kullanıyoruz
// Gerçek client için aşağıdaki kodu kullanın ve .env dosyasını yapılandırın:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = mockSupabase as any;
