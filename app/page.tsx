"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { UploadForm } from "@/components/upload-form";
import { KnowledgeList } from "@/components/knowledge-list";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API设置快捷按钮 */}
        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FFB6C1] to-[#87CEEB] text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all"
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
    </div>
  );
}
