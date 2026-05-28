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
  // TODO: Implement AI classification
  throw new Error("Not implemented");
}
