"use client";

import { useEffect, useState } from "react";

interface KnowledgeItem {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
  const [groupedData, setGroupedData] = useState<Record<string, KnowledgeItem[]>>({});
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

      setGroupedData(data.data.groupedByType);
      setError("");
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
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

  const categories = Object.keys(groupedData);

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        还没有保存任何知识点，快去添加吧！
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${categoryColors[category] || "bg-gray-100 text-gray-800"}`}>
              {categoryLabels[category] || category}
            </span>
            <span className="text-sm text-gray-500">({groupedData[category].length})</span>
          </h3>
          <div className="grid gap-3">
            {groupedData[category].map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <p className="text-gray-800 whitespace-pre-wrap">{item.content}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
