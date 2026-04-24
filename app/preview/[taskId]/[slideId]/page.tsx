import React from "react";
import { notFound } from "next/navigation";
import { mapSlideToComponent } from "@/core/render/map-slide-to-component";
import { loadTaskDocument } from "@/core/storage/task-store";
import { CARD_WIDTH, CARD_HEIGHT } from "@/core/render/card-dimensions";
import { z } from "zod";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

// 禁用缓存，确保 Playwright 截图时总是获取最新内容
export const dynamic = "force-dynamic";

interface PreviewPageProps {
  params: Promise<{
    taskId: string;
    slideId: string;
  }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { taskId, slideId } = await params;

  const taskIdResult = taskIdSchema.safeParse(taskId);
  if (!taskIdResult.success) {
    notFound();
  }

  // 优先从本地文件读取，fallback 到 mock 数据
  const document = (await loadTaskDocument(taskId)) || null;

  if (!document) {
    notFound();
  }

  const slideIndex = document.slides.findIndex((s) => s.id === slideId);
  const slide = slideIndex >= 0 ? document.slides[slideIndex] : undefined;
  if (!slide) {
    notFound();
  }

  const component = mapSlideToComponent(
    slide,
    document.theme.template,
    document.theme.backgroundType || "solid",
    { pageIndex: slideIndex + 1, pageTotal: document.slides.length }
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {component}
      </div>
    </div>
  );
}
