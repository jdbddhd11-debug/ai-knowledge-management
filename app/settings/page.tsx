"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [proxyUrl, setProxyUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [preset, setPreset] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setProxyUrl(data.proxyUrl || "");
        setApiKey(data.apiKey || "");
        setModel(data.model || "gpt-4o-mini");
        setTemperature(data.temperature ?? 0.7);
      }
    } catch (error) {
      console.error("加载设置失败:", error);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage("请输入API密钥");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proxyUrl: proxyUrl.trim() || null,
          apiKey: apiKey.trim(),
          model: model.trim() || "gpt-4o-mini",
          temperature
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("设置保存成功！");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "保存失败");
      }
    } catch (error) {
      setMessage("保存失败，请重试");
      console.error("保存设置失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 顶部导航 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-100/50 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="text-gray-600 hover:text-pink-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center text-xl font-semibold text-gray-800">API 设置</h1>
          <div className="w-6"></div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-8">
          {/* 顶部标题 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full">
              <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#FFB6C1]">API 连接</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 h-[2px] border-t-2 border-dashed border-pink-200"></div>
              <svg className="w-4 h-4 text-pink-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 h-[2px] border-t-2 border-dashed border-pink-200"></div>
            </div>
          </div>

          {/* 反代地址 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              反代地址 (Proxy)
            </label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="https://api.openai.com"
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 密钥 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              密钥 (Key)
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-••••••••••••••••••••"
                className="w-full px-5 py-4 pr-12 bg-gray-50/50 border border-gray-200 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors"
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 模型选择 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              模型选择（手动输入 或 拉取后选择）
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 预设配置 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              预设配置
            </label>
            <div className="flex gap-3">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="flex-1 px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all text-gray-700 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFB6C1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem'
                }}
              >
                <option value="">选择预设配置...</option>
                <option value="default">默认配置</option>
                <option value="creative">创意模式</option>
                <option value="precise">精确模式</option>
              </select>
              <button
                type="button"
                className="px-6 py-4 bg-gradient-to-r from-pink-100 to-blue-100 text-gray-700 font-medium rounded-[16px] hover:shadow-md transition-all"
              >
                管理
              </button>
            </div>
          </div>

          {/* 温度滑块 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                温度 (随机性)
              </label>
              <span className="text-lg font-semibold text-[#87CEEB]">
                {temperature.toFixed(1)}
              </span>
            </div>
            <div className="relative pt-2 pb-1">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-pink-100 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #FFB6C1 0%, #FFB6C1 ${(temperature / 2) * 100}%, #FFF0F5 ${(temperature / 2) * 100}%, #FFF0F5 100%)`
                }}
              />
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #FFB6C1;
                  cursor: pointer;
                  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.4);
                  transition: all 0.2s;
                }
                .slider::-webkit-slider-thumb:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.6);
                }
                .slider::-moz-range-thumb {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #FFB6C1;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 8px rgba(255, 182, 193, 0.4);
                  transition: all 0.2s;
                }
                .slider::-moz-range-thumb:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.6);
                }
              `}</style>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>精确</span>
              <span>平衡</span>
              <span>创意</span>
            </div>
          </div>

          {/* 拉取模型按钮 */}
          <button
            type="button"
            className="w-full px-6 py-4 bg-white border-2 border-[#87CEEB] text-[#87CEEB] font-medium rounded-[16px] hover:bg-blue-50 transition-all flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span>拉取模型列表</span>
          </button>

          {/* 保存按钮 */}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full px-6 py-5 bg-gradient-to-r from-[#FFB6C1] to-[#87CEEB] text-white font-semibold rounded-[16px] hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "保存中..." : "保存设置"}
          </button>

          {/* 提示消息 */}
          {message && (
            <div className={`text-center text-sm font-medium ${message.includes("成功") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
