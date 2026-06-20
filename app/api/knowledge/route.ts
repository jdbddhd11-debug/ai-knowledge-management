import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { KnowledgeService } from "@/lib/services/knowledge.service";

export async function GET() {
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

    const items = await prisma.knowledgeItem.findMany({
      where: {
        userId: userId,
      },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to include spaces array directly
    const transformedItems = items.map((item) => ({
      ...item,
      spaces: item.spaces.map((ks) => ks.space),
    }));

    const groupedByType = transformedItems.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, typeof transformedItems>);

    // Group by Space (many-to-many aware)
    const groupedBySpace = transformedItems.reduce((acc, item) => {
      if (item.spaces.length === 0) {
        // Items without any Space go to "未分类"
        const spaceKey = "未分类";
        if (!acc[spaceKey]) {
          acc[spaceKey] = {
            space: null,
            items: [],
          };
        }
        // Avoid duplicates within the same group
        if (!acc[spaceKey].items.find(i => i.id === item.id)) {
          acc[spaceKey].items.push(item);
        }
      } else {
        // Items with Spaces appear in each Space group
        item.spaces.forEach((space) => {
          if (!acc[space.id]) {
            acc[space.id] = {
              space: space,
              items: [],
            };
          }
          // Avoid duplicates within the same Space group
          if (!acc[space.id].items.find(i => i.id === item.id)) {
            acc[space.id].items.push(item);
          }
        });
      }
      return acc;
    }, {} as Record<string, { space: any; items: typeof transformedItems }>);

    return NextResponse.json({
      success: true,
      data: {
        items: transformedItems,
        groupedByType,
        groupedBySpace,
        total: transformedItems.length,
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

export async function POST(request: Request) {
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
    const { title, content, type, spaceIds } = body;

    if (!content) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      );
    }

    // Use KnowledgeService for stable creation pipeline
    const knowledgeService = new KnowledgeService(prisma);

    const knowledgeItem = await knowledgeService.createFromText({
      userId,
      text: content,
      type: type || "text",
    });

    // Fetch the complete item with relations
    const itemWithSpaces = await prisma.knowledgeItem.findUnique({
      where: { id: knowledgeItem.id },
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
        ...itemWithSpaces,
        spaces: itemWithSpaces?.spaces.map((ks) => ks.space) ?? [],
      },
    });
  } catch (error) {
    console.error("创建知识项错误:", error);
    return NextResponse.json(
      { error: "创建知识项失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少 ID 参数" },
        { status: 400 }
      );
    }

    // 验证知识项是否属于当前用户
    const item = await prisma.knowledgeItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== userId) {
      return NextResponse.json(
        { error: "无权删除此知识项" },
        { status: 403 }
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
