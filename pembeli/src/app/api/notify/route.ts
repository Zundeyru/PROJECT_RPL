import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { supabase } from '@/lib/supabase';

webPush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(req: Request) {
  try {
    const { storeId, title, message } = await req.json();

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    // Fetch the store's push_subscription from Supabase
    const { data: store, error } = await supabase
      .from('stores')
      .select('push_subscription')
      .eq('id', storeId)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: 'Store not found or database error' }, { status: 404 });
    }

    if (!store.push_subscription) {
      return NextResponse.json({ message: 'Store has no push subscription' }, { status: 200 });
    }

    let subscription;
    try {
      subscription = typeof store.push_subscription === 'string'
        ? JSON.parse(store.push_subscription)
        : store.push_subscription;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid subscription format' }, { status: 500 });
    }

    const payload = JSON.stringify({
      title: title || 'Notifikasi Baru',
      body: message || 'Ada pembaruan baru',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Logo_UMM_Universitas_Muhammadiyah_Malang.png'
    });

    await webPush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true, message: 'Notification sent' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: 'Failed to send notification', details: error.message }, { status: 500 });
  }
}
