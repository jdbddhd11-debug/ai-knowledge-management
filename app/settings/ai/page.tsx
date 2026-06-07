'use client';

import { useState, useEffect } from 'react';

export default function AISettingsPage() {
  const [proxyUrl, setProxyUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-5.4-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  // 加载当前配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/ai/config');
        if (response.ok) {
          const data = await response.json();
          setProxyUrl(data.proxyUrl || 'https://openclaw-api.com/v1/chat/completions');
          setApiKey(data.apiKey || '');
          setModel(data.model || 'gpt-5.4-mini');
          setTemperature(data.temperature || 0.7);
          setIsConfigured(data.isConfigured);
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };

    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proxyUrl,
          apiKey,
          model,
          temperature,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('配置保存成功！');
        setIsConfigured(true);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`保存失败: ${data.error}`);
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-purple-100">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            AI 配置
          </h1>
          <p className="text-gray-600 mb-8">配置 AI API 中转站信息</p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl ${
                message.includes('成功')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 中转站地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                中转站地址
              </label>
              <input
                type="text"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                placeholder="https://openclaw-api.com/v1/chat/completions"
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
              />
              <p className="mt-2 text-sm text-gray-500">
                默认: https://openclaw-api.com/v1/chat/completions
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isConfigured ? '已配置（显示部分）' : '请输入 API Key'}
                required
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
              />
              <p className="mt-2 text-sm text-gray-500">
                {isConfigured ? '如需更换，请输入新的 API Key' : '请输入您的 API Key'}
              </p>
            </div>

            {/* 模型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-5.4-mini"
                required
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
              />
              <p className="mt-2 text-sm text-gray-500">
                推荐: gpt-5.4-mini
              </p>
            </div>

            {/* 温度滑块 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                温度: {temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(191 219 254) 0%, rgb(233 213 255) ${(temperature / 2) * 100}%, rgb(243 232 255) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>精确 (0.0)</span>
                <span>平衡 (1.0)</span>
                <span>创造 (2.0)</span>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存配置'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">💡 温馨提示</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 配置保存后立即生效，无需重启</li>
              <li>• API Key 将安全存储在数据库中</li>
              <li>• 温度值越高，AI 回复越有创造性</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
