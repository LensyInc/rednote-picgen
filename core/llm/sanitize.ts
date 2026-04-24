/**
 * 对用户输入进行基本的控制字符清理和长度截断
 * 注意：此函数**不能**防御 Prompt 注入（如引号逃逸、指令覆盖）
 * 如需真正隔离用户输入，请使用结构化输出（function calling）
 */
export function sanitizeUserInput(input: string, maxLength = 500): string {
  if (!input) return "";
  // 移除控制字符和零宽字符
  let cleaned = input
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .replace(/[\u200b-\u200f\u2060\ufeff]/g, "");
  // 限制长度，防止超长输入耗尽 token
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength) + "...";
  }
  return cleaned.trim();
}
