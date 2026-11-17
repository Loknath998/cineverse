/**
 * Email + password authentication (Supabase Auth) — no OAuth, no magic
 * links, kept deliberately simple. See supabase/schema.sql + README.md for
 * the backend setup this expects.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase, SUPABASE_CONFIGURED, warnIfUnconfigured } from "./supabase";

type AuthResult = { error: string | null; needsEmailConfirmation?: boolean };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  /** Whether Supabase credentials are present. When false, auth UI stays disabled and the app runs local-only. */
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(SUPABASE_CONFIGURED);

  useEffect(() => {
    if (!supabase) {
      warnIfUnconfigured();
      setLoading(false);
      return;
    }

    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: "Account sync isn't configured for this deployment yet." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { error: "Account sync isn't configured for this deployment yet." };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // With "Confirm email" enabled in Supabase, signUp succeeds but returns
    // no active session until the user clicks the confirmation link.
    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, configured: SUPABASE_CONFIGURED, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
