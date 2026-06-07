import { NextRequest, NextResponse } from "next/server";
import { classifyContent } from "@/lib/ai/classifier";
import { suggestSpace } from "@/lib/ai/space-suggester";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title } = body;

    if (!content) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      );
    }

    // 分类内容
    const classification = await classifyContent(content, "text");

    // 推荐 Space
    const spaceSuggestion = await suggestSpace(content, title);

    return NextResponse.json({
      success: true,
      classification: {
        category: classification.category,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      },
      spaceSuggestion: {
        suggestedSpaceName: spaceSuggestion.suggestedSpaceName,
        spaceType: spaceSuggestion.spaceType,
        reason: spaceSuggestion.reason,
        confidence: spaceSuggestion.confidence,
      },
    });
  } catch (error: any) {
    console.error("分类错误:", error);

    let errorMessage = "分类失败，请重试";
    let errorDetails = "";

    if (error.message?.includes("请先在设置页面配置")) {
      errorMessage = "API 未配置";
      errorDetails = "请先在设置页面配置 API 信息";
    } else if (error.message?.includes("API key")) {
      errorMessage = "API 密钥配置错误";
      errorDetails = "请检查设置页面中的 API 密钥是否正确";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: error.status || 500 }
    );
  }
}
