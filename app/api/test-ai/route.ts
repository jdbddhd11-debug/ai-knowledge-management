import { NextResponse } from "next/server";
import { getOpenAIClient, getAISettings } from "@/lib/ai/client";

export async function GET() {
  try {
    // 尝试获取客户端和配置
    const client = await getOpenAIClient();
    const settings = await getAISettings();

    // 使用流式请求（因为中转站强制返回流式）
    const stream = await client.chat.completions.create({
      model: settings.model,
      messages: [
        {
          role: "user",
          content: "Reply with only the word 'OK'",
        },
      ],
      temperature: 0,
      max_tokens: 10,
      stream: true,
    });

    // 收集流式响应
    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
    }

    if (!fullResponse.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "AI 返回内容为空",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "配置正常",
      details: {
        model: settings.model,
        temperature: settings.temperature,
        testResponse: fullResponse.trim(),
      },
    });
  } catch (error) {
    console.error("AI 配置测试失败:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
