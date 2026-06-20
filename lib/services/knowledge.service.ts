import { PrismaClient } from "@prisma/client";

export interface CreateFromTextInput {
  userId: string;
  text: string;
  type?: string;
}

export interface AIClassificationResult {
  category: string;
  confidence: number;
  spaceIds?: string[];
}

export class KnowledgeService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a KnowledgeItem from text with AI classification.
   * This method NEVER throws due to AI failures - it always creates the item.
   */
  async createFromText(input: CreateFromTextInput) {
    // STEP 1: Call AI classification (must not throw)
    let aiResult: AIClassificationResult | null = null;
    try {
      aiResult = await this.classifyText(input.text);
    } catch (e) {
      console.warn("[KnowledgeService] AI classification failed, using fallback:", e);
      aiResult = null;
    }

    // STEP 2: Fallback logic with safe defaults
    const category = aiResult?.category ?? "uncategorized";
    const confidence = typeof aiResult?.confidence === "number" ? aiResult.confidence : 0;

    // STEP 3: Confidence gate - only use AI category if confidence >= 0.6
    const finalCategory = confidence >= 0.6 ? category : "uncategorized";

    // STEP 4: Create KnowledgeItem (single source of truth)
    const item = await this.prisma.knowledgeItem.create({
      data: {
        userId: input.userId,
        content: input.text,
        type: input.type ?? "text",
        category: finalCategory,
        confidence: confidence,
        createdAt: new Date(),
      },
    });

    // STEP 5: Optional space binding (only if AI suggests valid spaceIds)
    if (aiResult?.spaceIds?.length) {
      try {
        await this.attachSpaces(item.id, aiResult.spaceIds);
      } catch (e) {
        console.warn("[KnowledgeService] Failed to attach spaces:", e);
        // Continue - item is already created
      }
    }

    return item;
  }

  /**
   * Call internal AI classification endpoint.
   * Returns normalized result or throws on failure.
   */
  private async classifyText(text: string): Promise<AIClassificationResult> {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/classify-only`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });

    if (!response.ok) {
      throw new Error(`AI classification failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize response - handle different response structures
    return this.normalizeAIResponse(data);
  }

  /**
   * Normalize AI response to expected format.
   * Handles various response structures from the AI endpoint.
   */
  private normalizeAIResponse(data: any): AIClassificationResult {
    // Handle nested structure: { classification: { category, confidence }, spaceSuggestion }
    const classification = data.classification ?? data;

    const category = classification.category ?? "uncategorized";
    const confidence = typeof classification.confidence === "number"
      ? classification.confidence
      : 0;

    // Extract spaceIds if available (future enhancement)
    const spaceIds = data.spaceIds ?? data.spaceSuggestion?.spaceIds;

    return {
      category,
      confidence,
      spaceIds: Array.isArray(spaceIds) ? spaceIds : undefined,
    };
  }

  /**
   * Attach KnowledgeItem to multiple Spaces.
   * Creates relations in KnowledgeSpace junction table.
   */
  private async attachSpaces(itemId: string, spaceIds: string[]): Promise<void> {
    // Verify spaces exist before creating relations
    const validSpaces = await this.prisma.space.findMany({
      where: { id: { in: spaceIds } },
      select: { id: true },
    });

    const validSpaceIds = validSpaces.map((s) => s.id);

    // Create relations for valid spaces only
    for (const spaceId of validSpaceIds) {
      await this.prisma.knowledgeSpace.create({
        data: {
          knowledgeId: itemId,
          spaceId: spaceId,
        },
      });
    }
  }
}
