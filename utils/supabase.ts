import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type Database = {
  public: {
    Tables: {
      plugins: {
        Row: {
          id: string;
          name: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string;
          created_at?: string;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 