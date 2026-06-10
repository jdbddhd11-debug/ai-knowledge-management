"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface KnowledgeItem {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  spaces: {
    id: string;
    name: string;
    spaceType: string;
  }[];
}

interface SpaceGroup {
  space: {
    id: string;
    name: string;
    spaceType: string;
  } | null;
  items: KnowledgeItem[];
}

const categoryLabels: Record<string, string> = {
  arbitrary: "任意信息",
  opinion: "观点意见",
  process: "过程原理",
  procedure: "步骤流程",
  concrete: "具体事实",
};

const categoryColors: Record<string, string> = {
  arbitrary: "bg-purple-100 text-purple-800 border-purple-200",
  opinion: "bg-blue-100 text-blue-800 border-blue-200",
  process: "bg-green-100 text-green-800 border-green-200",
  procedure: "bg-yellow-100 text-yellow-800 border-yellow-200",
  concrete: "bg-red-100 text-red-800 border-red-200",
};

export function KnowledgeList({ refresh }: { refresh?: number }) {
  const [groupedBySpace, setGroupedBySpace] = useState<Record<string, SpaceGroup>>({});
  const [viewMode, setViewMode] = useState<"space" | "type">("space");
  const [groupedByType, setGroupedByType] = useState<Record<string, KnowledgeItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchKnowledge();
  }, [refresh]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/knowledge");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取失败");
      }

      setGroupedBySpace(data.data.groupedBySpace);
      setGroupedByType(data.data.groupedByType);
      setError("");
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条知识吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "删除失败");
      }

      await fetchKnowledge();
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  const spaceKeys = Object.keys(groupedBySpace);
  const typeKeys = Object.keys(groupedByType);

  if (spaceKeys.length === 0 && typeKeys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        还没有保存任何知识点，快去添加吧！
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 视图切换 */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setViewMode("space")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            viewMode === "space"
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          按 Space
        </button>
        <button
          onClick={() => setViewMode("type")}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            viewMode === "type"
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          按类型
        </button>
      </div>

      {/* Space 视图 */}
      {viewMode === "space" && (
        <div className="space-y-6">
          {spaceKeys.map((spaceKey) => {
            const group = groupedBySpace[spaceKey];
            const isUncategorized = spaceKey === "未分类";

            return (
              <div key={spaceKey} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {isUncategorized ? (
                    <>
                      <span className="text-gray-600">未分类</span>
                      <span className="text-sm text-gray-500">({group.items.length})</span>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/spaces/${group.space?.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {group.space?.name}
                      </Link>
                      <span className="text-sm text-gray-500">({group.items.length})</span>
                    </>
                  )}
                </h3>
                <div className="grid gap-3">
                  {group.items.map((item) => {
                    // Find other Spaces this item belongs to (excluding current Space)
                    const otherSpaces = item.spaces.filter(s =>
                      isUncategorized ? false : s.id !== group.space?.id
                    );

                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${categoryColors[item.type] || "bg-gray-100 text-gray-800"}`}>
                                {categoryLabels[item.type] || item.type}
                              </span>
                              {/* Show other Spaces this item belongs to */}
                              {otherSpaces.length > 0 && (
                                <>
                                  <span className="text-xs text-gray-400">|</span>
                                  <div className="flex flex-wrap gap-1">
                                    {otherSpaces.map((space) => (
                                      <Link
                                        key={space.id}
                                        href={`/spaces/${space.id}`}
                                        className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 hover:text-gray-800"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        📁 {space.name}
                                      </Link>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                            <Link
                              href={`/knowledge/edit/${item.id}`}
                              className="text-gray-800 whitespace-pre-wrap hover:text-blue-600 block"
                            >
                              {item.content}
                            </Link>
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300"
                            title="删除"
                          >
                            删除
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 类型视图 */}
      {viewMode === "type" && (
        <div className="space-y-6">
          {typeKeys.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[category] || "bg-gray-100 text-gray-800"}`}>
                  {categoryLabels[category] || category}
                </span>
                <span className="text-sm text-gray-500">({groupedByType[category].length})</span>
              </h3>
              <div className="grid gap-3">
                {groupedByType[category].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        {item.spaces && item.spaces.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.spaces.map((space) => (
                              <Link
                                key={space.id}
                                href={`/spaces/${space.id}`}
                                className="inline-block px-2 py-1 bg-gray-100 text-xs text-blue-600 hover:bg-gray-200 hover:text-blue-800 rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📁 {space.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        <Link
                          href={`/knowledge/edit/${item.id}`}
                          className="text-gray-800 whitespace-pre-wrap hover:text-blue-600 block"
                        >
                          {item.content}
                        </Link>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200 hover:border-red-300"
                        title="删除"
                      >
                        删除
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
