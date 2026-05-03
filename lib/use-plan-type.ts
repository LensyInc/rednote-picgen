"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function usePlanType(): { isPro: boolean; isLoading: boolean } {
  const { isLoggedIn } = useAuth();
  const [planType, setPlanType] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    let cancelled = false;
    fetch("/api/user/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setPlanType(data?.plan_type ?? null);
      })
      .catch(() => {
        if (!cancelled) setPlanType(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return {
    isPro: isLoggedIn && planType === "pro",
    isLoading: isLoggedIn && planType === undefined,
  };
}
