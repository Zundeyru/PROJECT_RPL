const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qqjqixwlfkygehwvwvsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxanFpeHdsZmt5Z2Vod3Z3dnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjQ3MjEsImV4cCI6MjA5NzY0MDcyMX0.aBJtUDGdbFnO852Xos_Aq22yR6VweMuBXBE29xbT7AI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
  const toInsert = { 
    id: `MNU-${Date.now()}`,
    name: "Test Menu",
    price: 10000,
    category: "Makanan",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
    storeid: "S-1782080100532",
    isavailable: true
  };
  
  const { data, error } = await supabase.from('menus').insert([toInsert]).select();
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("SUCCESS:", data);
  }
}

testInsert();
