import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { clearAIConfigCache } from '@/lib/ai/client';
import { getSession } from '@/lib/auth';

// GET - 获取当前用户的激活配置（不返回完整 apiKey）
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户 session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 优先查找用户级别的配置
    const userConfig = await prisma.aIConfig.findFirst({
      where: {
        userId: userId,
        isActive: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // 如果用户没有配置，回退到全局配置
    let settings = userConfig;
    if (!settings) {
      const globalSettings = await prisma.apiSettings.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });

      if (globalSettings) {
        // 转换全局配置格式
        return NextResponse.json({
          proxyUrl: globalSettings.proxyUrl || '',
          apiKey: globalSettings.apiKey.length > 10
            ? `${globalSettings.apiKey.substring(0, 6)}****${globalSettings.apiKey.substring(globalSettings.apiKey.length - 4)}`
            : '******',
          model: globalSettings.model,
          temperature: globalSettings.temperature,
          isConfigured: true,
          isGlobal: true,
        });
      }
    }

    if (!settings) {
      return NextResponse.json({
        proxyUrl: 'https://openclaw-api.com/v1/chat/completions',
        apiKey: '',
        model: 'gpt-5.4-mini',
        temperature: 0.7,
        isConfigured: false,
      });
    }

    // 脱敏处理 API Key（只显示前6位和后4位）
    const maskedApiKey = settings.apiKey.length > 10
      ? `${settings.apiKey.substring(0, 6)}****${settings.apiKey.substring(settings.apiKey.length - 4)}`
      : '******';

    return NextResponse.json({
      proxyUrl: settings.proxyUrl || '',
      apiKey: maskedApiKey,
      model: settings.model,
      temperature: settings.temperature,
      isConfigured: true,
      isGlobal: false,
    });
  } catch (error) {
    console.error('获取 AI 配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

// POST - 保存用户级别配置
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户 session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { proxyUrl, apiKey, model, temperature } = body;

    // 验证必填字段
    if (!apiKey || !model) {
      return NextResponse.json(
        { error: 'API Key 和模型不能为空' },
        { status: 400 }
      );
    }

    // 验证温度范围
    if (temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: '温度值必须在 0-2 之间' },
        { status: 400 }
      );
    }

    // 先将该用户的所有配置设为非激活
    await prisma.aIConfig.updateMany({
      where: { userId: userId },
      data: { isActive: false }
    });

    // 创建新配置
    const newConfig = await prisma.aIConfig.create({
      data: {
        proxyUrl: proxyUrl || '',
        apiKey,
        model,
        temperature,
        isActive: true,
        userId: userId,
      }
    });

    // 清除配置缓存
    clearAIConfigCache();

    return NextResponse.json({
      success: true,
      message: '配置保存成功',
      id: newConfig.id,
    });
  } catch (error) {
    console.error('保存 AI 配置失败:', error);
    return NextResponse.json(
      { error: '保存配置失败' },
      { status: 500 }
    );
  }
}
