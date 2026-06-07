import { SPACE_SUGGESTION_SYSTEM_PROMPT, SPACE_SUGGESTION_USER_PROMPT } from '@/prompts/space-suggestion';
import { callAI } from './client';

export interface SpaceSuggestion {
  suggestedSpaceName: string | null;
  spaceType: 'PROJECT' | 'GOAL' | 'QUESTION' | 'LEARNING_TOPIC' | 'KEYWORD' | null;
  reason: string;
  confidence: number;
}

// 提取 JSON 内容的辅助函数
function extractJSON(text: string): string {
  console.log('[SpaceSuggester] AI 原始返回:', text);

  let jsonStr = text.trim();

  // 1. 尝试匹配 ```json ... ``` 代码块
  const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    jsonStr = jsonBlockMatch[1].trim();
    console.log('[SpaceSuggester] 从代码块提取 JSON');
  }

  // 2. 如果没有代码块，尝试找到第一个 { 和最后一个 }
  if (!jsonStr.startsWith('{')) {
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      console.log('[SpaceSuggester] 从文本中提取 JSON');
    }
  }

  console.log('[SpaceSuggester] 提取后的 JSON:', jsonStr);
  return jsonStr;
}

export async function suggestSpace(
  content: string,
  title?: string
): Promise<SpaceSuggestion> {
  const defaultResult: SpaceSuggestion = {
    suggestedSpaceName: null,
    spaceType: null,
    reason: 'Unable to analyze content',
    confidence: 0,
  };

  try {
    const aiContent = await callAI(
      [
        { role: 'system', content: SPACE_SUGGESTION_SYSTEM_PROMPT },
        { role: 'user', content: SPACE_SUGGESTION_USER_PROMPT(title || 'Untitled', content) },
      ],
      { temperature: 0.3 }
    );

    if (!aiContent) {
      console.error('[SpaceSuggester] No content in AI response');
      return defaultResult;
    }

    // 提取并解析 JSON
    const jsonStr = extractJSON(aiContent);

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (error) {
      console.error('[SpaceSuggester] JSON 解析失败:', error);
      console.error('[SpaceSuggester] 尝试解析的内容:', jsonStr.substring(0, 200));
      return defaultResult;
    }

    return {
      suggestedSpaceName: parsed.suggestedSpaceName || null,
      spaceType: parsed.spaceType || null,
      reason: parsed.reason || 'AI suggested',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    };
  } catch (error) {
    console.error('[SpaceSuggester] suggestSpace error:', error);
    return defaultResult;
  }
}
