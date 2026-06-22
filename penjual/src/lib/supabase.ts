import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN ANON KEY SUPABASE ANDA
const supabaseUrl = 'https://qqjqixwlfkygehwvwvsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
