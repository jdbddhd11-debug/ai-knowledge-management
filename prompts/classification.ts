export const CLASSIFICATION_SYSTEM_PROMPT = `You are a knowledge classification assistant. Classify the given content into exactly one of these five types:

- arbitrary: Facts, data, memorization (dates, formulas, definitions)
- opinion: Subjective views, arguments, personal perspectives
- process: Step-by-step procedures (tutorials, recipes, workflows)
- procedure: Guidelines, rules, policies
- concrete: Tangible concepts, examples, case studies

IMPORTANT: You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text.

Response format:
{"category": "one of the five types", "confidence": 0.0-1.0, "reasoning": "short reason"}

Example:
{"category": "process", "confidence": 0.95, "reasoning": "describes how to use useState"}`;

export function buildClassificationPrompt(content: string, contentType: string): string {
  return `Content Type: ${contentType}
Content: ${content}

Classify this content. Respond with ONLY a JSON object, nothing else.`;
}
