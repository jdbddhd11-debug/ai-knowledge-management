import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 获取API设置
export async function GET() {
  try {
    const settings = await prisma.apiSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    if (!settings) {
      return NextResponse.json({
        proxyUrl: "",
        apiKey: "",
        model: "gpt-4o-mini",
        temperature: 0.7
      });
    }

    return NextResponse.json({
      id: settings.id,
      proxyUrl: settings.proxyUrl || "",
      apiKey: settings.apiKey,
      model: settings.model,
      temperature: settings.temperature
    });
  } catch (error: any) {
    console.error("读取设置失败:", error);
    return NextResponse.json(
      { error: "读取设置失败", details: error.message },
      { status: 500 }
    );
  }
}

// 保存API设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proxyUrl, apiKey, model, temperature } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API密钥不能为空" },
        { status: 400 }
      );
    }

    // 删除旧设置（只保留最新的一条）
    await prisma.apiSettings.deleteMany({});

    // 创建新设置
    const settings = await prisma.apiSettings.create({
      data: {
        proxyUrl: proxyUrl || null,
        apiKey,
        model: model || "gpt-4o-mini",
        temperature: temperature ?? 0.7
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        proxyUrl: settings.proxyUrl,
        model: settings.model,
        temperature: settings.temperature
      }
    });
  } catch (error: any) {
    console.error("保存设置失败:", error);
    return NextResponse.json(
      { error: "保存设置失败", details: error.message },
      { status: 500 }
    );
  }
}
