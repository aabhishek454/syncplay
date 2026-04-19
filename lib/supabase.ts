import { createClient } from '@supabase/supabase-js';

// Always initialized to mock string if env doesn't exist for build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
