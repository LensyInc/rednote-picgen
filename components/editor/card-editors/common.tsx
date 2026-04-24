"use client";

import React from "react";
import { Slide } from "@/core/schema/note.schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

export interface CardEditorProps {
  slide: Slide;
  onChange: (next: Slide) => void;
  maxBullets?: number;
}

let _bulletCounter = 0;
function nextBulletId() {
  return `item-${++_bulletCounter}`;
}

function useStableItems(texts: string[]) {
  const [items, setItems] = React.useState<{ id: string; text: string }[]>(() =>
    texts.map((text) => ({ id: nextBulletId(), text }))
  );

  // 使用 setTimeout 延迟同步，避免在 effect 体内直接同步 setState
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setItems((prev) => {
        if (prev.length === texts.length && prev.every((p, i) => p.text === texts[i])) {
          return prev;
        }
        const next: { id: string; text: string }[] = [];
        const used = new Set<string>();
        for (const text of texts) {
          const existing = prev.find((p) => p.text === text && !used.has(p.id));
          if (existing) {
            used.add(existing.id);
            next.push(existing);
          } else {
            next.push({ id: nextBulletId(), text });
          }
        }
        return next;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [texts]);

  return [items, setItems] as const;
}

export function TitleField({
  slide,
  onChange,
  label = "标题",
  placeholder,
}: CardEditorProps & { label?: string; placeholder?: string }) {
  const id = React.useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        value={slide.title}
        onChange={(e) => onChange({ ...slide, title: e.target.value })}
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  );
}

export function SubtitleField({
  slide,
  onChange,
  label = "副标题",
  placeholder = "可选",
}: CardEditorProps & { label?: string; placeholder?: string }) {
  const id = React.useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        value={slide.subtitle || ""}
        onChange={(e) =>
          onChange({ ...slide, subtitle: e.target.value || undefined })
        }
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  );
}

export function HighlightField({
  slide,
  onChange,
  label = "底部高亮语句",
  placeholder = "可选，一句总结或结论",
}: CardEditorProps & { label?: string; placeholder?: string }) {
  const id = React.useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Textarea
        id={id}
        value={slide.highlight || ""}
        onChange={(e) =>
          onChange({ ...slide, highlight: e.target.value || undefined })
        }
        placeholder={placeholder}
        className="min-h-[50px] resize-none text-sm"
      />
    </div>
  );
}

interface BulletFieldProps extends CardEditorProps {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function BulletListField({
  slide,
  onChange,
  label = "内容列表",
  placeholder,
  multiline = true,
  maxBullets = 8,
}: BulletFieldProps) {
  const [items, setItems] = useStableItems(slide.bullets);

  function sync(nextItems: { id: string; text: string }[]) {
    setItems(nextItems);
    onChange({ ...slide, bullets: nextItems.map((i) => i.text) });
  }
  function update(index: number, value: string) {
    const next = [...items];
    next[index] = { ...next[index], text: value };
    sync(next);
  }
  function add() {
    if (items.length >= maxBullets) return;
    const next = [...items, { id: nextBulletId(), text: "" }];
    sync(next);
  }
  function remove(index: number) {
    sync(items.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    sync(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          {label} ({items.length}/{maxBullets})
        </Label>
        {items.length < maxBullets && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={add}>
            <Plus className="mr-1 h-3 w-3" />
            添加
          </Button>
        )}
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">还没有内容，点「添加」加一条。</p>
      )}
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-1.5">
          <span className="mt-2 shrink-0 text-xs text-muted-foreground w-5 text-right tabular-nums">
            {index + 1}
          </span>
          {multiline ? (
            <Textarea
              value={item.text}
              placeholder={placeholder}
              onChange={(e) => update(index, e.target.value)}
              className="min-h-[56px] resize-none text-sm"
            />
          ) : (
            <Input
              value={item.text}
              placeholder={placeholder}
              onChange={(e) => update(index, e.target.value)}
              className="text-sm"
            />
          )}
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-6 p-0"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              title="上移"
              aria-label="上移"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-6 p-0"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
              title="下移"
              aria-label="下移"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-1.5 shrink-0"
            onClick={() => remove(index)}
            aria-label="删除"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  );
}

/** 将一组结构化字段序列化成 "A｜B" 的 bullet 字符串，A 为空则省略分隔符 */
export function joinBullet(a: string, b: string, sep: string): string {
  if (!a.trim() && !b.trim()) return "";
  if (!a.trim()) return b.trim();
  if (!b.trim()) return a.trim();
  return `${a.trim()}${sep}${b.trim()}`;
}

/** 将 "A？B" 或 "A：B" 拆分成两段；没有分隔符则整体当作 b */
export function splitBullet(text: string, separators: string[]): { a: string; b: string } {
  for (const sep of separators) {
    const idx = text.indexOf(sep);
    if (idx >= 0) {
      const keepSep = sep === "？" || sep === "?";
      const a = text.slice(0, idx + (keepSep ? 1 : 0)).trim();
      const b = text.slice(idx + (keepSep ? 1 : sep.length)).trim();
      if (a) return { a, b };
    }
  }
  return { a: "", b: text };
}

export function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-muted-foreground leading-relaxed">
      💡 {children}
    </p>
  );
}
