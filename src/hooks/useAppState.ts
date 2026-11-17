import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AppState } from '../types/cineverse';

const initialState: AppState = { watchlist: [], favorites: [], watched: [], profile: { name: 'Harper Quinn', location: 'Night film, long takes, and anything shot on 35mm.' } };

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const local = window.localStorage.getItem('cineverse-state');
    if (local) {
      try {
        setState(JSON.parse(local) as AppState);
      } catch {
        window.localStorage.removeItem('cineverse-state');
      }
    }

    if (!supabase) {
      setReady(true);
      return;
    }

    void (async () => {
      try {
        const { data } = await supabase.from('cineverse_state').select('watchlist, favorites, watched, profile').eq('id', 'default').maybeSingle();
        if (data) {
          const remoteState = data as AppState;
          setState(remoteState);
          window.localStorage.setItem('cineverse-state', JSON.stringify(remoteState));
        }
      } catch {
        // The local archive remains available when Supabase is offline.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const save = useCallback(async (next: AppState) => {
    setState(next);
    window.localStorage.setItem('cineverse-state', JSON.stringify(next));
    if (supabase) {
      try {
        await supabase.from('cineverse_state').upsert({ id: 'default', ...next, updated_at: new Date().toISOString() });
      } catch {
        // Local persistence is the reliable fallback when the remote store is unavailable.
      }
    }
  }, []);

  const toggle = useCallback((key: 'watchlist' | 'favorites' | 'watched', id: number) => {
    const nextValues = state[key].includes(id) ? state[key].filter((item) => item !== id) : [...state[key], id];
    void save({ ...state, [key]: nextValues });
  }, [save, state]);

  const updateProfile = useCallback((profile: AppState['profile']) => void save({ ...state, profile }), [save, state]);
  return { state, ready, toggle, updateProfile };
}
