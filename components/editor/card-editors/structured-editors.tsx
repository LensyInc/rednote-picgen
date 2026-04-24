"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { CardEditorProps, Hint, joinBullet, splitBullet } from "./common";

let _pairCounter = 0;
function nextPairId() {
  return `pair-${++_pairCounter}`;
}

function useStablePairs(bullets: string[], separators: string[]) {
  const [pairs, setPairs] = React.useState(() =>
    bullets.map((b) => ({
      id: nextPairId(),
      ...splitBullet(b, separators),
    }))
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPairs((prev) => {
        const parsed = bullets.map((b) => splitBullet(b, separators));
        if (
          prev.length === parsed.length &&
          prev.every((p, i) => p.a === parsed[i].a && p.b === parsed[i].b)
        ) {
          return prev;
        }
        return parsed.map((p, i) => ({
          id: prev[i]?.a === p.a && prev[i]?.b === p.b ? prev[i].id : nextPairId(),
          ...p,
        }));
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [bullets, separators]);

  return [pairs, setPairs] as const;
}

/** FAQ 编辑器：每条 bullet 是一组问答（序列化为 "问？答"） */
export function FaqPairsEditor({ slide, onChange, maxBullets = 8 }: CardEditorProps) {
  const [pairs, setPairs] = useStablePairs(slide.bullets, ["？", "?"]);

  function commit(next: { id: string; a: string; b: string }[]) {
    setPairs(next);
    const bullets = next.map((p) => {
      const q = p.a.trim();
      const a = p.b.trim();
      if (!q && !a) return "";
      if (!q) return a;
      // 确保问题以 "?" 或 "？" 结尾
      const qNormalized = /[？?]$/.test(q) ? q : `${q}？`;
      if (!a) return qNormalized;
      return `${qNormalized}${a}`;
    });
    onChange({ ...slide, bullets });
  }

  function updateQ(i: number, v: string) {
    const next = [...pairs];
    next[i] = { ...next[i], a: v };
    commit(next);
  }
  function updateA(i: number, v: string) {
    const next = [...pairs];
    next[i] = { ...next[i], b: v };
    commit(next);
  }
  function add() {
    if (pairs.length >= maxBullets) return;
    commit([...pairs, { id: nextPairId(), a: "", b: "" }]);
  }
  function remove(i: number) {
    commit(pairs.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= pairs.length) return;
    const next = [...pairs];
    [next[i], next[t]] = [next[t], next[i]];
    commit(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          问答对 ({pairs.length}/{maxBullets})
        </Label>
        {pairs.length < maxBullets && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={add}>
            <Plus className="mr-1 h-3 w-3" />
            添加
          </Button>
        )}
      </div>
      <Hint>问号结尾的问题 + 紧接的答案会在卡片里自动分成 Q / A 两块。</Hint>
      {pairs.map((p, i) => (
        <div key={p.id} className="rounded-md border bg-muted/20 p-2 space-y-1.5">
          <div className="flex items-start gap-1.5">
            <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              Q
            </span>
            <Input
              value={p.a}
              onChange={(e) => updateQ(i, e.target.value)}
              placeholder="问题"
              className="text-sm h-8"
            />
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-5 p-0"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label="上移"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-5 p-0"
                disabled={i === pairs.length - 1}
                onClick={() => move(i, 1)}
                aria-label="下移"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={() => remove(i)}
              aria-label="删除"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              A
            </span>
            <Textarea
              value={p.b}
              onChange={(e) => updateA(i, e.target.value)}
              placeholder="答案"
              className="min-h-[50px] resize-none text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stats 编辑器：每条 bullet 是一个 "数值：标签" */
export function StatsPairsEditor({ slide, onChange, maxBullets = 8 }: CardEditorProps) {
  const [pairs, setPairs] = useStablePairs(slide.bullets, ["：", ":", "—", "--"]);

  function commit(next: { id: string; a: string; b: string }[]) {
    setPairs(next);
    const bullets = next.map((p) => joinBullet(p.a, p.b, "："));
    onChange({ ...slide, bullets });
  }
  function updateValue(i: number, v: string) {
    const next = [...pairs];
    next[i] = { ...next[i], a: v };
    commit(next);
  }
  function updateLabel(i: number, v: string) {
    const next = [...pairs];
    next[i] = { ...next[i], b: v };
    commit(next);
  }
  function add() {
    if (pairs.length >= maxBullets) return;
    commit([...pairs, { id: nextPairId(), a: "", b: "" }]);
  }
  function remove(i: number) {
    commit(pairs.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">
          数据项 ({pairs.length}/{maxBullets})
        </Label>
        {pairs.length < maxBullets && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={add}>
            <Plus className="mr-1 h-3 w-3" />
            添加
          </Button>
        )}
      </div>
      <Hint>数值显示为大字，右侧标签作为说明。例如 数值「83%」+ 标签「用户满意度」。</Hint>
      {pairs.map((p, i) => (
        <div key={p.id} className="flex gap-1.5 items-start">
          <Input
            value={p.a}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder="数值"
            className="text-sm h-8 w-24 shrink-0 font-semibold"
          />
          <Input
            value={p.b}
            onChange={(e) => updateLabel(i, e.target.value)}
            placeholder="标签说明"
            className="text-sm h-8"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={() => remove(i)}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  );
}

let _colCounter = 0;
function nextColId() {
  return `col-${++_colCounter}`;
}

function useStableIdList(texts: string[]) {
  const [items, setItems] = React.useState<{ id: string; text: string }[]>(() =>
    texts.map((text) => ({ id: nextColId(), text }))
  );

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
            next.push({ id: nextColId(), text });
          }
        }
        return next;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [texts]);

  return [items, setItems] as const;
}

/** Comparison 编辑器：前一半 / 后一半 + 两栏自定义表头 + 样式切换（对错 / AB 对照） */
export function ComparisonColumnsEditor({ slide, onChange, maxBullets = 8 }: CardEditorProps) {
  const mid = Math.ceil(slide.bullets.length / 2);
  const leftRaw = slide.bullets.slice(0, mid);
  const rightRaw = slide.bullets.slice(mid);
  const halfMax = Math.floor(maxBullets / 2);

  const [leftItems, setLeftItems] = useStableIdList(leftRaw);
  const [rightItems, setRightItems] = useStableIdList(rightRaw);

  const leftLabel = slide.labelLeft ?? "";
  const rightLabel = slide.labelRight ?? "";
  const style = slide.comparisonStyle || "good-bad";
  const isAB = style === "ab";

  const defaultLeft = isAB ? "方案 A" : "推荐方案";
  const defaultRight = isAB ? "方案 B" : "需留意";

  function commit(newLeft: { id: string; text: string }[], newRight: { id: string; text: string }[]) {
    setLeftItems(newLeft);
    setRightItems(newRight);
    onChange({ ...slide, bullets: [...newLeft.map((i) => i.text), ...newRight.map((i) => i.text)] });
  }
  function updateLabel(side: "L" | "R", v: string) {
    if (side === "L") {
      onChange({ ...slide, labelLeft: v || undefined });
    } else {
      onChange({ ...slide, labelRight: v || undefined });
    }
  }
  function setStyle(next: "good-bad" | "ab") {
    onChange({ ...slide, comparisonStyle: next });
  }
  function update(side: "L" | "R", i: number, v: string) {
    if (side === "L") {
      const next = [...leftItems];
      next[i] = { ...next[i], text: v };
      commit(next, rightItems);
    } else {
      const next = [...rightItems];
      next[i] = { ...next[i], text: v };
      commit(leftItems, next);
    }
  }
  function add(side: "L" | "R") {
    if (side === "L" && leftItems.length < halfMax) {
      commit([...leftItems, { id: nextColId(), text: "" }], rightItems);
    }
    if (side === "R" && rightItems.length < halfMax) {
      commit(leftItems, [...rightItems, { id: nextColId(), text: "" }]);
    }
  }
  function remove(side: "L" | "R", i: number) {
    if (side === "L") commit(leftItems.filter((_, idx) => idx !== i), rightItems);
    else commit(leftItems, rightItems.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">样式</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setStyle("good-bad")}
            aria-pressed={!isAB}
            className={`flex items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors ${
              !isAB
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-0.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                ✓
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground text-[10px] font-bold text-background">
                ✕
              </span>
            </span>
            <span>对错</span>
          </button>
          <button
            type="button"
            onClick={() => setStyle("ab")}
            aria-pressed={isAB}
            className={`flex items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors ${
              isAB
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-0.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                A
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary text-[10px] font-bold text-primary">
                B
              </span>
            </span>
            <span>AB 对照</span>
          </button>
        </div>
      </div>

      <Hint>
        {isAB
          ? "AB 对照：左右两栏视觉权重相近，用 A / B 圆形标志区分。"
          : "对错：左栏用 ✓ 强调推荐项，右栏用 ✕ 作为反例。"}
        两栏表头文字可自定义（留空则使用默认）。
      </Hint>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">左栏表头</Label>
          <Input
            value={leftLabel}
            placeholder={defaultLeft}
            onChange={(e) => updateLabel("L", e.target.value)}
            className="text-sm h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">右栏表头</Label>
          <Input
            value={rightLabel}
            placeholder={defaultRight}
            onChange={(e) => updateLabel("R", e.target.value)}
            className="text-sm h-8"
          />
        </div>
      </div>
      {(["L", "R"] as const).map((side) => {
        const items = side === "L" ? leftItems : rightItems;
        const displayLabel =
          side === "L"
            ? (leftLabel.trim() || defaultLeft)
            : (rightLabel.trim() || defaultRight);
        const prefix = isAB ? (side === "L" ? "A" : "B") : side === "L" ? "✓" : "✕";
        return (
          <div key={side} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                {prefix} {displayLabel} ({items.length}/{halfMax})
              </Label>
              {items.length < halfMax && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => add(side)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  添加
                </Button>
              )}
            </div>
            {items.map((item, i) => (
              <div key={item.id} className="flex gap-1.5 items-start">
                <Textarea
                  value={item.text}
                  onChange={(e) => update(side, i, e.target.value)}
                  className="min-h-[50px] resize-none text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  onClick={() => remove(side, i)}
                  aria-label="删除"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
