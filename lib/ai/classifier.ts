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

export async function classifyContent(
  content: string,
  contentType: string
): Promise<ClassificationResult> {
  const { getOpenAIClient, getAISettings } = await import("./client");
  const { CLASSIFICATION_SYSTEM_PROMPT, buildClassificationPrompt } = await import("../../prompts/classification");

  const openai = await getOpenAIClient();
  const aiSettings = await getAISettings();

  const completion = await openai.chat.completions.create({
    model: aiSettings.model,
    messages: [
      { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
      { role: "user", content: buildClassificationPrompt(content, contentType) }
    ],
    response_format: { type: "json_object" },
    temperature: aiSettings.temperature,
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");

  return {
    category: result.category as KnowledgeCategory,
    confidence: result.confidence || 0.8,
    reasoning: result.reasoning,
  };
}
