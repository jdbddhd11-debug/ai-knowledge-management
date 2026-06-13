"use client";

import { useState } from "react";

export interface Suggestion {
  id: string;
  title: string;
  suggestion: {
    suggestedSpaceName: string | null;
    spaceType: string | null;
    reason: string;
    confidence: number;
  } | null;
  error?: string;
}

interface SuggestionsModalProps {
  suggestions: Suggestion[];
  onClose: () => void;
  onApply: (selected: Array<{ knowledgeItemId: string; spaceName: string; spaceType: string }>) => void;
}

export function SuggestionsModal({ suggestions, onClose, onApply }: SuggestionsModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(
      suggestions
        .filter(s => s.suggestion?.suggestedSpaceName && s.suggestion.confidence >= 0.6)
        .map(s => s.id)
    )
  );

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleApply = () => {
    const toApply = suggestions
      .filter(s => selectedItems.has(s.id) && s.suggestion?.suggestedSpaceName)
      .map(s => ({
        knowledgeItemId: s.id,
        spaceName: s.suggestion!.suggestedSpaceName!,
        spaceType: s.suggestion!.spaceType || "KEYWORD",
      }));

    onApply(toApply);
  };

  const validSuggestions = suggestions.filter(s => s.suggestion?.suggestedSpaceName);
  const failedSuggestions = suggestions.filter(s => s.error || !s.suggestion?.suggestedSpaceName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">AI 归纳建议</h2>
          <p className="text-sm text-gray-600 mt-1">
            共 {suggestions.length} 项 · 成功 {validSuggestions.length} 项 · 失败 {failedSuggestions.length} 项
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {validSuggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">可用建议</h3>
              <div className="space-y-3">
                {validSuggestions.map((item) => {
                  const isSelected = selectedItems.has(item.id);
                  const confidence = item.suggestion!.confidence;
                  const confidenceColor =
                    confidence >= 0.8 ? "text-green-600" :
                    confidence >= 0.6 ? "text-yellow-600" :
                    "text-red-600";

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 h-4 w-4 text-blue-600 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {item.title || "无标题"}
                            </h4>
                            <span className={`text-xs font-medium ${confidenceColor}`}>
                              {(confidence * 100).toFixed(0)}% 置信度
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-600">推荐 Space:</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
                              {item.suggestion!.suggestedSpaceName}
                            </span>
                            {item.suggestion!.spaceType && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {item.suggestion!.spaceType}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.suggestion!.reason}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {failedSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">未能处理</h3>
              <div className="space-y-2">
                {failedSuggestions.map((item) => (
                  <div key={item.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {item.title || "无标题"}
                    </h4>
                    <p className="text-sm text-red-600">
                      {item.error || item.suggestion?.reason || "AI 未能生成有效建议"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            已选择 {selectedItems.size} 项
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={selectedItems.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              应用选中的建议
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
