/**
 * useRealtimeSync — Universal Supabase Realtime wrapper hook (Penjual)
 * Identical to pembeli version — enables reuse across portals.
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeSyncOptions {
  table: string;
  filter?: string;
  event?: Event;
  channelName?: string;
  enabled?: boolean;
  onPayload: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function useRealtimeSync({
  table,
  filter,
  event = '*',
  channelName,
  enabled = true,
  onPayload,
}: RealtimeSyncOptions) {
  useEffect(() => {
    if (!enabled) return;

    const name = channelName ?? `realtime_${table}_${filter ?? 'all'}_${Date.now()}`;

    const channel = supabase
      .channel(name)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        onPayload
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, event, channelName, enabled]);
}
