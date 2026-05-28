import { NextRequest, NextResponse } from "next/server";
import { classifyContent } from "@/lib/ai/classifier";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, contentType = "text" } = body;

    if (!content) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      );
    }

    const classification = await classifyContent(content, contentType);

    const knowledgeItem = await prisma.knowledgeItem.create({
      data: {
        type: classification.category,
        content: content,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: knowledgeItem.id,
        type: knowledgeItem.type,
        content: knowledgeItem.content,
        classification: {
          category: classification.category,
          confidence: classification.confidence,
          reasoning: classification.reasoning,
        },
      },
    });
  } catch (error) {
    console.error("分类错误:", error);
    return NextResponse.json(
      { error: "分类失败，请重试" },
      { status: 500 }
    );
  }
}
