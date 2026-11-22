"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MODELS, TYPE_LABEL } from "@/lib/data";
import { useStore } from "@/lib/store";

const PAGES = [
  { title: "工作台", href: "/play", hint: "Playground" },
  { title: "对比", href: "/compare", hint: "Compare" },
  { title: "对话", href: "/chat", hint: "Chat" },
  { title: "Agent", href: "/agent", hint: "Agent" },
  { title: "NextDraw", href: "/draw", hint: "Draw" },
  { title: "画廊", href: "/gallery", hint: "Gallery" },
  { title: "范式", href: "/recipes", hint: "Recipes" },
  { title: "文档", href: "/docs", hint: "Docs" },
  { title: "模型", href: "/models", hint: "Models" },
  { title: "更新", href: "/updates", hint: "Updates" },
  { title: "编年史", href: "/chronicle", hint: "Chronicle" },
  { title: "状态", href: "/status", hint: "Status" },
  { title: "错误码", href: "/errors", hint: "Errors" },
  { title: "设置", href: "/settings", hint: "Settings" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useStore();

  useEffect(() => {
    let gPending = false; let gTimer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); return; }
      if (open && e.key === "Escape") { setOpen(false); return; }
      if (typing || open) return;
      if (e.key.toLowerCase() === "g") { gPending = true; clearTimeout(gTimer); gTimer = setTimeout(() => (gPending = false), 600); return; }
      if (gPending) {
        gPending = false;
        const map: Record<string, string> = { p: "/play", c: "/compare", h: "/chat", a: "/agent", g: "/gallery", m: "/models" };
        const dest = map[e.key.toLowerCase()];
        if (dest) { e.preventDefault(); router.push(dest); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

  useEffect(() => {
    if (open) { setQ(""); setIdx(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open ]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const pages = PAGES.filter((p) => !query || p.title.toLowerCase().includes(query) || p.hint.toLowerCase().includes(query));
    const models = MODELS.filter((m) => !query || m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query) || (m.vendor || "").toLowerCase().includes(query)).slice(0, query ? 60 : 24);
    return { pages, models };
  }, [q]);

  const flat = useMemo(() => [
    ...results.pages.map((p) => ({ label: p.title, sub: p.hint, href: p.href })),
    ...results.models.map((m) => ({ label: m.name, sub: `${TYPE_LABEL[m.type]} · ${m.vendor || m.id}`, href: `/models/${m.id}` })),
  ], [results]);

  const go = (href: string) => { setOpen(false); router.push(href); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[105] flex items-start justify-center px-4 pt-[10vh]">
      <div className="nl-fade absolute inset-0 bg-[var(--scrim)]" onClick={() => setOpen(false)} />
      <div className="glass-panel nl-pop relative flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl">
        <div className="flex items-center gap-3 border-b border-line-1 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-3"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, flat.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter" && flat[idx]) go(flat[idx].href);
            }}
            placeholder="搜索页面和模型" className="w-full bg-transparent text-base outline-none placeholder:text-fg-4" />
          <kbd className="rounded-md border border-line-2 px-1.5 py-0.5 text-[11px] text-fg-3">ESC</kbd>
        </div>
        <div className="overflow-y-auto p-2">
          {results.pages.length > 0 && <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-fg-4">页面</div>}
          {results.pages.map((p, i) => (
            <button key={p.href} onClick={() => go(p.href)} onMouseEnter={() => setIdx(i)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${idx === i ? "bg-accent-soft" : ""}`}>
              <span>{p.title}</span><span className="text-xs text-fg-4">{p.hint}</span>
            </button>
          ))}
          {results.models.length > 0 && <div className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-fg-4">模型</div>}
          {results.models.map((m, j) => {
            const i = results.pages.length + j;
            return (
              <button key={m.id} onClick={() => go(`/models/${m.id}`)} onMouseEnter={() => setIdx(i)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${idx === i ? "bg-accent-soft" : ""}`}>
                <span className="truncate">{m.name}</span>
                <span className="ml-3 shrink-0 text-xs text-fg-4">{TYPE_LABEL[m.type]}模型 · {m.vendor}</span>
              </button>
            );
          })}
          {flat.length === 0 && <div className="px-3 py-8 text-center text-sm text-fg-3">没有找到「{q}」</div>}
        </div>
        <div className="border-t border-line-1 px-5 py-2.5 text-[11px] text-fg-4">↑↓ 选择 · Enter 打开 · G+P/C/H/A 快速跳转</div>
      </div>
    </div>
  );
}
