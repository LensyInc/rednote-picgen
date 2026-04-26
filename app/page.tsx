"use client";

import React from "react";
import { SlideEditor } from "@/components/editor/slide-editor";
import { HistoryTaskList } from "@/components/editor/history-task-list";
import { AIGenerateDialog } from "@/components/editor/ai-generate-dialog";
import { ManualStartDialog } from "@/components/editor/manual-start-dialog";
import { PreviewCanvas } from "@/components/preview/preview-canvas";
import { ThumbnailStrip } from "@/components/preview/thumbnail-strip";
import { ExportButton } from "@/components/editor/export-button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/lib/auth-context";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { ensureGuestId } from "@/lib/guest-id";
import { NoteDocument, Slide } from "@/core/schema/note.schema";
import { GenerateRequest } from "@/core/schema/request.schema";
import { Button } from "@/components/ui/button";
import { Popover, PopoverItem } from "@/components/ui/popover";
import {
  Layers,
  PenLine,
  Sparkles,
  Wrench,
  Palette,
  Plus,
  X,
  ChevronDown,
  Paintbrush,
  Loader2,
  Download,
  Type,
} from "lucide-react";
import { CARD_TYPES, createEmptySlide } from "@/components/editor/card-type-meta";
import { THEMES, type BackgroundType, FONT_SCALE_MAP, type FontScale } from "@/components/templates/shared/theme";
import { templateEnum } from "@/core/schema/request.schema";
import { mapSlideToComponent } from "@/core/render/map-slide-to-component";
import { CARD_WIDTH, CARD_HEIGHT } from "@/core/render/card-dimensions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { z } from "zod";

type TemplateId = z.infer<typeof templateEnum>;

const BACKGROUND_TYPES: { value: BackgroundType; label: string; description: string }[] = [
  { value: "solid", label: "纯色", description: "干净的纯色背景" },
  { value: "gradient", label: "渐变", description: "柔和的双色渐变" },
  { value: "dots", label: "波点", description: "规则的点阵纹理" },
  { value: "lines", label: "横线", description: "等距的水平线" },
];

const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "small", label: "小" },
  { value: "medium", label: "中" },
  { value: "large", label: "大" },
];

