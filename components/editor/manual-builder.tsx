"use client";

import React from "react";
import { NoteDocument } from "@/core/schema/note.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmptySlide } from "./card-type-meta";

interface ManualBuilderProps {
  document: NoteDocument;
  onDocumentChange: (next: NoteDocument) => void;
}

function newTaskId(): string {
  return crypto.randomUUID();
}

export function ManualBuilder({ document, onDocumentChange }: ManualBuilderProps) {
  const [confirmNew, setConfirmNew] = React.useState(false);

  function updateMeta<K extends keyof NoteDocument["meta"]>(
    key: K,
    value: NoteDocument["meta"][K]
  ) {
    onDocumentChange({ ...document, meta: { ...document.meta, [key]: value } });
  }
  function handleNewDocument() {
    setConfirmNew(true);
  }
  function confirmNewDocument() {
    setConfirmNew(false);
    onDocumentChange({
      taskId: newTaskId(),
      version: 1,
      createdAt: new Date().toISOString(),
      meta: {
        topic: "新建图文",
        audience: "",
        tone: "gentle",
        noteType: "summary",
        pageCount: 1,
      },
      theme: {
        template: document.theme.template,
        primaryColor: document.theme.primaryColor,
        secondaryColor: document.theme.secondaryColor,
        backgroundType: document.theme.backgroundType || "solid",
        fontScale: "medium",
      },
      slides: [createEmptySlide("cover", `slide-${Date.now()}`)],
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-semibold">文档信息</Label>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">主题</Label>
          <Input
            value={document.meta.topic}
            onChange={(e) => updateMeta("topic", e.target.value)}
            className="text-sm h-8"
            placeholder="这套图文的主题"
          />
        </div>

      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={handleNewDocument}>
        新建空白文档
      </Button>

      {confirmNew && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 space-y-2">
          <p className="text-xs text-amber-700">新建文档会清空当前已有的所有页面，确认继续？</p>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={confirmNewDocument}>确认</Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmNew(false)}>取消</Button>
          </div>
        </div>
      )}

      <div className="rounded-md border bg-muted/20 p-2.5">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          在预览区顶部可以：「＋ 添加页面」插入卡片、「配色」切换整套模板颜色、「背景」切换画布纹理。右侧「页面」列表里可上移/下移/复制/删除。
        </p>
      </div>
    </div>
  );
}
