# AI Knowledge Management

基于斯科特扬《如何高效学习》五类信息分类法的 AI 知识管理系统。

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- OpenAI API

## 五类信息分类

1. **arbitrary** - 任意信息：无逻辑关联的随机事实
2. **opinion** - 观点信息：需要主观判断的信息
3. **process** - 过程信息：解释事物如何运作
4. **procedure** - 程序信息：分步骤的操作指南
5. **concrete** - 具体信息：可观察、可测量的事实

## 项目结构

```
├── app/
│   ├── api/          # API 路由
│   ├── globals.css   # 全局样式
│   ├── layout.tsx    # 根布局
│   └── page.tsx      # 首页
├── components/       # React 组件
├── lib/
│   ├── ai/          # AI 相关代码
│   └── db.ts        # 数据库客户端
├── prisma/          # 数据库 schema
└── prompts/         # AI prompts
```

## 开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 初始化数据库
npx prisma migrate dev

# 启动开发服务器
npm run dev
```
