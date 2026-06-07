import { callAI } from "./client";
import { CLASSIFICATION_SYSTEM_PROMPT, buildClassificationPrompt } from "@/prompts/classification";

export type KnowledgeCategory =
  | "arbitrary"
  | "opinion"
  | "process"
  | "procedure"
  | "concrete";

export interface ClassificationResult {
  category: KnowledgeCategory;
  confidence: number;
  reasoning?: string;
}

// 提取 JSON 内容的辅助函数
function extractJSON(text: string): string {
  console.log('[Classifier] AI 原始返回:', text);

  let jsonStr = text.trim();

  // 1. 尝试匹配 ```json ... ``` 代码块
  const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    jsonStr = jsonBlockMatch[1].trim();
    console.log('[Classifier] 从代码块提取 JSON');
  }

  // 2. 如果没有代码块，尝试找到第一个 { 和最后一个 }
  if (!jsonStr.startsWith('{')) {
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      console.log('[Classifier] 从文本中提取 JSON');
    }
  }

  console.log('[Classifier] 提取后的 JSON:', jsonStr);
  return jsonStr;
}

export async function classifyContent(
  content: string,
  contentType: string
): Promise<ClassificationResult> {
  let lastError: any = null;

  // 尝试最多 2 次
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[Classifier] 尝试分类 (第 ${attempt} 次)`);

      const aiContent = await callAI(
        [
          { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
          { role: "user", content: buildClassificationPrompt(content, contentType) }
        ],
        { responseFormat: 'json' }
      );

      // 提取并解析 JSON
      const jsonStr = extractJSON(aiContent);

      let result;
      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error(`[Classifier] JSON 解析失败 (第 ${attempt} 次):`, parseError);
        console.error('[Classifier] 尝试解析的内容:', jsonStr.substring(0, 200));
        lastError = parseError;

        // 如果是第一次尝试失败，继续重试
        if (attempt === 1) {
          console.log('[Classifier] 将进行第二次尝试...');
          continue;
        }
        throw new Error('AI 返回的分类结果格式错误');
      }

      // 验证结果字段
      if (!result.category) {
        console.error('[Classifier] 缺少 category 字段:', result);
        lastError = new Error('缺少 category 字段');
        if (attempt === 1) continue;
        throw new Error('AI 返回的分类结果缺少必要字段');
      }

      console.log('[Classifier] 分类成功:', result);
      return {
        category: result.category as KnowledgeCategory,
        confidence: result.confidence || 0.8,
        reasoning: result.reasoning,
      };
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        console.log('[Classifier] 第一次尝试失败，准备重试...');
        continue;
      }
    }
  }

  // 两次都失败了，抛出错误
  console.error('[Classifier] 两次尝试均失败');
  throw lastError || new Error('分类失败');
}
