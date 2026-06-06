import { NextRequest, NextResponse } from "next/server";
import { suggestSpace } from "@/lib/ai/space-suggester";

export async function POST(req: NextRequest) {
  try {
    const { entries } = await req.json();

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "entries 参数必须是数组" },
        { status: 400 }
      );
    }

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: "没有需要整理的知识项",
      });
    }

    // 为每个 entry 获取 Space 建议
    const suggestions = await Promise.all(
      entries.map(async (entry) => {
        const { id, title, content } = entry;

        if (!content) {
          return {
            id,
            suggestion: null,
            error: "内容为空",
          };
        }

        try {
          const spaceSuggestion = await suggestSpace(content, title);

          return {
            id,
            suggestion: {
              suggestedSpaceName: spaceSuggestion.suggestedSpaceName,
              spaceType: spaceSuggestion.spaceType,
              reason: spaceSuggestion.reason,
              confidence: spaceSuggestion.confidence,
            },
          };
        } catch (error) {
          console.error(`处理 entry ${id} 时出错:`, error);
          return {
            id,
            suggestion: null,
            error: error instanceof Error ? error.message : "处理失败",
          };
        }
      })
    );

    // 统计结果
    const successCount = suggestions.filter((s) => s.suggestion !== null).length;
    const failCount = suggestions.filter((s) => s.error).length;

    return NextResponse.json({
      success: true,
      suggestions,
      summary: {
        total: entries.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error("批量整理错误:", error);
    return NextResponse.json(
      {
        error: "批量整理失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
