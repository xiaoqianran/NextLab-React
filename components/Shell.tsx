"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import CommandPalette from "./CommandPalette";

const NAV = [
  { title: "工作台", href: "/play" },
  { title: "画廊", href: "/gallery" },
  { title: "范式", href: "/recipes" },
  { title: "文档", href: "/docs" },
  { title: "模型", href: "/models" },
  { title: "更新", href: "/updates" },
  { title: "编年史", href: "/chronicle" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, setKeyModalOpen, toast, apiKey } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="site-header sticky top-0 z-[100] border-b border-line-1 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button className="rounded-lg p-2 hover:bg-fill-2 lg:hidden" aria-label="菜单" onClick={() => setMenuOpen((v) => !v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-[22px] leading-none tracking-tight">NextLabs</span>
            <span className="hidden rounded-full border border-line-2 px-1.5 py-0.5 text-[10px] text-fg-3 sm:inline">React 复刻</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${pathname === n.href ? "bg-fill-2 font-medium text-fg-1" : "text-fg-2 hover:bg-fill-1 hover:text-fg-1"}`}>
                {n.title}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button aria-label="搜索页面和模型" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="hidden items-center gap-2 rounded-full border border-line-2 py-1.5 pl-3 pr-2 text-sm text-fg-3 hover:bg-fill-1 sm:flex">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <span>搜索</span><kbd className="rounded border border-line-2 px-1 text-[10px]">⌘K</kbd>
            </button>
            <a href="https://github.com/xiaoqianran/NextLab" target="_blank" rel="noreferrer" aria-label="GitHub"
              className="rounded-full p-2 text-fg-2 hover:bg-fill-2 hover:text-fg-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 1.28 1.06.83.78 2.57v3.81c0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" /></svg>
            </a>
            <button onClick={() => toast("复刻版仅提供中文界面")} aria-label="Switch to English"
              className="rounded-full px-2 py-2 text-sm font-medium text-fg-2 hover:bg-fill-2">EN</button>
            <button onClick={toggleTheme} aria-label={theme === "light" ? "切换到深色" : "切换到浅色"}
              className="rounded-full p-2 text-fg-2 hover:bg-fill-2 hover:text-fg-1">
              {theme === "light"
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
            </button>
            <button onClick={() => setKeyModalOpen(true)}
              className="ml-1 rounded-full bg-[var(--invert)] px-4 py-1.5 text-sm font-medium text-[var(--invert-fg)] hover:opacity-90">
              {apiKey ? "密钥已设置" : "登录"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="nl-fade border-t border-line-1 px-4 py-3 lg:hidden">
            <div className="grid grid-cols-3 gap-1">
              {[...NAV, { title: "对比", href: "/compare" }, { title: "对话", href: "/chat" }, { title: "Agent", href: "/agent" }, { title: "绘图", href: "/draw" }, { title: "状态", href: "/status" }, { title: "设置", href: "/settings" }].map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm hover:bg-fill-2">{n.title}</Link>
              ))}
            </div>
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">{children}</main>
      <footer className="border-t border-line-1 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-serif text-xl">NextLabs</div>
            <p className="mt-2 max-w-xs text-sm text-fg-3">每个多模态模型的开放实验室：试用、对比、调用。本站为 Next.js + React 复刻实现，界面与数据来自原站公开页面。</p>
          </div>
          {[
            { h: "实验室", links: [["工作台", "/play"], ["对比", "/compare"], ["对话", "/chat"], ["Agent", "/agent"], ["NextDraw", "/draw"]] },
            { h: "目录", links: [["模型", "/models"], ["画廊", "/gallery"], ["范式", "/recipes"], ["状态", "/status"], ["错误码", "/errors"]] },
            { h: "关于", links: [["更新", "/updates"], ["编年史", "/chronicle"], ["文档", "/docs"], ["设置", "/settings"]] },
          ].map((col) => (
            <div key={col.h}>
              <div className="text-sm font-medium">{col.h}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map(([t, href]) => (
                  <li key={href}><Link href={href} className="text-sm text-fg-3 hover:text-fg-1">{t}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
      <CommandPalette />
    </div>
  );
}
