"use client";
import React, { useMemo, useState } from "react";
import { MODEL_MAP, MODELS, TYPE_LABEL, type Model } from "@/lib/data";
import { buildBody } from "@/components/Playground";
import { runGeneration, type RunResult } from "@/lib/api";
import { endpointPath } from "@/lib/data";
import { useStore } from "@/lib/store";

interface Slot { id: string; running: boolean; result: RunResult | null; error: string; ms: number | null }

export default function ComparePage() {
  const { apiKey, setKeyModalOpen, toast } = useStore();
  const [type, setType] = useState<Model["type"]>("image");
  const [prompt, setPrompt] = useState("");
  const [slots, setSlots] = useState<Slot[]>([
    { id: "gpt-image-2", running: false, result: null, error: "", ms: null },
    { id: "gemini-3-pro-image", running: false, result: null, error: "", ms: null },
  ]);
  const candidates = useMemo(() => MODELS.filter((m) => m.type === type), [type]);

  const setSlotId = (i: number, id: string) =>
    setSlots((s) => s.map((x, j) => (j === i ? { ...x, id, result: null, error: "", ms: null } : x)));

  const runOne = async (i: number) => {
    const slot = slots[i];
    const m = MODEL_MAP[slot.id];
    if (!m) return;
    const t0 = Date.now();
    setSlots((s) => s.map((x, j) => (j === i ? { ...x, running: true, error: "", result: null, ms: null } : x)));
    try {
      const defaults: Record<string, string | boolean> = {};
      for (const p of m.params) defaults[p.id] = p.kind === "switch" ? p.default === "true" : (p.default ?? p.options?.[0] ?? "");
      const body = buildBody(m, prompt, defaults, null, new Set());
      const r = await runGeneration(endpointPath(m), body, m.type);
      setSlots((s) => s.map((x, j) => (j === i ? { ...x, running: false, result: r, ms: Date.now() - t0 } : x)));
    } catch (e) {
      setSlots((s) => s.map((x, j) => (j === i ? { ...x, running: false, error: e instanceof Error ? e.message : String(e), ms: Date.now() - t0 } : x)));
    }
  };

  const runAll = () => {
    if (!apiKey) { setKeyModalOpen(true); toast("先设置 API 密钥再运行"); return; }
    if (!prompt.trim()) { toast("先输入提示词"); return; }
    slots.forEach((_, i) => void runOne(i));
  };

  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">对比</h1>
      <p className="mt-1 text-sm text-fg-3">同一个提示词，多个模型并行生成，并排比较。</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full border border-line-2 p-1">
          {(["image", "video", "audio", "text"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`rounded-full px-3.5 py-1 text-[13px] ${type === t ? "bg-[var(--invert)] font-medium text-[var(--invert-fg)]" : "text-fg-2 hover:bg-fill-1"}`}>
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <button onClick={() => slots.length < 4 && setSlots((s) => [...s, { id: candidates[0]?.id ?? "", running: false, result: null, error: "", ms: null }])}
          disabled={slots.length >= 4} className="rounded-full border border-line-2 px-4 py-1.5 text-sm hover:bg-fill-1 disabled:opacity-40">+ 添加模型</button>
      </div>
      <div className="mt-4 flex gap-2">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="输入同一个提示词…"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runAll(); }}
          className="flex-1 rounded-full border border-line-2 bg-surface-1 px-5 py-3 text-[15px] outline-none placeholder:text-fg-4 focus:border-accent" />
        <button onClick={runAll} className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg hover:bg-accent-strong">全部运行</button>
      </div>
      <div className={`mt-6 grid gap-4 ${slots.length > 2 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2"}`}>
        {slots.map((slot, i) => {
          const m = MODEL_MAP[slot.id];
          return (
            <section key={i} className="flex flex-col rounded-3xl border border-line-1 bg-surface-1 p-4">
              <div className="flex items-center gap-2">
                <select value={slot.id} onChange={(e) => setSlotId(i, e.target.value)}
                  className="min-w-0 flex-1 truncate rounded-lg border border-line-2 bg-transparent px-2 py-1.5 text-sm outline-none">
                  {candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {slots.length > 1 && (
                  <button onClick={() => setSlots((s) => s.filter((_, j) => j !== i))} className="rounded-lg px-2 py-1 text-fg-4 hover:bg-fill-2 hover:text-danger">✕</button>
                )}
              </div>
              <div className="mt-1 text-xs text-fg-4">{m?.vendor} {slot.ms != null && `· ${(slot.ms / 1000).toFixed(1)}s`}</div>
              <div className="mt-3 flex min-h-[220px] flex-1 items-center justify-center rounded-2xl bg-fill-1">
                {slot.running && <div className="animate-pulse text-sm text-fg-3">生成中…</div>}
                {!slot.running && slot.error && <div className="px-4 text-center text-sm text-danger">{slot.error}</div>}
                {!slot.running && !slot.error && slot.result?.kind === "image" && slot.result.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.result.url} alt={m?.name} className="max-h-[380px] w-full rounded-2xl object-contain" />
                )}
                {!slot.running && !slot.error && slot.result?.kind === "video" && slot.result.url && (
                  <video src={slot.result.url} controls className="max-h-[380px] w-full rounded-2xl" />
                )}
                {!slot.running && !slot.error && slot.result?.kind === "audio" && slot.result.url && (
                  <audio src={slot.result.url} controls className="w-full px-3" />
                )}
                {!slot.running && !slot.error && slot.result?.kind === "text" && (
                  <pre className="max-h-[380px] w-full overflow-auto whitespace-pre-wrap p-4 text-left text-sm">{slot.result.text}</pre>
                )}
                {!slot.running && !slot.error && !slot.result && <div className="text-sm text-fg-4">等待运行</div>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
