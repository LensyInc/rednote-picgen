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

async function safeParseResponse<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // 尝试提取 JSON 错误，fallback 到状态码
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
    if (next) loadHistory();
    else {
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
      <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto" aria-describedby="history-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden="true" />
            历史任务
          </DialogTitle>
        </DialogHeader>
        <p id="history-desc" className="sr-only">
          选择历史任务以加载到编辑器
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            暂无历史任务
          </div>
        ) : (
          <div className="space-y-2" role="list">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleLoad(task.id)}
                disabled={loadingDoc}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                role="listitem"
              >
                <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.topic}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {task.id}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {task.date}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
