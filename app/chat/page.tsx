"use client";
import React, { useEffect, useRef, useState } from "react";
import { MODELS } from "@/lib/data";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/store";

interface Msg { role: "user" | "assistant"; content: string }
const TEXT_MODELS = MODELS.filter((m) => m.type === "text");

export default function ChatPage() {
  const { apiKey, setKeyModalOpen, toast } = useStore();
  const [modelId, setModelId] = useState("gpt-6.1");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TEXT_MODELS.find((m) => m.id === "gpt-6.1")) setModelId(TEXT_MODELS[0]?.id ?? "");
    try {
      const saved = localStorage.getItem("nl_chat_history");
      if (saved) setMsgs(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("nl_chat_history", JSON.stringify(msgs.slice(-100))); } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (!apiKey) { setKeyModalOpen(true); toast("先设置 API 密钥再发送"); return; }
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true);
    try {
      const res = await apiFetch("/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify({ model: modelId, messages: next, stream: true }),
      });
      if (!res.ok || !res.body) {
        const d: any = await res.json().catch(() => ({}));
        throw new Error(d?.error?.message || ("HTTP " + res.status));
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = ""; let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const j = JSON.parse(payload);
            const delta = j.choices?.[0]?.delta?.content ?? j.choices?.[0]?.message?.content ?? "";
            if (delta) {
              acc += delta;
              setMsgs((cur) => { const c = [...cur]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
            }
          } catch {}
        }
      }
      if (!acc) setMsgs((cur) => { const c = [...cur]; c[c.length - 1] = { role: "assistant", content: "（无内容返回）" }; return c; });
    } catch (e) {
      setMsgs((cur) => { const c = [...cur]; c[c.length - 1] = { role: "assistant", content: "⚠️ " + (e instanceof Error ? e.message : String(e)) }; return c; });
    } finally { setBusy(false); }
  };

  return (
    <div className="nl-enter flex h-[calc(100vh-3.5rem)] flex-col py-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-[26px]">对话</h1>
        <select value={modelId} onChange={(e) => setModelId(e.target.value)}
          className="max-w-[280px] truncate rounded-full border border-line-2 bg-transparent px-3 py-1.5 text-sm outline-none">
          {TEXT_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button onClick={() => setMsgs([])} className="ml-auto rounded-full border border-line-2 px-4 py-1.5 text-sm hover:bg-fill-1">清空对话</button>
      </div>
      <div ref={scrollRef} className="mt-5 flex-1 space-y-4 overflow-y-auto rounded-3xl border border-line-1 bg-surface-1 p-5">
        {msgs.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-fg-3">
            <div>
              <div className="font-serif text-xl text-fg-2">开始一段对话</div>
              <div className="mt-1">流式输出 · 历史保存在本地浏览器</div>
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
              m.role === "user" ? "bg-[var(--invert)] text-[var(--invert-fg)]" : "bg-fill-2"}`}>
              {m.content || <span className="animate-pulse text-fg-3">思考中…</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          className="flex-1 resize-none rounded-3xl border border-line-2 bg-surface-1 px-5 py-3 text-[15px] outline-none placeholder:text-fg-4 focus:border-accent" />
        <button onClick={() => void send()} disabled={busy}
          className="rounded-full bg-accent px-6 text-sm font-medium text-accent-fg hover:bg-accent-strong disabled:opacity-50">
          {busy ? "生成中" : "发送"}
        </button>
      </div>
    </div>
  );
}
