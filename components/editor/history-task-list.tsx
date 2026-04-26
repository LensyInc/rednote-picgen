"use client";

import React from "react";
import { NoteDocument } from "@/core/schema/note.schema";
import { Button } from "@/components/ui/button";
import { History, FolderOpen, Clock } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HistoryTaskListProps {
  onLoad: (doc: NoteDocument) => void;
}

interface TaskItem {
  id: string;
  topic: string;
  date: string;
}

type FilterKey = "all" | "today" | "3days" | "7days" | "older";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "today", label: "当天" },
  { key: "3days", label: "3天内" },
  { key: "7days", label: "7天内" },
  { key: "older", label: "7天前" },
];

function getDayStart(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function filterTasks(tasks: TaskItem[], filter: FilterKey): TaskItem[] {
  const now = getDayStart(new Date());
  const oneDay = 86_400_000;
  return tasks.filter((t) => {
    const taskTime = getDayStart(new Date(t.date));
    const diff = now - taskTime;
    switch (filter) {
      case "today":   return diff < oneDay;
      case "3days":   return diff < 3 * oneDay;
      case "7days":   return diff < 7 * oneDay;
      case "older":   return diff >= 7 * oneDay;
      default:        return true;
    }
  });
}

async function safeParseResponse<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const json = JSON.parse(text);
      return { ok: false, error: json.error || `请求失败 (${res.status})` };
    } catch {
      return { ok: false, error: `请求失败 (${res.status})` };
    }
  }
  try {
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false, error: "响应格式异常" };
  }
}

export function HistoryTaskList({ onLoad }: HistoryTaskListProps) {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingDoc, setLoadingDoc] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const abortRef = React.useRef<AbortController | null>(null);
  const loadAbortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      loadAbortRef.current?.abort();
    };
  }, []);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetchWithAuth("/api/tasks", { signal: abortRef.current.signal });
      const result = await safeParseResponse<{ tasks: TaskItem[] }>(res);
      if (result.ok) {
        setTasks(result.data.tasks || []);
      } else {
        setError(result.error);
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Load history error:", e);
      setError("加载历史失败");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (loadingDoc) return;
    setOpen(next);
    if (next) {
      setFilter("all");
      loadHistory();
    } else {
      abortRef.current?.abort();
      setError(null);
    }
  }

  async function handleLoad(taskId: string) {
    setError(null);
    setLoadingDoc(true);
    loadAbortRef.current?.abort();
    const ctrl = new AbortController();
    loadAbortRef.current = ctrl;
    try {
      const res = await fetchWithAuth(`/api/tasks/${taskId}`, { signal: ctrl.signal });
      const result = await safeParseResponse<NoteDocument>(res);
      if (result.ok) {
        onLoad(result.data);
        setOpen(false);
      } else {
        setError(result.error);
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Load document error:", e);
      setError("加载任务时发生错误");
    } finally {
      setLoadingDoc(false);
    }
  }

  const filtered = filterTasks(tasks, filter);

  return (
    <>
    {loadingDoc && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-10 py-7 shadow-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">正在加载项目...</p>
        </div>
      </div>
    )}
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-haspopup="dialog">
          <History className="mr-2 h-4 w-4" aria-hidden="true" />
          历史任务
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-lg flex-col p-0" aria-describedby="history-desc">
        {/* 固定头部：标题 + 筛选标签 */}
        <div className="shrink-0 border-b px-6 pt-5 pb-0">
          <DialogHeader className="px-0 pt-0">
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" aria-hidden="true" />
              历史任务
            </DialogTitle>
          </DialogHeader>
          <p id="history-desc" className="sr-only">
            选择历史任务以加载到编辑器
          </p>

          <div className="flex gap-1 mt-3" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-t px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* 可滚动列表 */}
        <div className="overflow-y-auto px-6 py-4 max-h-[55vh]">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              暂无历史任务
            </div>
          ) : (
            <div className="space-y-2" role="list">
              {filtered.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleLoad(task.id)}
                  disabled={loadingDoc}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  role="listitem"
                >
                  <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.topic || "未命名项目"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.date).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
