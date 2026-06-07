import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, temperature, model } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '消息格式不正确' },
        { status: 400 }
      );
    }

    const content = await callAI(messages, {
      temperature,
      model,
      responseFormat: 'text',
    });

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('AI chat error:', error);

    let errorMessage = '服务器内部错误';
    let status = 500;

    if (error.message?.includes('请先在设置页面配置')) {
      errorMessage = error.message;
      status = 400;
    } else if (error.message?.includes('AI API 调用失败')) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
