import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error reading orders:", error);
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}
