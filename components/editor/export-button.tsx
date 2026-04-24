"use client";

import React from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

interface ExportButtonProps {
  taskId: string;
  slideCount: number;
  getExportNode: () => HTMLDivElement | null;
  onRenderTarget: (index: number) => void;
  onClearTarget: () => void;
  onResult?: (result: {
    success: boolean;
    exportedCount: number;
    failedCount: number;
    urls: string[];
  }) => void;
}

export function ExportButton({
  taskId,
  slideCount,
  getExportNode,
  onRenderTarget,
  onClearTarget,
  onResult,
}: ExportButtonProps) {
  const [exporting, setExporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleExport = React.useCallback(async () => {
    setExporting(true);
    setProgress(0);

    await document.fonts.ready;

    const urls: string[] = [];
    const failed: number[] = [];

    for (let i = 0; i < slideCount; i++) {
      if (!mountedRef.current) break;

      onRenderTarget(i);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const node = getExportNode();
      if (!node) {
        failed.push(i);
        if (mountedRef.current) setProgress(i + 1);
        continue;
      }

      try {
        const dataUrl = await toPng(node, {
          pixelRatio: 1.5,
          cacheBust: true,
        });

        const res = await fetchWithAuth("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId,
            slideIndex: i + 1,
            base64Image: dataUrl,
          }),
        });

        if (res.ok) {
          const { url } = await res.json();
          urls.push(url);
        } else {
          failed.push(i);
        }
      } catch (e) {
        console.error(`导出第 ${i + 1} 页失败:`, e);
        failed.push(i);
      }

      if (mountedRef.current) setProgress(i + 1);
    }

    onClearTarget();

    if (mountedRef.current) {
      setExporting(false);
      onResult?.({
        success: failed.length === 0,
        exportedCount: urls.length,
        failedCount: failed.length,
        urls,
      });
    }
  }, [taskId, slideCount, getExportNode, onRenderTarget, onClearTarget, onResult]);

  return (
    <Button size="sm" onClick={handleExport} disabled={exporting} aria-busy={exporting}>
      <Download className="mr-1.5 h-3.5 w-3.5" />
      {exporting ? `导出中 ${progress}/${slideCount}` : "导出 PNG"}
    </Button>
  );
}
