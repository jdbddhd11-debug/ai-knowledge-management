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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少 ID 参数" },
        { status: 400 }
      );
    }

    await prisma.knowledgeItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除知识项错误:", error);
    return NextResponse.json(
      { error: "删除失败" },
      { status: 500 }
    );
  }
}
