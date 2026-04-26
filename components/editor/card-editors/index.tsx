"use client";

import React from "react";
import { Slide } from "@/core/schema/note.schema";
import { StockSearchResult } from "@/core/schema/stock.schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ImageCandidatePicker } from "../image-candidate-picker";
import {
  TitleField,
  SubtitleField,
  HighlightField,
  BulletListField,
  Hint,
} from "./common";
import {
  FaqPairsEditor,
  StatsPairsEditor,
  ComparisonColumnsEditor,
} from "./structured-editors";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

interface CardEditorProps {
  slide: Slide;
  onChange: (next: Slide) => void;
  taskId?: string;
}

function ImageSection({ slide, onChange, taskId }: CardEditorProps) {
  const switchId = React.useId();
  const pos = slide.imagePosition || "top";
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function onSelect(image: StockSearchResult | null) {
    setUploadError(null);
    if (image) {
      onChange({
        ...slide,
        use_real_image: true,
        image: {
          source: image.source,
          previewUrl: image.previewUrl,
          fullUrl: image.fullUrl,
          pageUrl: image.pageUrl,
          author: image.author,
        },
      });
    } else {
      onChange({ ...slide, use_real_image: false, image: null });
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("[upload] handleUpload called", e.target.files);
    const file = e.target.files?.[0];
    if (!file || !taskId) {
      console.log("[upload] no file or no taskId", { file, taskId });
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("taskId", taskId);
      form.append("file", file);
      console.log("[upload] sending request", { taskId, fileName: file.name, fileSize: file.size });
      const res = await fetchWithAuth("/api/upload-image", {
        method: "POST",
        body: form,
      });
      console.log("[upload] response", { status: res.status, ok: res.ok });
      if (res.ok) {
        const data = await res.json();
        console.log("[upload] success", data);
        onChange({
          ...slide,
          use_real_image: true,
          image: {
            source: "upload",
            previewUrl: "",
            fullUrl: "",
            localPath: data.url,
          },
        });
      } else {
        const text = await res.text();
        console.log("[upload] error response", text);
        const err = JSON.parse(text);
        setUploadError(err.error || "上传失败，请重试");
      }
    } catch (e) {
      console.error("[upload] exception", e);
      setUploadError("上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const currentImage = slide.image
    ? {
        source: slide.image.source,
        id: slide.image.previewUrl || slide.image.localPath || "",
        previewUrl: slide.image.previewUrl || slide.image.localPath || "",
        fullUrl: slide.image.fullUrl || slide.image.localPath || "",
        pageUrl: slide.image.pageUrl,
        author: slide.image.author,
      }
    : null;

  const hasUpload = slide.image?.source === "upload";
  const uploadPreview = hasUpload ? slide.image?.localPath : undefined;

  return (
    <div className="space-y-2 rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={switchId} className="text-xs font-semibold">图片</Label>
        <Switch
          id={switchId}
          checked={slide.use_real_image}
          onCheckedChange={(v) => onChange({ ...slide, use_real_image: v })}
        />
      </div>
      {slide.use_real_image && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">图片位置</Label>
            <div className="grid grid-cols-3 gap-1">
              {([
                { value: "top", label: "顶部" },
                { value: "background", label: "背景" },
                { value: "bottom", label: "底部" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...slide, imagePosition: opt.value })}
                  className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                    pos === opt.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">上传图片</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : hasUpload ? (
                "更换图片"
              ) : (
                "选择本地图片"
              )}
            </Button>
            {uploadError && (
              <p className="text-[11px] text-red-600">{uploadError}</p>
            )}
            {uploadPreview && (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadPreview}
                  alt="upload preview"
                  className="h-14 w-14 rounded-md object-cover border"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() =>
                    onChange({ ...slide, use_real_image: false, image: null })
                  }
                >
                  移除
                </Button>
              </div>
            )}
          </div>
          <div className="border-t pt-2">
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              或从素材库搜索
            </Label>
            <ImageCandidatePicker
              key={slide.image_query || "none"}
              query={slide.image_query}
              currentImage={currentImage}
              onSelect={onSelect}
            />
          </div>
        </>
      )}
    </div>
  );
}

function CoverEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="封面标题" placeholder="一句话概括主题" />
      <SubtitleField {...props} label="副标题（可选）" placeholder="补充一句说明" />
      <Hint>封面显示：大标题 + 副标题 + 底部会自动显示「共 N 页」。</Hint>
      <ImageSection {...props} />
    </>
  );
}

function ContentEditor(props: CardEditorProps) {
  const imageMode = props.slide.use_real_image;
  return (
    <>
      <TitleField {...props} />
      <SubtitleField {...props} />
      <BulletListField
        {...props}
        maxBullets={imageMode ? 3 : 6}
        placeholder="具体的要点或动作"
      />
      {imageMode && <Hint>图文页最多显示 3 条要点，更多的会被裁掉。</Hint>}
      <HighlightField {...props} />
      <ImageSection {...props} />
    </>
  );
}

function SummaryEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="本篇重点 / 核心结论" />
      <SubtitleField {...props} />
      <BulletListField
        {...props}
        label="要点"
        maxBullets={6}
        placeholder="用一句话讲清一个要点"
      />
      <HighlightField {...props} label="一句话结论" />
    </>
  );
}

function CTAEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="号召标题" placeholder="一句话提出行动建议" />
      <SubtitleField {...props} label="说明" />
      <HighlightField
        {...props}
        label="突出的一句话（可选）"
        placeholder="例如：欢迎留言讨论"
      />
      <BulletListField
        {...props}
        label="补充要点（可选）"
        maxBullets={4}
        placeholder="可作为分点提示"
      />
      <Hint>此页不建议出现「点赞 / 收藏 / 关注」等平台功能词，改为具体内容行动（如留言主题、欢迎交流的问题）。</Hint>
    </>
  );
}

function QuoteEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="金句" placeholder="想要强调的那句话" />
      <SubtitleField {...props} label="出处 / 署名" placeholder="作者 · 出处" />
      <BulletListField
        {...props}
        label="注释（可选）"
        maxBullets={3}
        placeholder="一行简短注解"
      />
      <HighlightField {...props} label="标签（可选）" placeholder="一个短标签" />
    </>
  );
}

function TipsEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="小贴士主题" />
      <SubtitleField {...props} />
      <BulletListField
        {...props}
        label="贴士内容"
        maxBullets={7}
        placeholder="一条实用贴士"
      />
      <HighlightField {...props} />
    </>
  );
}

function ComparisonEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="对比的主题" />
      <ComparisonColumnsEditor {...props} maxBullets={8} />
      <HighlightField {...props} />
    </>
  );
}

function StepEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="本节步骤主题" />
      <SubtitleField {...props} />
      <BulletListField
        {...props}
        label="步骤"
        maxBullets={7}
        placeholder="一步操作说明"
      />
      <HighlightField {...props} />
      <ImageSection {...props} />
    </>
  );
}

function StatsEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="关键数据主题" />
      <SubtitleField {...props} />
      <StatsPairsEditor {...props} maxBullets={6} />
      <HighlightField {...props} />
    </>
  );
}

function FaqEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="常见问答" />
      <FaqPairsEditor {...props} maxBullets={6} />
      <HighlightField {...props} />
    </>
  );
}

function ChecklistEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="检查清单主题" />
      <SubtitleField {...props} />
      <BulletListField
        {...props}
        label="清单项"
        maxBullets={8}
        multiline={false}
        placeholder="一条待办或检查点"
      />
      <HighlightField {...props} />
    </>
  );
}

function TimelineEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" placeholder="时间线主题" />
      <BulletListField
        {...props}
        label="阶段节点"
        maxBullets={6}
        placeholder="一个阶段的说明"
      />
      <HighlightField {...props} />
    </>
  );
}

function ImageOnlyEditor(props: CardEditorProps) {
  return (
    <>
      <TitleField {...props} label="标题" />
      <SubtitleField {...props} />
      <BulletListField {...props} label="要点" maxBullets={3} placeholder="简短说明" />
      <HighlightField {...props} />
      <ImageSection {...props} />
      <Hint>此版式以大图为主，正文部分仅显示 3 条要点。</Hint>
    </>
  );
}

function ProseEditor(props: CardEditorProps) {
  return (
    <>
      <BulletListField
        {...props}
        label="正文段落"
        maxBullets={6}
        placeholder="一段正文内容"
      />
      <HighlightField {...props} />
      <ImageSection {...props} />
      <Hint>纯文本页无标题，每条内容作为独立段落显示。</Hint>
    </>
  );
}

export function CardEditor({ slide, onChange }: CardEditorProps) {
  const props = { slide, onChange };
  switch (slide.type) {
    case "cover":
      return <CoverEditor {...props} />;
    case "content":
      return <ContentEditor {...props} />;
    case "summary":
      return <SummaryEditor {...props} />;
    case "cta":
      return <CTAEditor {...props} />;
    case "image":
      return <ImageOnlyEditor {...props} />;
    case "quote":
      return <QuoteEditor {...props} />;
    case "tips":
      return <TipsEditor {...props} />;
    case "comparison":
      return <ComparisonEditor {...props} />;
    case "step":
      return <StepEditor {...props} />;
    case "stats":
      return <StatsEditor {...props} />;
    case "faq":
      return <FaqEditor {...props} />;
    case "checklist":
      return <ChecklistEditor {...props} />;
    case "timeline":
      return <TimelineEditor {...props} />;
    case "prose":
      return <ProseEditor {...props} />;
    default:
      console.warn(`[card-editors] 未知卡片类型: ${slide.type}`)
      return <ContentEditor {...props} />;
  }
}
