/**
 * useRealtimeSync — Universal Supabase Realtime wrapper hook
 *
 * Subscribes to postgres_changes on a given table with an optional filter.
 * Calls the provided `onPayload` callback whenever an INSERT/UPDATE/DELETE fires.
 * Automatically cleans up the WebSocket channel on unmount to prevent memory leaks.
 *
 * Usage:
 *   useRealtimeSync('orders', `buyer_id=eq.${userId}`, (payload) => refetch())
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeSyncOptions {
  /** The Supabase table to subscribe to */
  table: string;
  /** Optional PostgREST filter string e.g. "store_id=eq.S1" */
  filter?: string;
  /** Which events to listen to. Defaults to '*' */
  event?: Event;
  /** Unique channel name. Defaults to `realtime_${table}` */
  channelName?: string;
  /** Whether the subscription should be active. Defaults to true */
  enabled?: boolean;
  /** Callback fired on every change */
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
