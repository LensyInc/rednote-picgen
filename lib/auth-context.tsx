"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  sendOtp,
  verifyOtp,
  signOut,
  getCurrentUser,
  mergeGuestTasks,
  updateUserDisplayName,
  ensureGuestId,
  clearGuestId,
  getGuestId,
} from "@/lib/auth-client";

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  guestId: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error: Error | null }>;
  showLoginDialog: boolean;
  setShowLoginDialog: (v: boolean) => void;
  sendOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(() => getGuestId());

  const supabase = useMemo(() => createClient(), []);

  const fetchUser = useCallback(async () => {
    const u = await getCurrentUser();
    setUser(u);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must set loading state on init
    fetchUser()
      .then(() => setIsLoading(false))
      .catch((e) => {
        console.error("[auth] fetchUser failed:", e);
        setIsLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            displayName: session.user.user_metadata?.display_name as string | undefined,
          });
          // 登录成功后合并游客数据
          const currentGuestId = getGuestId();
          if (currentGuestId) {
            const ok = await mergeGuestTasks(currentGuestId);
            if (ok) {
              clearGuestId();
              setGuestId(null);
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchUser, supabase]);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // 即使 signOut 失败，也要清除本地状态
    }
    setUser(null);
    // 登出后生成新的 guestId，保持游客可用
    const newGuestId = ensureGuestId();
    setGuestId(newGuestId);
  }, []);

  const handleSendOtp = useCallback(async (email: string) => {
    return await sendOtp(email);
  }, []);

  const handleUpdateDisplayName = useCallback(async (name: string) => {
    const { error } = await updateUserDisplayName(name);
    if (!error) {
      await fetchUser();
    }
    return { error };
  }, [fetchUser]);

  const handleVerifyOtp = useCallback(async (email: string, token: string) => {
    const { error } = await verifyOtp(email, token);
    if (!error) {
      await fetchUser();
      setShowLoginDialog(false);
    }
    return { error };
  }, [fetchUser]);

  const value: AuthContextValue = {
    user,
    guestId,
    isLoading,
    isLoggedIn: !!user,
    login: () => setShowLoginDialog(true),
    logout,
    refreshUser: fetchUser,
    updateDisplayName: handleUpdateDisplayName,
    showLoginDialog,
    setShowLoginDialog,
    sendOtp: handleSendOtp,
    verifyOtp: handleVerifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
