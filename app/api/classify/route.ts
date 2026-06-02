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
    } else if (error.code === "ENOTFOUND" || error.message?.includes("fetch")) {
      errorMessage = "网络连接失败";
      errorDetails = "无法连接到 API，请检查代理地址和网络连接";
    } else if (error.status === 401) {
      errorMessage = "API 认证失败";
      errorDetails = "API 密钥无效或已过期，请检查设置";
    } else if (error.status === 429) {
      errorMessage = "API 请求频率超限";
      errorDetails = "请稍后再试或升级 API 套餐";
    } else if (error.status === 500 || error.status === 503) {
      errorMessage = "API 服务异常";
      errorDetails = "API 服务暂时不可用，请稍后重试";
    } else if (error.message?.includes("Prisma") || error.message?.includes("database")) {
      errorMessage = "数据库保存失败";
      errorDetails = error.message || "请检查数据库连接";
    } else if (error.message) {
      errorMessage = "分类失败";
      errorDetails = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        type: error.code || error.status || "unknown"
      },
      { status: error.status || 500 }
    );
  }
}
