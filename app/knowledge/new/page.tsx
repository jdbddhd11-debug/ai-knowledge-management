"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Space {
  id: string;
  name: string;
  description: string | null;
  spaceType: string;
  _count?: {
    items: number;
  };
}

function NewKnowledgeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("");
  const [spaceIds, setSpaceIds] = useState<string[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showNewSpaceDialog, setShowNewSpaceDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceType, setNewSpaceType] = useState("topic");
  const [newSpaceDescription, setNewSpaceDescription] = useState("");

  // 加载 Spaces 并处理 URL 参数
  useEffect(() => {
    fetchSpaces();

    // 从 URL 参数中获取 spaceId 并自动选中
    const urlSpaceId = searchParams.get("spaceId");
    if (urlSpaceId) {
      setSpaceIds([urlSpaceId]);
    }
  }, [searchParams]);

  const fetchSpaces = async () => {
    try {
      const response = await fetch("/api/spaces");
      const data = await response.json();
      if (data.success) {
        setSpaces(data.data);
      }
    } catch (error) {
      console.error("加载 Spaces 失败:", error);
    }
  };

  // AI 智能分类
  const handleAIClassify = async () => {
    if (!content.trim()) {
      alert("请先输入内容");
      return;
    }

    setIsClassifying(true);
    try {
      const response = await fetch("/api/classify-only", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "分类失败");
      }

      if (data.success) {
        // 自动填充分类 - API 直接返回 classification
        if (data.classification?.category) {
          setType(data.classification.category);
        }

        // 如果 AI 推荐了 Space 且置信度高，自动选中或提示创建
        if (data.spaceSuggestion && data.spaceSuggestion.confidence > 0.7) {
          const suggestedName = data.spaceSuggestion.suggestedSpaceName;

          // 查找是否已存在该 Space
          const existingSpace = spaces.find(
            (s) => s.name.toLowerCase() === suggestedName.toLowerCase()
          );

          if (existingSpace) {
            const shouldAdd = confirm(
              `✨ AI 推荐添加 Space：「${suggestedName}」\n置信度：${(data.spaceSuggestion.confidence * 100).toFixed(0)}%\n原因：${data.spaceSuggestion.reason}\n\n是否添加该 Space？`
            );
            if (shouldAdd && !spaceIds.includes(existingSpace.id)) {
              setSpaceIds([...spaceIds, existingSpace.id]);
            }
          } else {
            const shouldCreate = confirm(
              `✨ AI 推荐创建新 Space：「${suggestedName}」\n类型：${data.spaceSuggestion.spaceType}\n原因：${data.spaceSuggestion.reason}\n\n是否创建并添加？`
            );
            if (shouldCreate) {
              setNewSpaceName(suggestedName);
              setNewSpaceType(data.spaceSuggestion.spaceType || "topic");
              setNewSpaceDescription(data.spaceSuggestion.reason || "");
              setShowNewSpaceDialog(true);
            }
          }
        } else {
          // 置信度不高，只显示分类结果
          alert(`✨ AI 分类完成！\n信息类型: ${data.classification.category}`);
        }
      }
    } catch (error: any) {
      alert(`分类失败: ${error.message}`);
    } finally {
      setIsClassifying(false);
    }
  };

  // 创建新 Space
  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      alert("请输入 Space 名称");
      return;
    }

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSpaceName,
          description: newSpaceDescription,
          spaceType: newSpaceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "创建 Space 失败");
      }

      if (data.success) {
        // 刷新 Spaces 列表
        await fetchSpaces();
        // 自动选中新创建的 Space
        setSpaceIds([data.data.id]);
        // 关闭对话框并重置
        setShowNewSpaceDialog(false);
        setNewSpaceName("");
        setNewSpaceType("topic");
        setNewSpaceDescription("");
        alert("Space 创建成功！");
      }
    } catch (error: any) {
      alert(`创建失败: ${error.message}`);
    }
  };

  // 保存知识项
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("请输入内容");
      return;
    }

    if (!type) {
      alert("请选择信息类型");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          type,
          spaceIds: spaceIds.length > 0 ? spaceIds : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存失败");
      }

      if (data.success) {
        alert("知识项保存成功！");
        router.push("/");
      }
    } catch (error: any) {
      alert(`保存失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              返回首页
            </Link>
            <h1 className="text-xl font-bold text-gray-900">添加知识</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题（可选）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入标题..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 内容 + AI 按钮 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  内容 *
                </label>
                <button
                  type="button"
                  onClick={handleAIClassify}
                  disabled={isClassifying || !content.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span>✨</span>
                  {isClassifying ? "分类中..." : "AI 分类"}
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入内容，支持 Markdown..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                支持 Markdown 格式
              </p>
            </div>

            {/* 信息类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信息类型 *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">请选择...</option>
                <option value="arbitrary">任意 - 无逻辑规律的随机事实</option>
                <option value="opinion">观点 - 需要判断的主观信息</option>
                <option value="process">过程 - 事物如何运作的信息</option>
                <option value="procedure">步骤 - 分步说明</option>
                <option value="concrete">具体 - 可观察、可测量的事实</option>
              </select>
            </div>

            {/* Space 选择 + 新建按钮 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Space（可选，可多选）
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewSpaceDialog(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span>+</span>
                  新建
                </button>
              </div>
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                {spaces.length === 0 ? (
                  <p className="text-sm text-gray-500">暂无 Space</p>
                ) : (
                  <div className="space-y-2">
                    {spaces.map((space) => (
                      <label
                        key={space.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={spaceIds.includes(space.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSpaceIds([...spaceIds, space.id]);
                            } else {
                              setSpaceIds(spaceIds.filter(id => id !== space.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">
                          {space.name} ({space.spaceType})
                          {space._count && ` - ${space._count.items} 项`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? "保存中..." : "保存"}
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* 新建 Space 对话框 */}
      {showNewSpaceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              新建 Space
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名称 *
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="例如：工作、学习、健康..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型
                </label>
                <select
                  value={newSpaceType}
                  onChange={(e) => setNewSpaceType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="topic">主题</option>
                  <option value="project">项目</option>
                  <option value="area">领域</option>
                  <option value="resource">资源</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述（可选）
                </label>
                <textarea
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  placeholder="简要描述这个 Space 的用途..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateSpace}
                  className="flex-1 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSpaceDialog(false);
                    setNewSpaceName("");
                    setNewSpaceType("topic");
                    setNewSpaceDescription("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewKnowledgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <NewKnowledgeForm />
    </Suspense>
  );
}

