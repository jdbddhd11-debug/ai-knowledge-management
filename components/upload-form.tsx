"use client";

import { useState } from "react";

export function UploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          contentType: "text",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "分类失败");
      }

      setResult(data);
      setContent("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            输入知识内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入你想保存的知识点..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={6}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "分类中..." : "提交并分类"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">分类成功！</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p><span className="font-medium">分类:</span> {result.data.classification.category}</p>
            <p><span className="font-medium">置信度:</span> {(result.data.classification.confidence * 100).toFixed(0)}%</p>
            {result.data.classification.reasoning && (
              <p><span className="font-medium">原因:</span> {result.data.classification.reasoning}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
