"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEMES } from "@/components/templates/shared/theme";
import { templateEnum } from "@/core/schema/request.schema";
import type { z } from "zod";

type TemplateId = z.infer<typeof templateEnum>;

interface ManualStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (topic: string, template: TemplateId) => void;
}

export function ManualStartDialog({ open, onOpenChange, onStart }: ManualStartDialogProps) {
  const [topic, setTopic] = React.useState("");
  const [template, setTemplate] = React.useState<TemplateId>("template-a");

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setTopic("");
      setTemplate("template-a");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onStart(topic.trim(), template);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>手动搭建</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-sm">主题（选填）</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：好物推荐、旅行日记…"
              className="h-9"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">配色模板</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id as TemplateId)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all ${
                    template === t.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: t.primary, borderColor: t.divider }}
                  />
                  <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">
            开始创建
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
