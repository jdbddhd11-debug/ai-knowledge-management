"use client";

import { useState } from "react";
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
