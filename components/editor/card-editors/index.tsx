"use client";

import React from "react";
import { Slide } from "@/core/schema/note.schema";
import { StockSearchResult } from "@/core/schema/stock.schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

interface CardEditorProps {
  slide: Slide;
  onChange: (next: Slide) => void;
}

function ImageSection({ slide, onChange }: CardEditorProps) {
  const switchId = React.useId();
  const pos = slide.imagePosition || "top";
  function onSelect(image: StockSearchResult | null) {
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

  const currentImage = slide.image
    ? {
        source: slide.image.source,
        id: slide.image.previewUrl,
        previewUrl: slide.image.previewUrl,
        fullUrl: slide.image.fullUrl,
        pageUrl: slide.image.pageUrl,
        author: slide.image.author,
      }
    : null;

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
          <ImageCandidatePicker
            key={slide.image_query || "none"}
            query={slide.image_query}
            currentImage={currentImage}
            onSelect={onSelect}
          />
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
