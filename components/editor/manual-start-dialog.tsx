"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManualStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (projectName: string) => void;
}

export function ManualStartDialog({ open, onOpenChange, onStart }: ManualStartDialogProps) {
  const [projectName, setProjectName] = React.useState("");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setProjectName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) return;
    onStart(projectName.trim());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>手动搭建</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-sm">项目名称</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="例如：好物推荐、旅行日记…"
              className="h-9"
              autoFocus
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">模板可以后续选择、修改</p>
          <Button type="submit" className="w-full" disabled={!projectName.trim()}>
            开始创建
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
