import OpenAI from "openai";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** 失败后的最大重试次数（不含首次尝试） */
  retries?: number;
}

export interface LLMProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
}

class OpenAICompatibleProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, baseURL: string, model: string) {
    this.client = new OpenAI({ apiKey, baseURL, timeout: 120_000 });
    this.model = model;
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<string> {
    const maxRetries = options.retries ?? 1;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      attempt++;
      const started = Date.now();
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          thinking: { type: "disabled" },
        } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error("LLM returned empty content");
        }
        const elapsed = ((Date.now() - started) / 1000).toFixed(1);
        console.log(`[llm] ${this.model} attempt=${attempt} ok in ${elapsed}s`);
        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const elapsed = ((Date.now() - started) / 1000).toFixed(1);
        console.warn(
          `[llm] ${this.model} attempt=${attempt} failed in ${elapsed}s: ${lastError.message}`
        );
        const errorStatus = (error as { status?: number })?.status;
        if (errorStatus === 401) throw lastError;
        if (lastError.message.includes("401") || lastError.message.includes("API key")) {
          throw lastError;
        }
        const isTimeout = /timeout|timed? out|ETIMEDOUT|ECONNRESET/i.test(lastError.message);
        const isRetryable = isTimeout || /429|rate limit|too many/i.test(lastError.message) || (errorStatus !== undefined && (errorStatus === 429 || errorStatus >= 500));
        if (attempt <= maxRetries && isRetryable) {
          const delay = 1000 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          break;
        }
      }
    }

    throw lastError || new Error("LLM request failed after retries");
  }
}

/**
 * 根据环境变量创建 LLM Provider
 */
export function createProvider(): LLMProvider {
  const provider = process.env.DEFAULT_LLM_PROVIDER || "qwen";

  if (provider === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");
    return new OpenAICompatibleProvider(apiKey, baseURL, model);
  }

  // 默认 qwen
  const apiKey = process.env.QWEN_API_KEY;
  const baseURL = process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const model = process.env.QWEN_MODEL || "qwen3.5-flash";
  if (!apiKey) throw new Error("QWEN_API_KEY not configured");
  return new OpenAICompatibleProvider(apiKey, baseURL, model);
}
