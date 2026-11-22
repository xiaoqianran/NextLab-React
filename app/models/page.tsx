"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { MODELS, TYPE_LABEL, TYPE_ORDER, VENDORS, type Model } from "@/lib/data";

export default function ModelsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<Model["type"] | "all">("all");
  const [vendor, setVendor] = useState("all");
  const list = useMemo(() => MODELS.filter((m) => {
    if (type !== "all" && m.type !== type) return false;
    if (vendor !== "all" && m.vendor !== vendor) return false;
    const query = q.trim().toLowerCase();
    if (query && !m.name.toLowerCase().includes(query) && !m.id.toLowerCase().includes(query)) return false;
    return true;
  }), [q, type, vendor]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: MODELS.length };
    for (const t of TYPE_ORDER) c[t] = MODELS.filter((m) => m.type === t).length;
    return c;
  }, []);
  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">模型</h1>
      <p className="mt-1 text-sm text-fg-3">共 {MODELS.length} 个模型 · {VENDORS.length} 家厂商</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-3"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`搜索${MODELS.length}个模型`}
            className="w-44 bg-transparent text-sm outline-none placeholder:text-fg-4" />
        </div>
        <div className="flex gap-1 rounded-full border border-line-2 p-1">
          {(["all", ...TYPE_ORDER] as const).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`rounded-full px-3 py-1 text-[13px] ${type === t ? "bg-[var(--invert)] font-medium text-[var(--invert-fg)]" : "text-fg-2 hover:bg-fill-1"}`}>
              {t === "all" ? "全部" : TYPE_LABEL[t]} {counts[t]}
            </button>
          ))}
        </div>
        <select value={vendor} onChange={(e) => setVendor(e.target.value)}
          className="rounded-full border border-line-2 bg-transparent px-3 py-2 text-sm outline-none">
          <option value="all">全部厂商</option>
          {VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((m) => (
          <Link key={m.id} href={`/models/${m.id}`} className="group rounded-3xl border border-line-1 bg-surface-1 p-4 transition hover:border-line-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-fill-2 px-2 py-0.5 text-[11px] text-fg-3">{TYPE_LABEL[m.type]}模型</span>
              {m.promptCount != null && <span className="text-[11px] text-fg-4">{m.promptCount} 条提示</span>}
            </div>
            <div className="mt-2.5 truncate font-medium group-hover:text-accent">{m.name}</div>
            <div className="mt-0.5 flex items-center justify-between text-[13px] text-fg-3">
              <span>{m.vendor || "—"}</span>
              <span className="truncate font-mono text-[11px] text-fg-4">{m.id}</span>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <div className="py-20 text-center text-sm text-fg-3">没有匹配的模型</div>}
    </div>
  );
}
