"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

interface Space {
  id: string;
  name: string;
  description: string | null;
  spaceType: string;
  createdAt: string;
  _count: {
    items: number;
  };
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: "",
    description: "",
    spaceType: "topic"
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/spaces');
      const data = await res.json();

      if (data.success) {
        setSpaces(data.data);
      }
    } catch (error) {
      console.error('获取 Space 列表失败:', error);
      alert('获取 Space 列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpace.name.trim()) {
      alert('请输入 Space 名称');
      return;
    }

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpace)
      });

      const data = await res.json();

      if (data.success) {
        setShowCreateModal(false);
        setNewSpace({ name: "", description: "", spaceType: "topic" });
        fetchSpaces();
        alert('创建成功！');
      } else {
        alert(`创建失败: ${data.error}`);
      }
    } catch (error) {
      console.error('创建 Space 失败:', error);
      alert('创建 Space 失败');
    }
  };

  const handleDeleteSpace = async (id: string, name: string) => {
    if (!confirm(`确定要删除 Space "${name}" 吗？\n\n删除后，该 Space 内的知识项不会被删除，但会变为未分类状态。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/spaces/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        alert('删除成功！');
        fetchSpaces();
      } else {
        alert(`删除失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除 Space 失败:', error);
      alert('删除 Space 失败');
    }
  };

  const getSpaceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      topic: "主题",
      project: "项目",
      category: "分类",
      archive: "归档"
    };
    return types[type] || type;
  };

  const getSpaceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      topic: "bg-blue-100 text-blue-800",
      project: "bg-green-100 text-green-800",
      category: "bg-purple-100 text-purple-800",
      archive: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Space 管理</h1>
            <p className="mt-2 text-gray-600">管理你的知识空间和分类</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
            >
              返回首页
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              ➕ 新建 Space
            </button>
          </div>
        </div>

        {/* Space 列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有 Space</h3>
            <p className="text-gray-600 mb-6">创建你的第一个 Space 来组织知识</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              ➕ 新建 Space
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <Link
                    href={`/spaces/${space.id}`}
                    className="flex-1"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {space.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => handleDeleteSpace(space.id, space.name)}
                    className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded transition-all"
                    title="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {space.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {space.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSpaceTypeColor(space.spaceType)}`}>
                    {getSpaceTypeLabel(space.spaceType)}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>{space._count.items} 项</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/spaces/${space.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 创建 Space 模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">新建 Space</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Space 名称 *
                </label>
                <input
                  type="text"
                  value={newSpace.name}
                  onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                  placeholder="例如：前端开发、项目A、学习笔记"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述（可选）
                </label>
                <textarea
                  value={newSpace.description}
                  onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                  placeholder="简要描述这个 Space 的用途"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型
                </label>
                <select
                  value={newSpace.spaceType}
                  onChange={(e) => setNewSpace({ ...newSpace, spaceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="topic">主题</option>
                  <option value="project">项目</option>
                  <option value="category">分类</option>
                  <option value="archive">归档</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSpace({ name: "", description: "", spaceType: "topic" });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleCreateSpace}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
