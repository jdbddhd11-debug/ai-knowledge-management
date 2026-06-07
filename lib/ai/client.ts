import OpenAI from "openai";
import { prisma } from "@/lib/db";

// 配置缓存
let configCache: {
  config: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 获取激活的配置（带缓存）
export async function getActiveConfig() {
  // 检查缓存是否有效
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    return configCache.config;
  }

  // 从数据库读取激活的配置
  const settings = await prisma.apiSettings.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' }
  });

  if (!settings) {
    throw new Error("请先在设置页面配置 API 信息");
  }

  const config = {
    proxyUrl: settings.proxyUrl,
    apiKey: settings.apiKey,
    model: settings.model,
    temperature: settings.temperature,
  };

  // 更新缓存
  configCache = {
    config,
    timestamp: Date.now(),
  };

  return config;
}

// 清除配置缓存
export function clearAIConfigCache() {
  configCache = null;
}

// 统一 AI 调用接口
export async function callAI(
  messages: Array<{ role: string; content: string }>,
  options?: {
    temperature?: number;
    model?: string;
    responseFormat?: 'json' | 'text';
  }
) {
  const config = await getActiveConfig();

  const temperature = options?.temperature ?? config.temperature;
  const model = options?.model ?? config.model;

  // 构建请求 URL
  let apiUrl = config.proxyUrl || 'https://api.openai.com/v1/chat/completions';
  if (!apiUrl.includes('/chat/completions')) {
    apiUrl = apiUrl.endsWith('/v1')
      ? `${apiUrl}/chat/completions`
      : `${apiUrl}/v1/chat/completions`;
  }

  const requestBody: any = {
    model,
    messages,
    temperature,
    stream: true,  // 设置为 true 以支持流式响应
  };

  // 如果需要 JSON 格式响应
  if (options?.responseFormat === 'json') {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('AI API error:', response.status, error);
    throw new Error(`AI API 调用失败: ${response.status}`);
  }

  // 使用流式读取器读取响应
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法获取响应流');
  }

  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
            }
          } catch (e) {
            console.error('解析流式数据失败:', data.substring(0, 100));
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!fullContent) {
    throw new Error('AI 返回内容为空');
  }

  return fullContent;
}

// 兼容旧代码的 OpenAI 客户端
export async function getOpenAIClient(): Promise<OpenAI> {
  const config = await getActiveConfig();

  const clientConfig: any = {
    apiKey: config.apiKey,
  };

  if (config.proxyUrl) {
    clientConfig.baseURL = config.proxyUrl.endsWith('/v1')
      ? config.proxyUrl
      : `${config.proxyUrl}/v1`;
  }

  return new OpenAI(clientConfig);
}

// 兼容旧代码的设置获取
export async function getAISettings() {
  const config = await getActiveConfig();

  return {
    model: config.model,
    temperature: config.temperature,
  };
}
