/**
 * ADMIN — useApi.ts
 * Data-fetching hooks for the Admin portal.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// useUsers — Real-time user list with Realtime subscription
// ─────────────────────────────────────────────
export function useUsers(role: string) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsersByRole(role);
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();

    // Realtime: when any user is inserted/updated/deleted, refresh list
    const channel = supabase
      .channel(`rt_users_admin_${role}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, fetchUsers]);

  return { users, isLoading, error, mutateUsers: fetchUsers };
}
