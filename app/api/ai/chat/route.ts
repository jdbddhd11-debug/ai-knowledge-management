import { NextRequest, NextResponse } from 'next/server';

const AI_PROXY_URL = 'https://openclaw-api.com/v1/chat/completions';
const AI_API_KEY = 'sk-eu3YhZOi3Cr2Pu8rF9wjYeUHAPGelvBZZHCnu2neVQ00SMhA';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, temperature = 0.7, model = 'gpt-5.4-mini' } = body;

    const response = await fetch(AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Proxy error:', response.status, error);
      return NextResponse.json(
        { error: `AI API 调用失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content || data.response;

    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回内容为空' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
