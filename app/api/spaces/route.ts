import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { knowledgeItems: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: spaces,
    });
  } catch (error) {
    console.error("获取 Space 列表错误:", error);
    return NextResponse.json(
      { error: "获取 Space 列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, spaceType } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Space 名称不能为空" },
        { status: 400 }
      );
    }

    const space = await prisma.space.create({
      data: {
        name,
        description: description || null,
        spaceType: spaceType || "topic",
      },
    });

    return NextResponse.json({
      success: true,
      data: space,
    });
  } catch (error) {
    console.error("创建 Space 错误:", error);
    return NextResponse.json(
      { error: "创建 Space 失败" },
      { status: 500 }
    );
  }
}
