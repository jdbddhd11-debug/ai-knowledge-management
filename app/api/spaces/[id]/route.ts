import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const space = await prisma.space.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!space) {
      return NextResponse.json(
        { error: "Space 不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: space,
    });
  } catch (error) {
    console.error("获取 Space 详情错误:", error);
    return NextResponse.json(
      { error: "获取 Space 详情失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, spaceType } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Space 名称不能为空" },
        { status: 400 }
      );
    }

    const space = await prisma.space.update({
      where: { id: params.id },
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
    console.error("更新 Space 错误:", error);
    return NextResponse.json(
      { error: "更新 Space 失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 删除 Space（级联删除会自动将关联的 knowledgeItems 的 spaceId 设为 null）
    await prisma.space.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Space 删除成功",
    });
  } catch (error) {
    console.error("删除 Space 错误:", error);
    return NextResponse.json(
      { error: "删除 Space 失败" },
      { status: 500 }
    );
  }
}
