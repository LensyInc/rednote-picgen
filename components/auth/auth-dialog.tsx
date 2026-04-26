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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export function AuthDialog() {
  const { showLoginDialog, setShowLoginDialog, sendOtp, verifyOtp } = useAuth();
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState("");
  const [step, setStep] = React.useState<"email" | "otp">("email");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleOpenChange(open: boolean) {
    setShowLoginDialog(open);
    if (!open) {
      requestAnimationFrame(() => {
        setEmail("");
        setToken("");
        setStep("email");
        setError(null);
        setSent(false);
        setCooldown(0);
      });
    }
  }

  async function handleSendOtp() {
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await sendOtp(email.trim());
      if (err) {
        setError(err.message || "发送失败，请稍后重试");
      } else {
        setSent(true);
        setStep("otp");
        setCooldown(60);
      }
    } catch {
      setError("发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(null);
    if (!token.trim() || token.trim().length < 8) {
      setError("请输入 8 位验证码");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await verifyOtp(email.trim(), token.trim());
      if (err) {
        setError(err.message || "验证码无效或已过期");
      }
    } catch {
      setError("验证失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={showLoginDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            邮箱验证码登录
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {step === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="auth-email">邮箱地址</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendOtp();
                }}
              />
              <p className="text-xs text-muted-foreground">
                我们将向您的邮箱发送一次性验证码，无需设置密码。
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="auth-otp">验证码</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="auth-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="12345678"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cooldown > 0}
                  onClick={handleSendOtp}
                >
                  {cooldown > 0 ? `${cooldown}s` : "重新发送"}
                </Button>
              </div>
              {sent && (
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  验证码已发送至 {email}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {step === "email" ? (
            <Button
              className="w-full"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              发送验证码
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              登录
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
