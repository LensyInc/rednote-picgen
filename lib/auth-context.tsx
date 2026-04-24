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
  ensureGuestId,
  clearGuestId,
  getGuestId,
} from "@/lib/auth-client";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  guestId: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
    // 将初始化逻辑推迟到微任务，避免 effect 中同步 setState
    queueMicrotask(async () => {
      await fetchUser();
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
          });
          // 登录成功后合并游客数据
          const currentGuestId = getGuestId();
          if (currentGuestId) {
            await mergeGuestTasks(currentGuestId);
            clearGuestId();
            setGuestId(null);
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
    await signOut();
    setUser(null);
    // 登出后生成新的 guestId，保持游客可用
    const newGuestId = ensureGuestId();
    setGuestId(newGuestId);
  }, []);

  const handleSendOtp = useCallback(async (email: string) => {
    return await sendOtp(email);
  }, []);

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
