"use client";

import React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  contentClassName?: string;
}

export function Popover({
  trigger,
  children,
  align = "start",
  className,
  contentClassName,
}: PopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    triggerRight: number;
    viewportHeight: number;
  } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const contentId = React.useId();

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    function update() {
      const t = triggerRef.current;
      if (!t) return;
      const rect = t.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: rect.left,
        triggerRight: rect.right,
        viewportHeight: window.innerHeight,
      });
    }
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, align]);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showAbove = pos ? pos.top > pos.viewportHeight * 0.7 : false;
  const contentStyle: React.CSSProperties = pos
    ? {
        ...(showAbove
          ? { bottom: pos.viewportHeight - (pos.top - 6) }
          : { top: pos.top }),
        ...(align === "end"
          ? { right: Math.max(8, (typeof window !== "undefined" ? window.innerWidth : 0) - pos.triggerRight) }
          : { left: pos.left }),
      }
    : {};

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={cn("inline-block", className)}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? contentId : undefined}
      >
        {trigger}
      </button>
      {mounted && open && pos &&
        createPortal(
          <div
            ref={contentRef}
            id={contentId}
            role="listbox"
            className={cn(
              "fixed z-[100] min-w-[200px] rounded-md border bg-popover p-1 shadow-lg",
              contentClassName
            )}
            style={contentStyle}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("[data-popover-close]")) setOpen(false);
            }}
          >
            {children}
          </div>,
          window.document.body
        )}
    </>
  );
}

export function PopoverItem({
  children,
  onClick,
  active,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active || undefined}
      data-popover-close=""
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-sm transition-colors",
        active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}
