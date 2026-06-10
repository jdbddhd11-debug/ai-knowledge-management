"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Space {
  id: string;
  name: string;
  description: string | null;
  spaceType: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

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

export default function SpaceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [typeStats, setTypeStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSpaceType, setEditSpaceType] = useState("topic");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSpaceDetails();
    fetchSpaceItems();
  }, [spaceId]);

  const fetchSpaceDetails = async () => {
    try {
      const res = await fetch(`/api/spaces/${spaceId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "获取 Space 失败");
      }

      if (data.success) {
        setSpace(data.data);
        setEditName(data.data.name);
        setEditDescription(data.data.description || "");
        setEditSpaceType(data.data.spaceType);
      }
    } catch (err: any) {
      setError(err.message || "获取 Space 失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpaceItems = async () => {
    try {
      const res = await fetch(`/api/spaces/${spaceId}/items`);
      const data = await res.json();

      if (data.success) {
        setItems(data.data.items);
        setTypeStats(data.data.typeStats);
      }
    } catch (err) {
      console.error("获取知识列表失败:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      alert("Space 名称不能为空");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          spaceType: editSpaceType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSpace(data.data);
        setIsEditing(false);
        alert("更新成功！");
      } else {
        throw new Error(data.error || "更新失败");
      }
    } catch (err: any) {
      alert(err.message || "更新失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const itemCount = space?._count.items || 0;
    const message = itemCount > 0
      ? `确定要删除「${space?.name}」吗？\n\n该 Space 包含 ${itemCount} 条知识，删除后这些知识将不再关联到该 Space。`
      : `确定要删除「${space?.name}」吗？`;

    if (!confirm(message)) {
      return;
    }

    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("删除成功！");
        router.push("/");
      } else {
        throw new Error(data.error || "删除失败");
      }
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  };

  const getContentPreview = (content: string) => {
    const lines = content.split("\n");
    const preview = lines[0].length > 100 ? lines[0].slice(0, 100) + "..." : lines[0];
    return preview || "（无内容）";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeLabels: Record<string, string> = {
    arbitrary: "任意",
    opinion: "观点",
    process: "过程",
    procedure: "步骤",
    concrete: "具体",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Space 不存在"}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">Space 详情</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Space 信息卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {!isEditing ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {space.name}
                    </h2>
                    <p className="text-sm text-gray-500 mb-2">
                      类型：{space.spaceType} | 创建时间：{formatDate(space.createdAt)}
                    </p>
                    {space.description && (
                      <p className="text-gray-700 mt-3">{space.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={editSpaceType}
                    onChange={(e) => setEditSpaceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="topic">主题</option>
                    <option value="project">项目</option>
                    <option value="area">领域</option>
                    <option value="resource">资源</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isSaving ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(space.name);
                      setEditDescription(space.description || "");
                      setEditSpaceType(space.spaceType);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 统计信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">统计信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {items.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">总计</div>
              </div>
              {Object.entries(typeStats).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {typeLabels[type] || type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Link
              href={`/knowledge/new?spaceId=${spaceId}`}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              + 新建知识
            </Link>
          </div>

          {/* 知识列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              知识列表 ({items.length})
            </h3>
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无知识条目
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/knowledge/edit/${item.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {typeLabels[item.type] || item.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{getContentPreview(item.content)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
