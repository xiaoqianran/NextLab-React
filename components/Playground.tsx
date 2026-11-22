"use client";
import React, { useMemo, useRef, useState } from "react";
import type { Model, ModelParam } from "@/lib/data";
import { endpointPath, TYPE_LABEL } from "@/lib/data";
import { runGeneration, type RunResult } from "@/lib/api";
import { useStore } from "@/lib/store";

type Values = Record<string, string | boolean>;

function defaults(m: Model): Values {
  const v: Values = {};
  for (const p of m.params) {
    if (p.kind === "switch") v[p.id] = p.default === "true" || p.default === "on";
    else v[p.id] = p.default ?? (p.options?.[0] ?? "");
  }
  return v;
}

function coerce(p: ModelParam, v: string | boolean): unknown {
  if (p.kind === "switch") return Boolean(v);
  if (p.kind === "number" || p.kind === "range") { const n = Number(v); return Number.isNaN(n) ? v : n; }
  if (typeof v === "string") {
    // the original's option labels are display text; the API expects enum values
    const ENUM: Record<string, string> = {
      "自动": "auto", "低": "low", "中": "medium", "高": "high",
      "透明": "transparent", "不透明": "opaque",
      "文本": "text", "JSON对象": "json_object",
    };
    if (ENUM[v]) return ENUM[v];
    if (p.id === "size") {
      const SIZES: Record<string, string> = { "1:1": "1024x1024", "3:2": "1536x1024", "2:3": "1024x1536", "16:9": "1536x864", "9:16": "864x1536", "4:3": "1152x864", "3:4": "864x1152" };
      if (SIZES[v]) return SIZES[v];
    }
    if (p.id === "output_format") return v.toLowerCase();
  }
  return v;
}

export function buildBody(m: Model, prompt: string, values: Values, refImage: string | null, touched?: Set<string>): Record<string, unknown> {
  const path = endpointPath(m);
  const extra: Record<string, unknown> = {};
  for (const p of m.params) {
    if (p.id === "prompt" || p.id === "system" || /image/.test(p.id)) continue;
    const v = values[p.id];
    if (v === "" || v === undefined) continue;
    // range params whose extracted default sits at the minimum mean "unset" on the original
    if (p.kind === "range" && !touched?.has(p.id) && p.default != null && String(p.min) === String(p.default)) continue;
    extra[p.id] = coerce(p, v);
  }
  if (m.type === "text" && path.includes("chat/completions")) {
    const messages: { role: string; content: string }[] = [];
    const sys = values["system"];
    if (typeof sys === "string" && sys.trim()) messages.push({ role: "system", content: sys });
    messages.push({ role: "user", content: prompt });
    return { model: m.id, messages, ...extra };
  }
  const body: Record<string, unknown> = { model: m.id, prompt, ...extra };
  if (refImage) {
    const refParam = m.params.find((p) => /reference|image|img/.test(p.id));
    body[refParam ? refParam.id : "reference_image"] = refImage;
  }
  return body;
}

function displayBody(body: Record<string, unknown>): string {
  const clone: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    clone[k] = typeof v === "string" && v.startsWith("data:") && v.length > 80 ? v.slice(0, 60) + "…(base64)" : v;
  }
  return JSON.stringify(clone, null, 2);
}

function codeSamples(m: Model, path: string, bodyStr: string): Record<string, string> {
  const url = "https://api.openai-next.com" + path;
  return {
    curl: `curl ${url} \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyStr.replace(/\n/g, "\n  ")}'`,
    python: `import requests\n\nresp = requests.post(\n    "${url}",\n    headers={"Authorization": "Bearer $API_KEY"},\n    json=${bodyStr.replace(/\n/g, "\n    ")},\n)\nprint(resp.json())`,
    javascript: `const resp = await fetch("${url}", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer $API_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(${bodyStr.replace(/\n/g, "\n  ")}),\n});\nconsole.log(await resp.json());`,
  };
}

