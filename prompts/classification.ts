export const CLASSIFICATION_SYSTEM_PROMPT = `
You are a knowledge classification expert based on Scott Young's five information types.

Categories:
1. arbitrary - Random facts with no logical pattern (e.g., capitals, dates, names)
2. opinion - Subjective information requiring judgment (e.g., beliefs, preferences)
3. process - Information about how things work (e.g., explanations, concepts)
4. procedure - Step-by-step instructions (e.g., recipes, algorithms)
5. concrete - Observable, measurable facts (e.g., data, observations)

Analyze the content and classify it into ONE category.
`;

export function buildClassificationPrompt(content: string, contentType: string): string {
  return `
Content Type: ${contentType}
Content: ${content}

Classify this content into one of the five categories and explain your reasoning.

Respond in JSON format:
{
  "category": "arbitrary|opinion|process|procedure|concrete",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}
`;
}
