/**
 * 检查 LLM API Key 是否已配置
 * 返回 null 表示已配置，否则返回错误消息
 */
export function checkLLMAPIKey(): string | null {
  const provider = process.env.DEFAULT_LLM_PROVIDER || "qwen";

  if (provider !== "qwen" && provider !== "deepseek") {
    return `无效的 LLM 提供商: ${provider}，请使用 "qwen" 或 "deepseek"`;
  }

  const apiKey =
    provider === "deepseek"
      ? process.env.DEEPSEEK_API_KEY
      : process.env.QWEN_API_KEY;

  if (!apiKey || apiKey === "your-qwen-api-key" || apiKey === "your-deepseek-api-key") {
    return `未配置 ${provider} 的 API Key，请在 .env.local 中设置`;
  }

  return null;
}
