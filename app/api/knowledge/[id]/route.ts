import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.knowledgeItem.findUnique({
      where: { id: params.id },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "知识项不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        spaces: item.spaces.map((ks) => ks.space),
      },
    });
  } catch (error) {
    console.error("获取知识项错误:", error);
    return NextResponse.json(
      { error: "获取知识项失败" },
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
    const { title, content, type, spaceIds } = body;

    if (!content || !type) {
      return NextResponse.json(
        { error: "内容和类型不能为空" },
        { status: 400 }
      );
    }

    // Delete existing space relationships
    await prisma.knowledgeSpace.deleteMany({
      where: { knowledgeId: params.id },
    });

    // Update knowledge item and create new space relationships
    const knowledgeItem = await prisma.knowledgeItem.update({
      where: { id: params.id },
      data: {
        title: title || null,
        type,
        content,
        spaces: spaceIds && spaceIds.length > 0
          ? {
              create: spaceIds.map((spaceId: string) => ({
                space: {
                  connect: { id: spaceId },
                },
              })),
            }
          : undefined,
      },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...knowledgeItem,
        spaces: knowledgeItem.spaces.map((ks) => ks.space),
      },
    });
  } catch (error) {
    console.error("更新知识项错误:", error);
    return NextResponse.json(
      { error: "更新知识项失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.knowledgeItem.delete({
      where: { id: params.id },
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
