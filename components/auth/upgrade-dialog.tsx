"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Loader2 } from "lucide-react";

export function UpgradeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleUpgrade() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      const err = await res.json().catch(() => ({}));
      setError(err.error || "暂时无法发起支付，请稍后再试");
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            升级 Pro 会员
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">每日 100 次 AI 生成</p>
                <p className="text-xs text-muted-foreground">
                  免费版每日仅 3 次
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">更多高级功能即将上线</p>
                <p className="text-xs text-muted-foreground">
                  优先体验新模板、批量导出等
                </p>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              请先登录后再升级会员。
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleUpgrade}
            disabled={loading || !isLoggedIn}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Crown className="mr-2 h-4 w-4" />
            )}
            立即升级
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            通过 Stripe 安全支付，支持信用卡和借记卡。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
