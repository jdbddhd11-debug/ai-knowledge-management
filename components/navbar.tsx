export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              AI 知识管理系统
            </h1>
            <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              基于 Scott Young 五类信息理论
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
