"use client";

import React from "react";
import { Slide } from "@/core/schema/note.schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Wand2, AlertTriangle, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { CardEditor } from "./card-editors";
import { checkSlideOverflow } from "@/core/qa/overflow-check";
import { CARD_TYPE_META } from "./card-type-meta";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

interface SlideEditorProps {
  slide: Slide;
  taskId: string;
  onUpdate: (updated: Slide) => void;
  onVersionUpdate?: (version: number) => void;
  allowRewrite?: boolean;
}

export function SlideEditor({ slide, taskId, onUpdate, onVersionUpdate = () => {}, allowRewrite = true }: SlideEditorProps) {
  const [editing, setEditing] = React.useState<Slide>({
    ...slide,
    bullets: [...slide.bullets],
    image: slide.image ? { ...slide.image } : null,
  });
  const [isRewriting, setIsRewriting] = React.useState(false);
  const [rewriteInstruction, setRewriteInstruction] = React.useState("");
  const [showRewrite, setShowRewrite] = React.useState(false);
  const [rewriteError, setRewriteError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const rewriteTextareaId = React.useId();

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const overflow = React.useMemo(() => checkSlideOverflow(editing), [editing]);
  const dirty = React.useMemo(() => {
    const norm = (s: Slide) => JSON.stringify({
      ...s,
      subtitle: s.subtitle ?? null,
      highlight: s.highlight ?? null,
      image: s.image ?? null,
    });
    return norm(editing) !== norm(slide);
  }, [editing, slide]);

  function handleSave() {
    onUpdate(editing);
  }

  async function handleRewrite() {
    setRewriteError(null);
    setIsRewriting(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetchWithAuth("/api/rewrite-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          slideId: slide.id,
          instruction: rewriteInstruction || undefined,
        }),
        signal: abortRef.current.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setEditing(data.slide);
        onUpdate(data.slide);
        if (typeof data.version === "number") onVersionUpdate(data.version);
        setShowRewrite(false);
        setRewriteInstruction("");
      } else if (res.status === 401 || res.status === 403) {
        const err = await res.json();
        setRewriteError(err.error || "请先登录以使用 AI 重写功能");
      } else if (res.status === 402) {
        const err = await res.json();
        setRewriteError(err.error || "今日 AI 生成次数已用完");
      } else {
        const err = await res.json();
        setRewriteError(err.error || "重写失败");
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error(e);
      setRewriteError("重写请求失败");
    } finally {
      setIsRewriting(false);
    }
  }

  const typeMeta = CARD_TYPE_META[editing.type];

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-muted/30 px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold truncate">{typeMeta?.label || editing.type}</div>
          <div className="text-[11px] text-muted-foreground truncate">{typeMeta?.description}</div>
        </div>
        {dirty && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
            未保存
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">对齐</span>
        {([
          { value: "left", icon: AlignLeft },
          { value: "center", icon: AlignCenter },
          { value: "right", icon: AlignRight },
        ] as const).map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setEditing({ ...editing, textAlign: editing.textAlign === value ? null : value })}
            className={`rounded p-1.5 transition-colors ${
              editing.textAlign === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={value === "left" ? "左对齐" : value === "center" ? "居中" : "右对齐"}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {overflow.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" />
            布局建议
          </div>
          {overflow.warnings.map((w, i) => (
            <p key={i} className="text-[11px] text-amber-700 leading-snug">• {w}</p>
          ))}
        </div>
      )}

      {rewriteError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {rewriteError}
        </div>
      )}

      <div className="space-y-3">
        <CardEditor slide={editing} onChange={setEditing} taskId={taskId} />
      </div>

      {showRewrite && (
        <div className="space-y-2 rounded-md border bg-muted/20 p-2">
          <Label htmlFor={rewriteTextareaId} className="text-xs">重写指令（可选）</Label>
          <Textarea
            id={rewriteTextareaId}
            value={rewriteInstruction}
            onChange={(e) => setRewriteInstruction(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
            placeholder="例如：让语气更中性、缩短要点..."
          />
          <Button size="sm" className="w-full" onClick={handleRewrite} disabled={isRewriting}>
            {isRewriting ? "重写中..." : "确认重写"}
          </Button>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 -mb-4 border-t bg-card px-4 py-3 flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleSave} disabled={!dirty}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {dirty ? "保存" : "已保存"}
        </Button>
        {allowRewrite && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => setShowRewrite(!showRewrite)}
            disabled={isRewriting}
          >
            <Wand2 className="mr-1.5 h-3.5 w-3.5" />
            AI 重写
          </Button>
        )}
      </div>
    </div>
  );
}
