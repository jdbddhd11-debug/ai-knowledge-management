import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取当前用户 session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

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

    // 验证 Space 是否属于当前用户
    if (space.userId !== userId) {
      return NextResponse.json(
        { error: "无权访问此 Space" },
        { status: 403 }
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
    // 获取当前用户 session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, description, spaceType } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Space 名称不能为空" },
        { status: 400 }
      );
    }

    // 验证 Space 是否属于当前用户
    const existingSpace = await prisma.space.findUnique({
      where: { id: params.id },
    });

    if (!existingSpace || existingSpace.userId !== userId) {
      return NextResponse.json(
        { error: "无权修改此 Space" },
        { status: 403 }
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
    // 获取当前用户 session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 验证 Space 是否属于当前用户
    const existingSpace = await prisma.space.findUnique({
      where: { id: params.id },
    });

    if (!existingSpace || existingSpace.userId !== userId) {
      return NextResponse.json(
        { error: "无权删除此 Space" },
        { status: 403 }
      );
    }

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
