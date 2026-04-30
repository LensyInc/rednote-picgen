"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function usePlanType(): { isPro: boolean; isLoading: boolean } {
  const { isLoggedIn } = useAuth();
  const [planType, setPlanType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setPlanType(null);
      return;
    }
    setIsLoading(true);
    fetch("/api/user/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.plan_type) setPlanType(data.plan_type);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isLoggedIn]);

  return { isPro: planType === "pro", isLoading };
}
