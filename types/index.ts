import { Space as PrismaSpace, KnowledgeItem as PrismaKnowledgeItem } from '@prisma/client';

export type ContentType = "text" | "image" | "video" | "file";

export interface UploadInput {
  content: string;
  contentType: ContentType;
  metadata?: Record<string, unknown>;
}

// SpaceType 常量定义
export const SpaceType = {
  PROJECT: 'project',
  GOAL: 'goal',
  QUESTION: 'question',
  TOPIC: 'topic',
  KEYWORD: 'keyword',
} as const;

// SpaceType 类型
export type SpaceType = typeof SpaceType[keyof typeof SpaceType];

// Space 接口（扩展 Prisma 类型以包含类型约束）
export interface Space extends Omit<PrismaSpace, 'spaceType'> {
  spaceType: SpaceType;
}

// KnowledgeItem 基础接口
export type KnowledgeItem = PrismaKnowledgeItem;

// 带有 Space 关联的 KnowledgeItem 接口
export interface KnowledgeItemWithSpace extends KnowledgeItem {
  space: Space | null;
}

// 用于创建 Space 的输入类型
export interface CreateSpaceInput {
  name: string;
  description?: string;
  spaceType?: SpaceType;
}

// 用于更新 Space 的输入类型
export interface UpdateSpaceInput {
  name?: string;
  description?: string;
  spaceType?: SpaceType;
}

// 用于创建 KnowledgeItem 的输入类型（扩展）
export interface CreateKnowledgeItemInput {
  type: string;
  content: string;
  spaceId?: string;
}

// 用于更新 KnowledgeItem 的输入类型（扩展）
export interface UpdateKnowledgeItemInput {
  type?: string;
  content?: string;
  spaceId?: string | null;
}

// Space 推荐结果接口
export interface SpaceSuggestionResult {
  matchedSpaceId: string | null;
  confidence: number;
  reason: string;
}

// 自动整理建议接口
export interface AutoOrganizeSuggestion {
  suggestedName: string;
  suggestedType: SpaceType;
  matchedItemIds: string[];
  count: number;
  keywords?: string[];
  description?: string;
}
