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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditInfo {
  balance: number;
  daily_quota: number;
  plan_type: string;
}

export function UserMenu() {
  const { user, isLoggedIn, isLoading, login, logout, updateDisplayName } = useAuth();
  const [credits, setCredits] = React.useState<CreditInfo | null>(null);
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [showNameEditor, setShowNameEditor] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState("");
  const [savingName, setSavingName] = React.useState(false);

  React.useEffect(() => {
    if (!isLoggedIn) {
      setCredits(null); // eslint-disable-line react-hooks/set-state-in-effect -- must clear on logout
      return;
    }
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

  const displayName = user?.displayName || user?.email?.split("@")[0] || "用户";
  const isPro = credits?.plan_type === "pro";

  return (
    <>
      <Popover
        align="end"
        trigger={
          <button className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
            <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[80px] truncate hidden sm:inline">
              {displayName}
            </span>
            {isPro && (
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
          </button>
        }
        contentClassName="w-[240px]"
      >
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium truncate">
            {user?.displayName || user?.email?.split("@")[0]}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.email}
          </p>
          <p className="text-xs text-muted-foreground">
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
            setNameDraft(user?.displayName || "");
            setShowNameEditor(true);
          }}
        >
          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>修改用户名</span>
        </PopoverItem>

        <PopoverItem
          onClick={() => {
            logout();
          }}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>退出登录</span>
        </PopoverItem>
      </Popover>

      <Dialog open={showNameEditor} onOpenChange={setShowNameEditor}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>修改用户名</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="name-input">显示名称</Label>
            <Input
              id="name-input"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="输入新的用户名"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const btn = document.getElementById("save-name-btn");
                  btn?.click();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameEditor(false)}>
              取消
            </Button>
            <Button
              id="save-name-btn"
              disabled={savingName || !nameDraft.trim()}
              onClick={async () => {
                const trimmed = nameDraft.trim();
                if (!trimmed) return;
                setSavingName(true);
                await updateDisplayName(trimmed);
                setSavingName(false);
                setShowNameEditor(false);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
