import OpenAI from "openai";
import { prisma } from "@/lib/db";

export async function getOpenAIClient(): Promise<OpenAI> {
  // 从数据库读取用户设置
  const settings = await prisma.apiSettings.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!settings) {
    throw new Error("请先在设置页面配置 API 信息");
  }

  const config: any = {
    apiKey: settings.apiKey,
  };

  // 如果用户配置了代理地址，使用自定义baseURL
  if (settings.proxyUrl) {
    config.baseURL = settings.proxyUrl.endsWith('/v1')
      ? settings.proxyUrl
      : `${settings.proxyUrl}/v1`;
  }

  return new OpenAI(config);
}

export async function getAISettings() {
  const settings = await prisma.apiSettings.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!settings) {
    throw new Error("请先在设置页面配置 API 信息");
  }

  return {
    model: settings.model,
    temperature: settings.temperature,
  };
}
