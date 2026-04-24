"use client";

import React from "react";
import { GenerateRequest, generateRequestSchema } from "@/core/schema/request.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TopicFormProps {
  onSubmit: (data: GenerateRequest) => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
}

const PAGE_COUNT_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function TopicForm({ onSubmit, isLoading = false, isLoggedIn = false }: TopicFormProps) {
  const [topic, setTopic] = React.useState("");
  const [audience, setAudience] = React.useState("");
  const [tone, setTone] = React.useState<GenerateRequest["tone"]>("gentle");
  const [noteType, setNoteType] = React.useState<GenerateRequest["noteType"]>("listicle");
  const [pageCount, setPageCount] = React.useState<number>(6);
  const [template, setTemplate] = React.useState<GenerateRequest["template"]>("template-a");
  const [includeRealImages, setIncludeRealImages] = React.useState(false);
  const [userOutline, setUserOutline] = React.useState("");
  const [showOutline, setShowOutline] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    const data: GenerateRequest = {
      topic,
      audience,
      tone,
      noteType,
      pageCount,
      template,
      includeRealImages,
      userOutline: userOutline.trim() ? userOutline.trim() : undefined,
    };
    const result = generateRequestSchema.safeParse(data);
    if (result.success) {
      onSubmit(result.data);
    } else {
      const issues = result.error.issues.map((i) => `${i.path.join(".") || "输入"}: ${i.message}`);
      setErrors(issues);
      console.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="topic">选题主题</Label>
        <Input
          id="topic"
          placeholder="例如：上班族高效早餐指南"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">目标人群</Label>
        <Input
          id="audience"
          placeholder="例如：25-35岁都市白领"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="userOutline">大纲草稿（可选）</Label>
          <button
            type="button"
            onClick={() => setShowOutline((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showOutline ? "收起" : "展开"}
          </button>
        </div>
        {showOutline ? (
          <>
            <Textarea
              id="userOutline"
              placeholder={
                "可以直接写你想讲的内容，每行一页或每行一个要点。留空则由 AI 自动生成。\n\n示例：\n1. 封面：5 分钟搞定通勤早餐\n2. 为什么跳过早餐影响工作效率（数据）\n3. 3 类快速早餐：燕麦杯 / 三明治 / 奶昔\n4. 前一晚备餐的 5 个技巧\n5. 常见问题：没胃口怎么办\n6. 号召：收藏 + 评论你的早餐"
              }
              value={userOutline}
              onChange={(e) => setUserOutline(e.target.value)}
              className="min-h-[160px] resize-y text-sm"
            />
            <p className="text-xs text-muted-foreground">
              提供大纲后，AI 会以你的内容为主进行扩写和润色。
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            想让 AI 按你的思路展开？点「展开」写一段大纲。
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>风格语调</Label>
        <Select value={tone} onValueChange={(v) => setTone(v as GenerateRequest["tone"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">专业严谨</SelectItem>
            <SelectItem value="gentle">温柔亲切</SelectItem>
            <SelectItem value="sharp">犀利直接</SelectItem>
            <SelectItem value="casual">轻松随意</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>内容类型</Label>
        <Select value={noteType} onValueChange={(v) => setNoteType(v as GenerateRequest["noteType"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="listicle">清单合集</SelectItem>
            <SelectItem value="tutorial">教程攻略</SelectItem>
            <SelectItem value="warning">避坑提醒</SelectItem>
            <SelectItem value="comparison">对比测评</SelectItem>
            <SelectItem value="summary">总结复盘</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pageCount">页数（{pageCount} 页）</Label>
        <input
          id="pageCount"
          type="range"
          min={4}
          max={12}
          step={1}
          value={pageCount}
          onChange={(e) => setPageCount(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
          {PAGE_COUNT_OPTIONS.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>模板</Label>
        <Select value={template} onValueChange={(v) => setTemplate(v as GenerateRequest["template"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="template-a">温润桃粉</SelectItem>
            <SelectItem value="template-b">雾蓝商务</SelectItem>
            <SelectItem value="template-c">奶油琥珀</SelectItem>
            <SelectItem value="template-d">素雅极简</SelectItem>
            <SelectItem value="template-e">薰衣草灰</SelectItem>
            <SelectItem value="template-f">陶土暖褐</SelectItem>
            <SelectItem value="template-g">深林墨绿</SelectItem>
            <SelectItem value="template-h">柔粉日常</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label className="text-sm">插入真实图片</Label>
          <p className="text-xs text-muted-foreground">
            需要配置图片素材 API Key
          </p>
        </div>
        <Switch
          checked={includeRealImages}
          onCheckedChange={setIncludeRealImages}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">• {err}</p>
          ))}
        </div>
      )}

      {!isLoggedIn && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-700">
            游客无法使用 AI 生成功能，请先登录。
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !isLoggedIn}>
        {isLoading ? "生成中..." : "生成内容"}
      </Button>
    </form>
  );
}
