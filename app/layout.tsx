import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 知识管理系统",
  description: "基于 Scott Young 五类信息理论的 AI 知识分类系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
