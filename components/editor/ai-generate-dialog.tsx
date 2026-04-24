"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TopicForm } from "./topic-form";
import { GenerateRequest } from "@/core/schema/request.schema";

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GenerateRequest) => void;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

export function AIGenerateDialog({ open, onOpenChange, onSubmit, isLoading, error, isLoggedIn }: AIGenerateDialogProps) {
  function handleOpenChange(next: boolean) {
    if (isLoading) return;
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI 一键生成</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        <TopicForm onSubmit={onSubmit} isLoading={isLoading} isLoggedIn={isLoggedIn} />
      </DialogContent>
    </Dialog>
  );
}
