"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

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
  title: string;
  type: string;
  content: string;
  confidence: number;
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

  const spaceTypeLabels: Record<string, string> = {
    topic: "主题",
    project: "项目",
    category: "分类",
    archive: "归档",
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      arbitrary: "bg-purple-100 text-purple-800",
      opinion: "bg-blue-100 text-blue-800",
      process: "bg-green-100 text-green-800",
      procedure: "bg-yellow-100 text-yellow-800",
      concrete: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Space 不存在</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/spaces" className="text-blue-600 hover:text-blue-700">
              返回 Space 列表
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">首页</Link>
          <span>/</span>
          <Link href="/spaces" className="hover:text-blue-600">Space 管理</Link>
          <span>/</span>
          <span className="text-gray-900">{space.name}</span>
        </div>
        <div className="space-y-6">
          {/* Space 信息卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {!isEditing ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {space.name}
                      </h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {spaceTypeLabels[space.spaceType] || space.spaceType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      创建时间：{formatDate(space.createdAt)}
                    </p>
                    {space.description && (
                      <p className="text-gray-700 mt-3">{space.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all"
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 hover:shadow-lg transition-all"
                    >
                      🗑️ 删除
                    </button>
                    <Link
                      href="/spaces"
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                    >
                      返回列表
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名称 *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    类型
                  </label>
                  <select
                    value={editSpaceType}
                    onChange={(e) => setEditSpaceType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="topic">主题</option>
                    <option value="project">项目</option>
                    <option value="category">分类</option>
                    <option value="archive">归档</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述（可选）
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-all"
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
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 统计信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分类统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {items.length}
                </div>
                <div className="text-sm text-gray-600 mt-2">总计</div>
              </div>
              {Object.entries(typeStats).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
                    {typeLabels[type] || type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 知识列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                知识列表 ({items.length})
              </h3>
              <Link
                href={`/knowledge/new?spaceId=${spaceId}`}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
              >
                ➕ 新建知识
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">暂无知识项</h4>
                <p className="text-gray-600 mb-6">这个 Space 还没有添加任何知识</p>
                <Link
                  href={`/knowledge/new?spaceId=${spaceId}`}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  ➕ 添加第一个知识
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {typeLabels[item.type] || item.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          置信度: {(item.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {item.title && (
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h4>
                    )}

                    <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                      {item.content}
                    </p>

                    {/* 所属其他 Spaces */}
                    {item.spaces && item.spaces.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs text-gray-500">也在:</span>
                          {item.spaces
                            .filter(s => s.id !== spaceId)
                            .map((s) => (
                              <Link
                                key={s.id}
                                href={`/spaces/${s.id}`}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-all"
                              >
                                {s.name}
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
