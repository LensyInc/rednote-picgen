import { Slide } from "@/core/schema/note.schema";

export interface OverflowCheckResult {
  slideId: string;
  warnings: string[];
}

// 卡片宽 1242，内容区 ~1080px。文本型卡片标题 ~72px，bullet ~40px
// 中文字形约 1em 宽，留出 badge / padding 余量
const TITLE_CHARS_PER_LINE = 14; // 正文页标题（72–88px）
const COVER_CHARS_PER_LINE = 8; // 封面标题（140px）
const BULLET_CHARS_PER_LINE = 22; // bullet（40px，左侧有序号）
const SUBTITLE_CHARS_PER_LINE = 20;
const HIGHLIGHT_CHARS_PER_LINE = 22;
const MAX_LINES_TITLE = 2;
const MAX_LINES_COVER_TITLE = 3;
const MAX_LINES_SUBTITLE = 3;
const MAX_LINES_BULLET = 3;
const MAX_LINES_HIGHLIGHT = 2;
const MAX_BULLETS = 8;
const MAX_TITLE_CHARS = 20;
const MAX_BULLET_CHARS = 40;

// 更准确地判断中文字符（包括 CJK 统一表意文字）
const CJK_RE = /\p{Unified_Ideograph}/u;

function estimateLines(text: string, charsPerLine: number): number {
  if (!text) return 0;
  // 中文字符算 1，英文/数字/标点算 0.6
  let width = 0;
  for (const char of text) {
    width += CJK_RE.test(char) ? 1 : 0.6;
  }
  return Math.ceil(width / charsPerLine);
}

/**
 * 检测单页文本是否可能溢出
 */
export function checkSlideOverflow(slide: Slide): OverflowCheckResult {
  const warnings: string[] = [];

  const isCover = slide.type === "cover";
  const titleChars = isCover ? COVER_CHARS_PER_LINE : TITLE_CHARS_PER_LINE;
  const maxTitleLines = isCover ? MAX_LINES_COVER_TITLE : MAX_LINES_TITLE;

  // 标题长度检查
  if (slide.title.length > MAX_TITLE_CHARS) {
    warnings.push(`标题过长 (${slide.title.length} 字)，建议不超过 ${MAX_TITLE_CHARS} 字`);
  }
  const titleLines = estimateLines(slide.title, titleChars);
  if (titleLines > maxTitleLines) {
    warnings.push(`标题可能折行 ${titleLines} 行，建议缩短`);
  }

  // 副标题
  if (slide.subtitle) {
    const subLines = estimateLines(slide.subtitle, SUBTITLE_CHARS_PER_LINE);
    if (subLines > MAX_LINES_SUBTITLE) {
      warnings.push(`副标题可能折行 ${subLines} 行`);
    }
  }

  // bullets 数量
  if (slide.bullets.length > MAX_BULLETS) {
    warnings.push(`要点过多 (${slide.bullets.length} 条)，建议不超过 ${MAX_BULLETS} 条`);
  }

  // 每条 bullet 长度
  slide.bullets.forEach((bullet, idx) => {
    if (bullet.length > MAX_BULLET_CHARS) {
      warnings.push(
        `要点 ${idx + 1} 过长 (${bullet.length} 字)，建议不超过 ${MAX_BULLET_CHARS} 字`
      );
    }
    const bulletLines = estimateLines(bullet, BULLET_CHARS_PER_LINE);
    if (bulletLines > MAX_LINES_BULLET) {
      warnings.push(`要点 ${idx + 1} 可能折行 ${bulletLines} 行`);
    }
  });

  // highlight
  if (slide.highlight) {
    const hlLines = estimateLines(slide.highlight, HIGHLIGHT_CHARS_PER_LINE);
    if (hlLines > MAX_LINES_HIGHLIGHT) {
      warnings.push(`高亮语句可能折行 ${hlLines} 行`);
    }
  }

  // 空内容检查
  if (slide.bullets.length === 0 && slide.type === "content") {
    warnings.push("内容页缺少要点");
  }

  return {
    slideId: slide.id,
    warnings,
  };
}

/**
 * 批量检测所有 slides
 */
export function checkAllSlides(slides: Slide[]): OverflowCheckResult[] {
  return slides.map(checkSlideOverflow).filter((r) => r.warnings.length > 0);
}
