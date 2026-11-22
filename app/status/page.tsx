"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/data";

export default function StatusPage() {
  const [q, setQ] = useState("");
  const [onlyOk, setOnlyOk] = useState(false);
  const rows = SITE.status ?? [];
  const list = useMemo(() => rows.filter((r) => {
    if (onlyOk && r.status !== "正常") return false;
    const query = q.trim().toLowerCase();
    if (query && !r.model.toLowerCase().includes(query)) return false;
    return true;
  }), [rows, q, onlyOk]);
  const okCount = rows.filter((r) => r.status === "正常").length;
  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">状态</h1>
      <p className="mt-1 text-sm text-fg-3">
        抓取时刻的运行快照：{rows.length} 个模型 · {okCount} 个正常。实时状态请以原站为准。
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索模型"
          className="rounded-full border border-line-2 px-4 py-2 text-sm outline-none placeholder:text-fg-4 focus:border-accent" />
        <button onClick={() => setOnlyOk((v) => !v)}
          className={`rounded-full border px-4 py-2 text-sm ${onlyOk ? "border-accent bg-accent-soft text-accent" : "border-line-2 hover:bg-fill-1"}`}>只看正常</button>
        <span className="text-sm text-fg-4">{list.length} 条</span>
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-line-1 bg-surface-1">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line-1 text-fg-3">
              <th className="px-5 py-3 font-medium">模型</th>
              <th className="px-3 py-3 font-medium">状态</th>
              <th className="px-3 py-3 font-medium">成功率</th>
              <th className="px-3 py-3 font-medium">p50 延迟</th>
              <th className="px-3 py-3 font-medium">运行</th>
              <th className="px-5 py-3 font-medium">最近的错误</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-1">
            {list.map((r, i) => (
              <tr key={i} className="hover:bg-fill-1">
                <td className="px-5 py-2.5 font-medium">{r.model}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 ${r.status === "正常" ? "text-success" : "text-warning"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.status === "正常" ? "bg-[var(--state-success)]" : "bg-[var(--state-warning)]"}`} />
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 tabular-nums">{r.rate}</td>
                <td className="px-3 py-2.5 tabular-nums">{r.latency}</td>
                <td className="px-3 py-2.5 tabular-nums">{r.runs}</td>
                <td className="px-5 py-2.5 font-mono text-xs text-fg-3">
                  {r.note ? <Link href="/errors" className="hover:text-accent">{r.note}</Link> : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