const PROMPT_PLACEHOLDER: Record<Model["type"], string> = {
  image: "描述你想要的画面…",
  video: "描述你想要的视频…",
  audio: "输入要合成的文本或描述声音…",
  text: "输入你的问题或指令…",
};

export default function Playground({ model }: { model: Model }) {
  const { apiKey, setKeyModalOpen, toast } = useStore();
  const promptParam = model.params.find((p) => p.id === "prompt");
  const visibleParams = model.params.filter((p) => p.id !== "prompt" && !(p.kind === "text" && /image/.test(p.id)));
  const [prompt, setPrompt] = useState(promptParam?.default ?? "");
  const [values, setValues] = useState<Values>(() => defaults(model));
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [refImage, setRefImage] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "curl" | "python" | "javascript">("preview");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const path = endpointPath(model);
  const body = useMemo(() => buildBody(model, prompt, values, refImage, touched), [model, prompt, values, refImage, touched]);
  const bodyStr = useMemo(() => displayBody(body), [body]);
  const codes = useMemo(() => codeSamples(model, path, bodyStr), [model, path, bodyStr]);

  const set = (id: string, v: string | boolean) => { setValues((s) => ({ ...s, [id]: v })); setTouched((t) => new Set(t).add(id)); };

  const run = async () => {
    if (!apiKey) { setKeyModalOpen(true); toast("先设置 API 密钥再运行"); return; }
    if (!prompt.trim()) { toast("先输入提示词"); return; }
    setRunning(true); setError(""); setResult(null); setElapsed(0);
    const t0 = Date.now();
    timer.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 100) / 10), 100);
    try {
      const r = await runGeneration(path, body, model.type);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (timer.current) clearInterval(timer.current);
      setRunning(false);
    }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast("已复制"); } catch { toast("复制失败"); }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-3xl border border-line-1 bg-surface-1 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-fg-2">{promptParam?.label ?? "提示词"}</h3>
          <span className="rounded-full bg-fill-2 px-2 py-0.5 text-[11px] text-fg-3">{TYPE_LABEL[model.type]}模型</span>
        </div>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
          placeholder={PROMPT_PLACEHOLDER[model.type]}
          className="mt-3 w-full resize-y rounded-2xl border border-line-2 bg-bg px-3.5 py-3 text-[15px] leading-relaxed outline-none placeholder:text-fg-4 focus:border-accent" />
        {(model.type === "image" || model.type === "video") && (
          <div className="mt-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const r = new FileReader(); r.onload = () => setRefImage(String(r.result)); r.readAsDataURL(f);
              }} />
            {refImage ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={refImage} alt="参考图" className="h-14 w-14 rounded-xl border border-line-1 object-cover" />
                <span className="text-sm text-fg-3">已添加参考图</span>
                <button onClick={() => setRefImage(null)} className="text-sm text-danger">移除</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="rounded-full border border-dashed border-line-3 px-4 py-2 text-sm text-fg-3 hover:border-accent hover:text-accent">+ 添加参考图</button>
            )}
          </div>
        )}
        {visibleParams.length > 0 && (
          <div className="mt-5 space-y-4">
            <h3 className="text-sm font-medium text-fg-2">参数</h3>
            {visibleParams.map((p) => (
              <ParamControl key={p.id} p={p} value={values[p.id]} onChange={(v) => set(p.id, v)} />
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={run} disabled={running}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg transition hover:bg-accent-strong disabled:opacity-50">
            {running ? `生成中… ${elapsed}s` : "运行 ⌘↵"}
          </button>
          {model.pricing[0] && <span className="text-sm text-fg-3">{model.pricing[0]}</span>}
        </div>
        {error && <div className="mt-4 rounded-2xl border border-danger/30 bg-[var(--state-danger-soft)] px-4 py-3 text-sm text-danger">{error}</div>}
        {result && (
          <div className="nl-enter mt-5">
            {result.kind === "image" && result.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.url} alt="生成结果" className="w-full rounded-2xl border border-line-1" />
            )}
            {result.kind === "video" && result.url && <video src={result.url} controls className="w-full rounded-2xl border border-line-1" />}
            {result.kind === "audio" && result.url && <audio src={result.url} controls className="w-full" />}
            {result.kind === "text" && <pre className="whitespace-pre-wrap rounded-2xl border border-line-1 bg-bg p-4 text-sm leading-relaxed">{result.text}</pre>}
            {result.kind === "json" && <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-line-1 bg-bg p-4 font-mono text-xs">{JSON.stringify(result.raw, null, 2)}</pre>}
          </div>
        )}
      </section>
      <section className="flex min-h-[420px] flex-col rounded-3xl border border-line-1 bg-surface-1">
        <div className="flex items-center gap-1 border-b border-line-1 px-3 pt-3">
          {([["preview", "请求预览"], ["curl", "cURL"], ["python", "Python"], ["javascript", "JavaScript"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-t-xl px-3 py-2 text-sm ${tab === k ? "bg-fill-2 font-medium text-fg-1" : "text-fg-3 hover:text-fg-1"}`}>{label}</button>
          ))}
          <button onClick={() => copy(tab === "preview" ? bodyStr : codes[tab])} className="ml-auto rounded-lg px-2.5 py-1.5 text-xs text-fg-3 hover:bg-fill-2 hover:text-fg-1">复制</button>
        </div>
        <div className="flex items-center gap-2 px-5 pt-4 text-sm">
          <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-xs font-semibold text-accent">POST</span>
          <code className="truncate font-mono text-[13px] text-fg-2">https://api.openai-next.com{path}</code>
        </div>
        <pre className="flex-1 overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[12.5px] leading-relaxed text-fg-2">
          {tab === "preview" ? bodyStr : codes[tab]}
        </pre>
      </section>
    </div>
  );
}

function ParamControl({ p, value, onChange }: { p: ModelParam; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) {
  const label = (
    <div className="flex items-baseline justify-between">
      <label className="text-sm text-fg-2">{p.label}</label>
      <span className="font-mono text-[11px] text-fg-4">{p.id}</span>
    </div>
  );
  if (p.kind === "select" && p.options?.length) {
    return (
      <div>
        {label}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {p.options.map((o) => (
            <button key={o} onClick={() => onChange(o)}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition ${value === o ? "border-accent bg-accent-soft font-medium text-accent" : "border-line-2 text-fg-2 hover:border-line-3"}`}>{o}</button>
          ))}
        </div>
      </div>
    );
  }
  if (p.kind === "switch") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-fg-2">{p.label}</label>
        <button onClick={() => onChange(!value)} aria-pressed={Boolean(value)}
          className={`h-6 w-11 rounded-full p-0.5 transition ${value ? "bg-accent" : "bg-fill-3"}`}>
          <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
        </button>
      </div>
    );
  }
  if (p.kind === "range") {
    return (
      <div>
        <div className="flex items-baseline justify-between">
          <label className="text-sm text-fg-2">{p.label}</label>
          <span className="font-mono text-xs text-fg-3">{String(value ?? "")}</span>
        </div>
        <input type="range" min={p.min ?? undefined} max={p.max ?? undefined} step={p.step ?? undefined}
          value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full accent-[var(--accent)]" />
      </div>
    );
  }
  if (p.kind === "textarea") {
    return (
      <div>{label}
        <textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={3}
          className="mt-1.5 w-full rounded-xl border border-line-2 bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
      </div>
    );
  }
  return (
    <div>{label}
      <input type={p.kind === "number" ? "number" : "text"} value={String(value ?? "")}
        min={p.min ?? undefined} max={p.max ?? undefined} step={p.step ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-line-2 bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}
