"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverItem,
} from "@/components/ui/popover";
import { LogOut, User, Zap, Crown, Sparkles } from "lucide-react";
import { UpgradeDialog } from "./upgrade-dialog";

interface CreditInfo {
  balance: number;
  daily_quota: number;
  plan_type: string;
}

export function UserMenu() {
  const { user, isLoggedIn, isLoading, login, logout } = useAuth();
  const [credits, setCredits] = React.useState<CreditInfo | null>(null);
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  React.useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    async function fetchCredits() {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCredits(data);
        }
      } catch {
        // ignore
      }
    }
    fetchCredits();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => setShowUpgrade(true)}>
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          升级
        </Button>
        <Button size="sm" variant="outline" onClick={login}>
          <User className="mr-1.5 h-3.5 w-3.5" />
          登录
        </Button>
        <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
      </div>
    );
  }

  const displayEmail = user?.email?.split("@")[0] ?? "用户";
  const isPro = credits?.plan_type === "pro";

  return (
    <>
      <Popover
        trigger={
          <button className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">
              {displayEmail.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[80px] truncate hidden sm:inline">
              {displayEmail}
            </span>
            {isPro && (
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
          </button>
        }
        contentClassName="w-[220px]"
      >
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPro ? "Pro 会员" : "免费用户"}
          </p>
        </div>

        {credits && (
          <div className="px-3 py-2 border-b">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{credits.balance}</span>
              <span className="text-muted-foreground">/ {credits.daily_quota} 点</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              今日剩余 AI 生成次数
            </p>
          </div>
        )}

        {!isPro && (
          <PopoverItem
            onClick={() => setShowUpgrade(true)}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-amber-600 font-medium">升级 Pro</span>
          </PopoverItem>
        )}

        <PopoverItem
          onClick={() => {
            logout();
          }}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>退出登录</span>
        </PopoverItem>
      </Popover>
      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
