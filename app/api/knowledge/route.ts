import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.knowledgeItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const groupedByType = items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    return NextResponse.json({
      success: true,
      data: {
        items,
        groupedByType,
        total: items.length,
      },
    });
  } catch (error) {
    console.error("获取知识列表错误:", error);
    return NextResponse.json(
      { error: "获取知识列表失败" },
      { status: 500 }
    );
  }
}
