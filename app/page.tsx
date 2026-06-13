"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { UploadForm } from "@/components/upload-form";
import { KnowledgeList } from "@/components/knowledge-list";
import { SuggestionsModal, Suggestion } from "@/components/suggestions-modal";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleAutoOrganize = async () => {
    if (!confirm('确定要对所有未分类知识进行批量归纳吗？\n\nAI 将为每个未分类的知识项推荐合适的 Space。')) return;

    setIsProcessing(true);
    try {
      // 获取所有未分类的知识
      const res = await fetch('/api/knowledge');
      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      const unorganized = data.data.items.filter((item: any) => !item.spaces || item.spaces.length === 0);

      if (unorganized.length === 0) {
        alert('没有未分类的知识项！所有知识都已归类。');
        return;
      }

      // 限制最多20条
      const toProcess = unorganized.slice(0, 20);
      if (unorganized.length > 20) {
        const confirmMsg = `找到 ${unorganized.length} 个未分类知识项，单次最多处理 20 条。\n\n将处理前 20 条，确定继续吗？`;
        if (!confirm(confirmMsg)) return;
      }

      // 开始处理
      const organizeRes = await fetch('/api/spaces/auto-organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: toProcess.map((item: any) => ({
            id: item.id,
            title: item.title || '',
            content: item.content
          }))
        })
      });

      const organizeData = await organizeRes.json();

      if (!organizeData.success) throw new Error(organizeData.error);

      // 转换为 Suggestion 格式
      const formattedSuggestions: Suggestion[] = organizeData.suggestions.map((s: any) => ({
        id: s.id,
        title: toProcess.find((item: any) => item.id === s.id)?.title || '无标题',
        suggestion: s.suggestion,
        error: s.error,
      }));

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('批量归纳失败:', error);
      alert(`批量归纳失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySuggestions = async (
    selected: Array<{ knowledgeItemId: string; spaceName: string; spaceType: string }>
  ) => {
    try {
      const res = await fetch('/api/spaces/apply-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestions: selected })
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      alert(
        `应用完成！\n\n` +
        `总数：${data.summary.total}\n` +
        `成功：${data.summary.success}\n` +
        `失败：${data.summary.failed}`
      );

      setSuggestions(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('应用建议失败:', error);
      alert(`应用建议失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 导航栏 */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/knowledge/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            <span>➕</span>
            <span>新建知识</span>
          </Link>

          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            <span>🏷️</span>
            <span>Space 管理</span>
          </Link>

          <button
            onClick={handleAutoOrganize}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>🤖</span>
            <span>{isProcessing ? '处理中...' : 'AI 批量归纳'}</span>
          </button>

          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FFB6C1] to-[#87CEEB] text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>API 设置</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传表单 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                添加知识
              </h2>
              <p className="text-gray-600 mb-6">
                输入内容，AI 将自动分类并保存
              </p>
              <UploadForm onSuccess={handleUploadSuccess} />
            </div>

            {/* 分类说明卡片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                五类信息说明
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">任意</span>
                  <p className="text-gray-600">无逻辑规律的随机事实（如首都、日期、名称）</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">观点</span>
                  <p className="text-gray-600">需要判断的主观信息（如信念、偏好）</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">过程</span>
                  <p className="text-gray-600">事物如何运作的信息（如解释、概念）</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">步骤</span>
                  <p className="text-gray-600">分步说明（如食谱、算法）</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">具体</span>
                  <p className="text-gray-600">可观察、可测量的事实（如数据、观察）</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：知识列表 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                我的知识库
              </h2>
              <KnowledgeList refresh={refreshKey} />
            </div>
          </div>
        </div>
      </main>

      {/* Suggestions Modal */}
      {suggestions && (
        <SuggestionsModal
          suggestions={suggestions}
          onClose={() => setSuggestions(null)}
          onApply={handleApplySuggestions}
        />
      )}
    </div>
  );
}
