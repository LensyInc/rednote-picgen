"use client";

import type React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        页面出错了
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500">
        渲染过程中发生错误。如果问题持续，请尝试刷新页面。
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-gray-100 p-4 text-xs text-red-700">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      )}
      <Button className="mt-6" onClick={reset}>
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
        重试
      </Button>
    </div>
  );
}
