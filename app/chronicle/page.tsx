"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/data";

export default function ChroniclePage() {
  const [mode, setMode] = useState<"timeline" | "models">("timeline");
  const [q, setQ] = useState("");
  const all = SITE.chronicle ?? [];
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return all.filter((c) => {
      if (mode === "models" && !c.modelId) return false;
      if (query && !c.text.toLowerCase().includes(query) && !c.date.includes(query)) return false;
      return true;
    });
  }, [all, mode, q]);
  return (
    <div className="nl-enter mx-auto max-w-3xl py-10">
      <h1 className="font-serif text-[34px]">编年史</h1>
      <p className="mt-1 text-sm text-fg-3">模型上线的历史长河 · 显示最近 {all.length} 条（抓取快照）</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full border border-line-2 p-1">
          {([["timeline", "时间线"], ["models", "模型"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setMode(k)}
              className={`rounded-full px-4 py-1 text-[13px] ${mode === k ? "bg-[var(--invert)] font-medium text-[var(--invert-fg)]" : "text-fg-2 hover:bg-fill-1"}`}>{label}</button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索编年史"
          className="rounded-full border border-line-2 px-4 py-2 text-sm outline-none placeholder:text-fg-4 focus:border-accent" />
        <span className="text-sm text-fg-4">{list.length} 条</span>
      </div>
      <ul className="mt-6 divide-y divide-line-1 rounded-3xl border border-line-1 bg-surface-1 px-6">
        {list.map((c, i) => (
          <li key={i} className="flex items-baseline gap-4 py-3.5">
            <span className="w-[74px] shrink-0 text-[13px] text-fg-4">{c.date}</span>
            {c.modelId ? (
              <Link href={`/models/${c.modelId}`} className="text-sm leading-relaxed hover:text-accent">{c.text}</Link>
            ) : (
              <span className="text-sm leading-relaxed">{c.text}</span>
            )}
          </li>
        ))}
      </ul>
      {list.length === 0 && <div className="py-16 text-center text-sm text-fg-3">没有匹配的条目</div>}
    </div>
  );
}
