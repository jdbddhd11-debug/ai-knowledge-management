import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const knowledgeSpaces = await prisma.knowledgeSpace.findMany({
      where: { spaceId: params.id },
      include: {
        knowledge: {
          include: {
            spaces: {
              include: {
                space: true,
              },
            },
          },
        },
      },
      orderBy: {
        knowledge: {
          createdAt: "desc",
        },
      },
    });

    const items = knowledgeSpaces.map((ks) => ({
      ...ks.knowledge,
      spaces: ks.knowledge.spaces.map((s) => s.space),
    }));

    // 统计各类型数量
    const typeStats = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        typeStats,
      },
    });
  } catch (error) {
    console.error("获取 Space 知识列表错误:", error);
    return NextResponse.json(
      { error: "获取知识列表失败" },
      { status: 500 }
    );
  }
}