function newSlideId() {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createBlankDocument(): NoteDocument {
  return {
    taskId: crypto.randomUUID(),
    version: 1,
    createdAt: new Date().toISOString(),
    meta: { topic: "", audience: "通用", tone: "gentle", noteType: "listicle", pageCount: 1 },
    theme: {
      template: "template-a",
      primaryColor: "#FF2442",
      secondaryColor: "#FFF5F7",
      backgroundType: "solid",
      fontScale: "medium",
    },
    slides: [{
      id: newSlideId(),
      type: "cover",
      title: "",
      subtitle: null,
      bullets: [],
      highlight: null,
      use_real_image: false,
      image_query: null,
      image: null,
    }],
  };
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  // 确保游客有 guestId
  React.useEffect(() => {
    ensureGuestId();
  }, []);

  const [hasStarted, setHasStarted] = React.useState(false);
  const [document, setDocument] = React.useState<NoteDocument>(() => createBlankDocument());
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [showAIDialog, setShowAIDialog] = React.useState(false);
  const [showManualDialog, setShowManualDialog] = React.useState(false);
  const [showFabMenu, setShowFabMenu] = React.useState(false);
  const [rightPanel, setRightPanel] = React.useState<"thumbnails" | "editor">("thumbnails");
  const [exportResult, setExportResult] = React.useState<{
    success: boolean;
    exportedCount: number;
    failedCount: number;
    urls: string[];
  } | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);

  // 导出时按需挂载目标 slide DOM（通过 exportTargetIndex 控制）
  const [exportTargetIndex, setExportTargetIndex] = React.useState<number | null>(null);
  const exportDomRef = React.useRef<HTMLDivElement | null>(null);

  const getExportNode = React.useCallback((): HTMLDivElement | null => {
    return exportDomRef.current;
  }, []);

  const renderExportTarget = React.useCallback(
    (index: number) => {
      setExportTargetIndex(index);
    },
    []
  );

  const clearExportTarget = React.useCallback(() => {
    setExportTargetIndex(null);
  }, []);

  const handleExportStateChange = React.useCallback((isExporting: boolean, progress: number) => {
    setExporting(isExporting);
    setExportProgress(progress);
  }, []);

  const safeIndex = Math.min(selectedIndex, document.slides.length - 1);
  const currentSlide: Slide = document.slides[safeIndex] ?? document.slides[0];
  const backgroundType = document.theme.backgroundType || "solid";
  const currentBg = BACKGROUND_TYPES.find((b) => b.value === backgroundType) || BACKGROUND_TYPES[0];

  // 文档变化时自动保存（debounced）
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const lastSavedRef = React.useRef<string>(JSON.stringify(document));
  React.useEffect(() => {
    if (!hasStarted) return;
    const json = JSON.stringify(document);
    if (json === lastSavedRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetchWithAuth("/api/save-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: document.taskId, document, version: document.version }),
          signal: abortControllerRef.current?.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.version === "number") {
            setDocument((prev) => {
              const updated = { ...prev, version: data.version };
              lastSavedRef.current = JSON.stringify(updated);
              return updated;
            });
          } else {
            lastSavedRef.current = json;
          }
        } else {
          console.error("[auto-save] status", res.status);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error("[auto-save] failed", e);
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [document, hasStarted]);

  // 刷新后自动恢复上次编辑的文档
  const [restoring, setRestoring] = React.useState(true);
  React.useEffect(() => {
    const savedTaskId = localStorage.getItem("picgen_editing_task");
    if (!savedTaskId) {
      queueMicrotask(() => setRestoring(false));
      return;
    }
    (async () => {
      try {
        const res = await fetchWithAuth(`/api/tasks/${savedTaskId}`);
        if (res.ok) {
          const doc: NoteDocument = await res.json();
          lastSavedRef.current = JSON.stringify(doc);
          setDocument(doc);
          setHasStarted(true);
        }
      } catch {
        // ignore
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  // 进入编辑状态后保存 taskId 到 localStorage
  React.useEffect(() => {
    if (hasStarted) {
      localStorage.setItem("picgen_editing_task", document.taskId);
    }
  }, [hasStarted, document.taskId]);

  async function handleGenerate(data: GenerateRequest) {
    setIsGenerating(true);
    setGenerateError(null);
    setExportResult(null);
    try {
      const res = await fetchWithAuth("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        lastSavedRef.current = JSON.stringify(result);
        setDocument(result);
        setSelectedIndex(0);
        setHasStarted(true);
        setShowAIDialog(false);
      } else if (res.status === 401 || res.status === 403) {
        const err = await res.json();
        setGenerateError(err.error || "请先登录以使用 AI 生成功能");
      } else if (res.status === 402) {
        const err = await res.json();
        setGenerateError(err.error || "今日 AI 生成次数已用完");
      } else {
        const err = await res.json();
        setGenerateError(err.error || "生成失败");
      }
    } catch (e) {
      console.error(e);
      setGenerateError("生成请求失败");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleManualStart(projectName: string) {
    const blank = createBlankDocument();
    const doc: NoteDocument = {
      ...blank,
      meta: { ...blank.meta, topic: projectName },
    };
    setDocument(doc);
    setSelectedIndex(0);
    setShowManualDialog(false);
    setHasStarted(true);
  }

  function handleSlideUpdate(updated: Slide) {
    const newSlides = [...document.slides];
    newSlides[selectedIndex] = updated;
    setDocument({ ...document, slides: newSlides });
  }

  function handleLoadDocument(doc: NoteDocument) {
    lastSavedRef.current = JSON.stringify(doc);
    setDocument(doc);
    setSelectedIndex(0);
    setExportResult(null);
    setHasStarted(true);
  }

  function handleBackgroundChange(type: BackgroundType) {
    setDocument({
      ...document,
      theme: { ...document.theme, backgroundType: type },
    });
  }

  function handleFontScaleChange(fontScale: FontScale) {
    setDocument({
      ...document,
      theme: { ...document.theme, fontScale },
    });
  }

  function handleTemplateChange(templateId: TemplateId) {
    const theme = THEMES[templateId];
    setDocument({
      ...document,
      theme: {
        ...document.theme,
        template: templateId,
        primaryColor: theme.primary,
        secondaryColor: theme.surfaceSoft,
      },
    });
  }

  function handleAddSlide(type: Slide["type"]) {
    if (document.slides.length >= 64) return;
    const newSlide = createEmptySlide(type, newSlideId());
    const newSlides = [...document.slides, newSlide];
    setDocument({
      ...document,
      slides: newSlides,
      meta: { ...document.meta, pageCount: newSlides.length },
    });
    setSelectedIndex(newSlides.length - 1);
    setRightPanel("editor");
  }

  function handleMoveSlide(from: number, to: number) {
    if (from === to || to < 0 || to >= document.slides.length) return;
    const newSlides = [...document.slides];
    const [moved] = newSlides.splice(from, 1);
    newSlides.splice(to, 0, moved);
    setDocument({ ...document, slides: newSlides });
    if (selectedIndex === from) {
      setSelectedIndex(to);
    } else if (from < to && selectedIndex > from && selectedIndex <= to) {
      setSelectedIndex(selectedIndex - 1);
    } else if (from > to && selectedIndex >= to && selectedIndex < from) {
      setSelectedIndex(selectedIndex + 1);
    }
  }

  function handleDeleteSlide(index: number) {
    if (document.slides.length <= 1) return;
    const newSlides = document.slides.filter((_, i) => i !== index);
    setDocument({
      ...document,
      slides: newSlides,
      meta: { ...document.meta, pageCount: newSlides.length },
    });
    if (selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    } else if (selectedIndex >= newSlides.length) {
      setSelectedIndex(newSlides.length - 1);
    }
  }

  function handleDuplicateSlide(index: number) {
    if (document.slides.length >= 64) return;
    const source = document.slides[index];
    const copy: Slide = {
      ...source,
      id: newSlideId(),
      bullets: [...source.bullets],
      image: source.image ? { ...source.image } : null,
    };
    const newSlides = [...document.slides];
    newSlides.splice(index + 1, 0, copy);
    setDocument({
      ...document,
      slides: newSlides,
      meta: { ...document.meta, pageCount: newSlides.length },
    });
    setSelectedIndex(index + 1);
  }

  if (restoring) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center gap-8 bg-background">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <HistoryTaskList onLoad={handleLoadDocument} />
          <UserMenu />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-wenkai)" }}>
            PicGen
          </h1>
          <p className="text-sm text-muted-foreground">小红书文字图片生成器</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => { setGenerateError(null); setShowAIDialog(true); }}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-card px-10 py-8 shadow-sm transition-all hover:border-primary hover:shadow-md"
          >
            <Sparkles className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="text-base font-semibold">AI 一键生成</div>
              <div className="text-xs text-muted-foreground mt-0.5">填写主题，AI 自动创作</div>
            </div>
          </button>
          <button
            onClick={() => setShowManualDialog(true)}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-card px-10 py-8 shadow-sm transition-all hover:border-primary hover:shadow-md"
          >
            <Wrench className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="text-base font-semibold">手动搭建</div>
              <div className="text-xs text-muted-foreground mt-0.5">自由添加页面，灵活排版</div>
            </div>
          </button>
        </div>
        <AIGenerateDialog
          open={showAIDialog}
          onOpenChange={setShowAIDialog}
          onSubmit={handleGenerate}
          isLoading={isGenerating}
          error={generateError}
          isLoggedIn={isLoggedIn}
        />
        <ManualStartDialog
          open={showManualDialog}
          onOpenChange={setShowManualDialog}
          onStart={handleManualStart}
        />
        <AuthDialog />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b bg-card px-5 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base font-bold shrink-0" style={{ fontFamily: "var(--font-wenkai)" }}>
            PicGen
          </h1>
          {document.meta.topic && (
            <span className="text-xs text-muted-foreground truncate">
              {document.meta.topic} · 共 {document.slides.length} 页
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <HistoryTaskList onLoad={handleLoadDocument} />
          <ExportButton
            taskId={document.taskId}
            slideCount={document.slides.length}
            getExportNode={getExportNode}
            onRenderTarget={renderExportTarget}
            onClearTarget={clearExportTarget}
            onExportStateChange={handleExportStateChange}
            onResult={setExportResult}
          />
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：工具条 + 预览 */}
        <main className="flex flex-1 flex-col overflow-hidden bg-muted/30">
          <div className="flex shrink-0 items-center gap-2 border-b bg-card/60 px-4 py-2 backdrop-blur">
            <Popover
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  添加页面
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              }
              contentClassName="max-h-[520px] overflow-y-auto w-[260px]"
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                选择卡片类型
              </div>
              {CARD_TYPES.map((t) => (
                <PopoverItem key={t.type} onClick={() => handleAddSlide(t.type)}>
                  <t.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{t.description}</div>
                  </div>
                </PopoverItem>
              ))}
            </Popover>

            <Popover
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Paintbrush className="h-3.5 w-3.5" />
                  配色：{THEMES[document.theme.template]?.name || "默认"}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              }
              contentClassName="w-[240px] max-h-[420px] overflow-y-auto"
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                选择配色
              </div>
              {Object.values(THEMES).map((t) => (
                <PopoverItem
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  active={document.theme.template === t.id}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border"
                    style={{ backgroundColor: t.primary, borderColor: t.divider }}
                  />
                  <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                    <span className="text-sm">{t.name}</span>
                    <span className="flex gap-0.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.accent }} />
                      <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: t.background, borderColor: t.divider }} />
                    </span>
                  </div>
                </PopoverItem>
              ))}
            </Popover>

            <Popover
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  背景：{currentBg.label}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              }
              contentClassName="w-[200px]"
            >
              {BACKGROUND_TYPES.map((bg) => (
                <PopoverItem
                  key={bg.value}
                  onClick={() => handleBackgroundChange(bg.value)}
                  active={backgroundType === bg.value}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{bg.label}</div>
                    <div className="text-[10px] text-muted-foreground">{bg.description}</div>
                  </div>
                </PopoverItem>
              ))}
            </Popover>

            <Popover
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Type className="h-3.5 w-3.5" />
                  字号：{FONT_SCALE_OPTIONS.find((f) => f.value === document.theme.fontScale)?.label || "中"}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              }
              contentClassName="w-[140px]"
            >
              {FONT_SCALE_OPTIONS.map((fs) => (
                <PopoverItem
                  key={fs.value}
                  onClick={() => handleFontScaleChange(fs.value)}
                  active={document.theme.fontScale === fs.value}
                >
                  <span className="min-w-0 flex-1 text-sm">{fs.label}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {Math.round(FONT_SCALE_MAP[fs.value] * 100)}%
                  </span>
                </PopoverItem>
              ))}
            </Popover>

            <div className="ml-auto text-xs text-muted-foreground tabular-nums">
              第 {selectedIndex + 1} / {document.slides.length} 页
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <PreviewCanvas
              slide={currentSlide}
              templateId={document.theme.template}
              backgroundType={backgroundType}
              pageIndex={selectedIndex + 1}
              pageTotal={document.slides.length}
              fontScale={document.theme.fontScale}
            />
          </div>
        </main>

        {/* 右侧：页面列表 / 编辑 */}
        <aside className="flex w-[360px] shrink-0 flex-col overflow-hidden border-l bg-card">
          <div className="flex shrink-0 border-b">
            <button
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                rightPanel === "thumbnails"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setRightPanel("thumbnails")}
            >
              <Layers className="h-4 w-4" />
              页面
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                rightPanel === "editor"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setRightPanel("editor")}
            >
              <PenLine className="h-4 w-4" />
              编辑
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightPanel === "thumbnails" ? (
              <ThumbnailStrip
                slides={document.slides}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                templateId={document.theme.template}
                backgroundType={backgroundType}
                fontScale={document.theme.fontScale}
                onMove={handleMoveSlide}
                onDelete={handleDeleteSlide}
                onDuplicate={handleDuplicateSlide}
              />
            ) : (
              <div className="p-4">
                <SlideEditor
                  key={currentSlide.id}
                  slide={currentSlide}
                  taskId={document.taskId}
                  onUpdate={handleSlideUpdate}
                  onVersionUpdate={(v) => setDocument((prev) => ({ ...prev, version: v }))}
                  allowRewrite={isLoggedIn}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* AI 生成遮罩 */}
      {isGenerating && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-xl max-w-sm text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-base font-semibold">AI 正在生成内容…</p>
            <p className="text-sm text-muted-foreground">
              生成多页图文内容可能需要 30 秒到数分钟，<br />
              请耐心等待，不要关闭此页面。
            </p>
          </div>
        </div>
      )}

      {/* 导出遮罩 */}
      {exporting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              正在导出 {exportProgress}/{document.slides.length} …
            </p>
          </div>
        </div>
      )}

      {/* 导出结果下载对话框 */}
      <Dialog open={!!exportResult} onOpenChange={(open) => { if (!open) setExportResult(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {exportResult?.success ? "导出完成" : "部分导出成功"}
            </DialogTitle>
            <DialogDescription>
              成功 {exportResult?.exportedCount} 张
              {(exportResult?.failedCount ?? 0) > 0 && `，失败 ${exportResult?.failedCount} 张`}
            </DialogDescription>
          </DialogHeader>
          {exportResult && exportResult.urls.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {exportResult.urls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      download={`slide-${i + 1}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <Download className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">slide-{i + 1}.png</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* 左下角圆形新建按钮 */}
      {showFabMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowFabMenu(false)} />
      )}
      <div className="fixed bottom-6 left-6 z-50">
        {showFabMenu && (
          <div className="absolute bottom-14 left-0 min-w-[160px] rounded-xl border bg-card p-1.5 shadow-lg">
            <button
              onClick={() => { setShowFabMenu(false); setGenerateError(null); setShowAIDialog(true); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              AI 一键生成
            </button>
            <button
              onClick={() => { setShowFabMenu(false); setShowManualDialog(true); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <Wrench className="h-4 w-4 text-primary shrink-0" />
              手动搭建
            </button>
          </div>
        )}
        <button
          onClick={() => setShowFabMenu((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          {showFabMenu ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* AI 生成 / 手动搭建 对话框 */}
      <AIGenerateDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onSubmit={handleGenerate}
        isLoading={isGenerating}
        error={generateError}
        isLoggedIn={isLoggedIn}
      />
      <ManualStartDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        onStart={handleManualStart}
      />

      {/* 导出容器：仅在导出期间渲染当前目标 slide */}
      {exportTargetIndex !== null && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: CARD_WIDTH,
            pointerEvents: "none",
          }}
        >
          <div ref={exportDomRef} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            {mapSlideToComponent(
              document.slides[exportTargetIndex],
              document.theme.template,
              backgroundType,
              { pageIndex: exportTargetIndex + 1, pageTotal: document.slides.length, fontScale: document.theme.fontScale }
            )}
          </div>
        </div>
      )}

      <AuthDialog />
    </div>
  );
}
