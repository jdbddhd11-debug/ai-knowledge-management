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

// 修复格式错误的 JSON
function fixMalformedJSON(jsonStr: string): string {
  console.log('[Classifier] 尝试修复 JSON 格式');

  try {
    // 修复常见问题：缺少冒号和引号
    // 例如：{"categoryarbitrary","confidence":098} -> {"category":"arbitrary","confidence":0.98}

    let fixed = jsonStr;

    // 1. 修复 "categoryXXX" 格式（缺少冒号和引号）
    fixed = fixed.replace(/"category([a-z]+)"/gi, '"category":"$1"');

    // 2. 修复 "opinionXXX" 等其他可能的分类值粘连
    const categories = ['arbitrary', 'opinion', 'process', 'procedure', 'concrete'];
    categories.forEach(cat => {
      const regex = new RegExp(`"category(${cat})"`, 'gi');
      fixed = fixed.replace(regex, `"category":"${cat}"`);
    });

    // 3. 修复 confidence 值：:098 -> :0.98, :099 -> :0.99
    fixed = fixed.replace(/:0*(\d)(\d)/g, ':0.$1$2');

    // 4. 确保 confidence 值有引号（如果是字符串格式）
    fixed = fixed.replace(/"confidence":"?(\d\.?\d*)"?/g, '"confidence":$1');

    console.log('[Classifier] 修复后的 JSON:', fixed);
    return fixed;
  } catch (error) {
    console.error('[Classifier] JSON 修复失败:', error);
    return jsonStr;
  }
}

// 从文本中强制提取分类信息（最后手段）
function extractClassificationFields(text: string): ClassificationResult | null {
  console.log('[Classifier] 尝试强制提取字段');

  try {
    // 提取 category
    const categoryMatch = text.match(/"?category"?\s*:?\s*"?([a-z]+)"?/i);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : null;

    // 验证 category 是否有效
    const validCategories: KnowledgeCategory[] = ['arbitrary', 'opinion', 'process', 'procedure', 'concrete'];
    if (!category || !validCategories.includes(category as KnowledgeCategory)) {
      console.log('[Classifier] 未找到有效的 category');
      return null;
    }

    // 提取 confidence（支持多种格式：0.98, 098, "0.98"）
    const confidenceMatch = text.match(/"?confidence"?\s*:?\s*"?0?\.?(\d+)"?/i);
    let confidence = 0.5;
    if (confidenceMatch) {
      const rawValue = confidenceMatch[1];
      // 如果是 98 这样的格式，转换为 0.98
      if (rawValue.length === 2) {
        confidence = parseInt(rawValue) / 100;
      } else {
        confidence = parseFloat('0.' + rawValue);
      }
      // 确保在有效范围内
      confidence = Math.min(Math.max(confidence, 0), 1);
    }

    // 提取 reasoning（可选）
    const reasoningMatch = text.match(/"?reasoning"?\s*:?\s*"([^"]+)"/i);
    const reasoning = reasoningMatch ? reasoningMatch[1] : undefined;

    console.log('[Classifier] 强制提取成功:', { category, confidence, reasoning });

    return {
      category: category as KnowledgeCategory,
      confidence,
      reasoning
    };
  } catch (error) {
    console.error('[Classifier] 强制提取失败:', error);
    return null;
  }
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
      let jsonStr = extractJSON(aiContent);

      let result;
      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error(`[Classifier] JSON 解析失败 (第 ${attempt} 次):`, parseError);
        console.error('[Classifier] 尝试解析的内容:', jsonStr.substring(0, 200));

        // 尝试修复 JSON 格式
        const fixedJsonStr = fixMalformedJSON(jsonStr);
        try {
          result = JSON.parse(fixedJsonStr);
          console.log('[Classifier] JSON 修复后解析成功');
        } catch (fixError) {
          console.error('[Classifier] 修复后仍无法解析:', fixError);

          // 最后手段：强制提取字段
          const extracted = extractClassificationFields(aiContent);
          if (extracted) {
            console.log('[Classifier] 使用强制提取的结果');
            return extracted;
          }

          lastError = fixError;

          // 如果是第一次尝试失败，继续重试
          if (attempt === 1) {
            console.log('[Classifier] 将进行第二次尝试...');
            continue;
          }

          // 第二次也失败，返回默认值
          console.warn('[Classifier] 所有解析方法均失败，返回默认值');
          return {
            category: "arbitrary",
            confidence: 0.5,
            reasoning: "解析失败，使用默认分类"
          };
        }
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
