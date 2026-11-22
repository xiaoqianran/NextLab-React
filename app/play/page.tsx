"use client";
import React, { useEffect, useMemo, useState } from "react";
import { MODEL_MAP, MODELS, TYPE_LABEL, TYPE_ORDER, type Model } from "@/lib/data";
import Playground from "@/components/Playground";

export default function PlayPage() {
  const [selectedId, setSelectedId] = useState<string>("gpt-image-2");
  const [q, setQ] = useState("");
  useEffect(() => {
    const last = localStorage.getItem("nl_play_last");
    if (last && MODEL_MAP[last]) setSelectedId(last);
    else if (!MODEL_MAP["gpt-image-2"]) setSelectedId(MODELS.find((m) => m.type === "image")?.id ?? MODELS[0]?.id ?? "");
  }, []);
  const select = (id: string) => { setSelectedId(id); localStorage.setItem("nl_play_last", id); };
  const model: Model | undefined = MODEL_MAP[selectedId];
  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = MODELS.filter((m) => !query || m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query));
    return TYPE_ORDER.map((t) => ({ type: t, items: filtered.filter((m) => m.type === t) })).filter((g) => g.items.length);
  }, [q]);
  return (
    <div className="nl-enter grid gap-6 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <h1 className="font-serif text-[26px]">工作台</h1>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-3"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索模型"
            className="w-full bg-transparent text-sm outline-none placeholder:text-fg-4" />
        </div>
        <div className="mt-4 space-y-5 pr-1">
          {groups.map((g) => (
            <div key={g.type}>
              <div className="px-1 text-[11px] font-medium uppercase tracking-wider text-fg-4">{TYPE_LABEL[g.type]}模型 · {g.items.length}</div>
              <div className="mt-1.5 space-y-0.5">
                {g.items.map((m) => (
                  <button key={m.id} onClick={() => select(m.id)}
                    className={`block w-full truncate rounded-xl px-3 py-2 text-left text-sm transition ${m.id === selectedId ? "bg-accent-soft font-medium text-accent" : "text-fg-2 hover:bg-fill-1"}`}>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && <div className="px-1 text-sm text-fg-3">没有匹配的模型</div>}
        </div>
      </aside>
      <section>
        {model ? (
          <>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-serif text-[26px]">{model.name}</h2>
              <span className="text-sm text-fg-3">{model.vendor} · {TYPE_LABEL[model.type]}</span>
            </div>
            <div className="mt-5">
              <Playground key={model.id} model={model} />
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-sm text-fg-3">选择一个模型开始</div>
        )}
      </section>
    </div>
  );
}
