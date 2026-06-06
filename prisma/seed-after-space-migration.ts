import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据迁移...');

  // 1. 创建默认主题 Space
  const defaultSpace = await prisma.space.create({
    data: {
      name: '默认主题',
      description: '用于存放迁移前的所有知识项',
    },
  });

  console.log(`✓ 创建默认主题 Space: ${defaultSpace.name} (ID: ${defaultSpace.id})`);

  // 2. 获取所有现有的 KnowledgeItem（spaceId 为 null 的）
  const existingItems = await prisma.knowledgeItem.findMany({
    where: {
      spaceId: null,
    },
  });

  console.log(`找到 ${existingItems.length} 条需要迁移的知识项`);

  // 3. 将所有现有知识项的 spaceId 更新为默认 Space 的 id
  const result = await prisma.knowledgeItem.updateMany({
    where: {
      spaceId: null,
    },
    data: {
      spaceId: defaultSpace.id,
    },
  });

  console.log(`✓ 成功更新 ${result.count} 条知识项到默认主题`);

  // 4. 验证迁移结果
  const unassignedCount = await prisma.knowledgeItem.count({
    where: {
      spaceId: null,
    },
  });

  if (unassignedCount === 0) {
    console.log('✓ 数据迁移完成！所有知识项都已分配到主题');
  } else {
    console.warn(`⚠ 警告：仍有 ${unassignedCount} 条知识项未分配主题`);
  }
}

main()
  .catch((e) => {
    console.error('迁移失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
