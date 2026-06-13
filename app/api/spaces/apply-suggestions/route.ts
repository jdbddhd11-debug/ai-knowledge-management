import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 验证用户登录
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { suggestions } = await req.json();

    if (!suggestions || !Array.isArray(suggestions)) {
      return NextResponse.json(
        { error: "suggestions 参数必须是数组" },
        { status: 400 }
      );
    }

    if (suggestions.length === 0) {
      return NextResponse.json({
        success: true,
        applied: [],
        message: "没有需要应用的建议",
      });
    }

    const results = [];

    for (const suggestion of suggestions) {
      const { knowledgeItemId, spaceName, spaceType } = suggestion;

      if (!knowledgeItemId || !spaceName) {
        results.push({
          knowledgeItemId,
          success: false,
          error: "缺少必要参数",
        });
        continue;
      }

      try {
        // 验证知识项是否属于当前用户
        const knowledgeItem = await prisma.knowledgeItem.findUnique({
          where: { id: knowledgeItemId },
        });

        if (!knowledgeItem || knowledgeItem.userId !== userId) {
          results.push({
            knowledgeItemId,
            success: false,
            error: "无权操作此知识项",
          });
          continue;
        }

        // 查找或创建 Space
        let space = await prisma.space.findFirst({
          where: {
            name: spaceName,
            userId: userId,
          },
        });

        if (!space) {
          space = await prisma.space.create({
            data: {
              name: spaceName,
              spaceType: spaceType || "KEYWORD",
              userId: userId,
            },
          });
        }

        // 检查是否已经关联
        const existingRelation = await prisma.knowledgeSpace.findUnique({
          where: {
            knowledgeId_spaceId: {
              knowledgeId: knowledgeItemId,
              spaceId: space.id,
            },
          },
        });

        if (!existingRelation) {
          // 创建多对多关联
          await prisma.knowledgeSpace.create({
            data: {
              knowledgeId: knowledgeItemId,
              spaceId: space.id,
            },
          });
        }

        results.push({
          knowledgeItemId,
          success: true,
          spaceId: space.id,
          spaceName: space.name,
          created: !existingRelation,
        });
      } catch (error) {
        console.error(`应用建议失败 (knowledgeItemId: ${knowledgeItemId}):`, error);
        results.push({
          knowledgeItemId,
          success: false,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: suggestions.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error("应用建议错误:", error);
    return NextResponse.json(
      {
        error: "应用建议失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
