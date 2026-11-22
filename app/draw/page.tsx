"use client";
import React, { useEffect, useRef, useState } from "react";
import { MODELS, endpointPath } from "@/lib/data";
import { runGeneration, type RunResult } from "@/lib/api";
import { useStore } from "@/lib/store";

const IMAGE_MODELS = MODELS.filter((m) => m.type === "image");
const COLORS = ["#111111", "#e03131", "#f08c00", "#2f9e44", "#1971c2", "#7048e8", "#e64980", "#ffffff"];

export default function DrawPage() {
  const { apiKey, setKeyModalOpen, toast } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undoStack = useRef<string[]>([]);
  const [color, setColor] = useState("#111111");
  const [size, setSize] = useState(6);
  const [modelId, setModelId] = useState(IMAGE_MODELS.find((m) => m.id === "gpt-image-2")?.id ?? IMAGE_MODELS[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  };
  const down = (e: React.PointerEvent) => {
    const c = canvasRef.current!; undoStack.current.push(c.toDataURL());
    if (undoStack.current.length > 30) undoStack.current.shift();
    drawing.current = true; last.current = pos(e);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const up = () => { drawing.current = false; last.current = null; };
  const undo = () => {
    const prev = undoStack.current.pop(); if (!prev) return;
    const img = new Image(); img.onload = () => canvasRef.current?.getContext("2d")?.drawImage(img, 0, 0); img.src = prev;
  };
  const clear = () => {
    const c = canvasRef.current!; undoStack.current.push(c.toDataURL());
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = canvasRef.current!.toDataURL("image/png"); a.download = "nextdraw.png"; a.click();
  };
  const generate = async () => {
    if (!apiKey) { setKeyModalOpen(true); toast("先设置 API 密钥再生成"); return; }
    if (!prompt.trim()) { toast("先输入提示词"); return; }
    const m = MODELS.find((x) => x.id === modelId); if (!m) return;
    setRunning(true); setResult(null);
    try {
      const r = await runGeneration(endpointPath(m), { model: m.id, prompt: prompt.trim(), reference_image: canvasRef.current!.toDataURL("image/png") }, "image");
      setResult(r);
    } catch (e) { toast(e instanceof Error ? e.message : String(e)); }
    finally { setRunning(false); }
  };

  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">NextDraw</h1>
      <p className="mt-1 text-sm text-fg-3">画一画，然后把画布作为参考图交给图像模型继续创作。</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-line-1 bg-surface-1 p-4">
          <div className="flex flex-wrap items-center gap-2 pb-3">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)} aria-label={c}
                className={`h-7 w-7 rounded-full border ${color === c ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-transparent" : "border-line-2"}`}
                style={{ background: c }} />
            ))}
            <label className="ml-2 flex items-center gap-2 text-sm text-fg-3">粗细
              <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} className="accent-[var(--accent)]" />
              <span className="w-6 font-mono text-xs">{size}</span>
            </label>
            <div className="ml-auto flex gap-1.5">
              <button onClick={undo} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm hover:bg-fill-1">撤销</button>
              <button onClick={clear} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm hover:bg-fill-1">清空</button>
              <button onClick={download} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm hover:bg-fill-1">下载 PNG</button>
            </div>
          </div>
          <canvas ref={canvasRef} width={960} height={640}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
            className="w-full touch-none rounded-2xl border border-line-1 bg-white" />
        </section>
        <section className="flex flex-col rounded-3xl border border-line-1 bg-surface-1 p-5">
          <label className="text-sm font-medium text-fg-2">图像模型</label>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}
            className="mt-2 w-full truncate rounded-xl border border-line-2 bg-transparent px-3 py-2 text-sm outline-none">
            {IMAGE_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label className="mt-4 text-sm font-medium text-fg-2">提示词</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
            placeholder="描述你想把这幅画变成什么…"
            className="mt-2 w-full resize-y rounded-xl border border-line-2 bg-bg px-3 py-2.5 text-sm outline-none placeholder:text-fg-4 focus:border-accent" />
          <button onClick={() => void generate()} disabled={running}
            className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-strong disabled:opacity-50">
            {running ? "生成中…" : "以画布为参考生成"}
          </button>
          <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl bg-fill-1">
            {result?.kind === "image" && result.url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={result.url} alt="生成结果" className="w-full rounded-2xl" />
              : <span className="py-10 text-sm text-fg-4">结果会显示在这里</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
