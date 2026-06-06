import { SPACE_SUGGESTION_SYSTEM_PROMPT, SPACE_SUGGESTION_USER_PROMPT } from '@/prompts/space-suggestion';

export interface SpaceSuggestion {
  suggestedSpaceName: string | null;
  spaceType: 'PROJECT' | 'GOAL' | 'QUESTION' | 'LEARNING_TOPIC' | 'KEYWORD' | null;
  reason: string;
  confidence: number;
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
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SPACE_SUGGESTION_SYSTEM_PROMPT },
          { role: 'user', content: SPACE_SUGGESTION_USER_PROMPT(title || 'Untitled', content) },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return defaultResult;
    }

    const data = await response.json();
    const aiContent = data.content;

    if (!aiContent) {
      console.error('No content in AI response:', data);
      return defaultResult;
    }

    // 提取 JSON（AI 可能返回带 markdown 代码块的）
    let jsonStr = aiContent.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    return {
      suggestedSpaceName: parsed.suggestedSpaceName || null,
      spaceType: parsed.spaceType || null,
      reason: parsed.reason || 'AI suggested',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    };
  } catch (error) {
    console.error('suggestSpace error:', error);
    return defaultResult;
  }
}
