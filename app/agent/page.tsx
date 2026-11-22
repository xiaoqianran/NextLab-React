"use client";
import React, { useRef, useState } from "react";
import { MODELS } from "@/lib/data";
import { apiFetch } from "@/lib/api";
import { useStore } from "@/lib/store";

const TEXT_MODELS = MODELS.filter((m) => m.type === "text");
interface Step { title: string; detail: string; done: boolean }

async function chatOnce(model: string, system: string, user: string): Promise<string> {
  const res = await apiFetch("/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
  });
  const d: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d?.error?.message || ("HTTP " + res.status));
  return d?.choices?.[0]?.message?.content ?? "";
}

export default function AgentPage() {
  const { apiKey, setKeyModalOpen, toast } = useStore();
  const [modelId, setModelId] = useState(TEXT_MODELS.find((m) => m.id === "gpt-6.1")?.id ?? TEXT_MODELS[0]?.id ?? "");
  const [goal, setGoal] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [final, setFinal] = useState("");
  const [running, setRunning] = useState(false);
  const stopRef = useRef(false);

  const run = async () => {
    if (!apiKey) { setKeyModalOpen(true); toast("先设置 API 密钥再运行"); return; }
    if (!goal.trim()) { toast("先描述目标"); return; }
    setRunning(true); setSteps([]); setFinal(""); stopRef.current = false;
    try {
      const planRaw = await chatOnce(modelId,
        "你是任务规划器。把用户目标拆成 3-6 个可执行步骤，只输出 JSON 数组，元素为 {\"title\": \"步骤名\", \"detail\": \"这一步要做什么\"}，不要输出其他文字。",
        goal.trim());
      let plan: { title: string; detail: string }[] = [];
      try {
        const m = planRaw.match(/\[[\s\S]*\]/);
        plan = JSON.parse(m ? m[0] : planRaw);
      } catch { plan = [{ title: "执行目标", detail: goal.trim() }]; }
      const acc: Step[] = plan.map((p) => ({ ...p, done: false }));
      setSteps([...acc]);
      const outputs: string[] = [];
      for (let i = 0; i < acc.length; i++) {
        if (stopRef.current) break;
        const out = await chatOnce(modelId,
          "你是执行助手。完成给定步骤，输出简洁具体的结果。之前的步骤结果会提供给你参考。",
          `总目标：${goal.trim()}\n当前步骤 ${i + 1}/${acc.length}：${acc[i].title} — ${acc[i].detail}\n${outputs.length ? "已有结果：\n" + outputs.map((o, j) => `步骤${j + 1}：${o}`).join("\n") : ""}`);
        outputs.push(out);
        acc[i] = { ...acc[i], detail: out, done: true };
        setSteps([...acc]);
      }
      if (!stopRef.current) {
        const fin = await chatOnce(modelId,
          "你是总结助手。基于各步结果，给出最终交付：结论先行，条理清楚。",
          `目标：${goal.trim()}\n各步结果：\n${outputs.map((o, j) => `步骤${j + 1}：${o}`).join("\n")}`);
        setFinal(fin);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e));
    } finally { setRunning(false); }
  };

  return (
    <div className="nl-enter mx-auto max-w-3xl py-10">
      <h1 className="font-serif text-[34px]">Agent</h1>
      <p className="mt-1 text-sm leading-relaxed text-fg-3">
        在浏览器里运行的轻量 Agent：先规划、再逐步执行、最后汇总。全程使用你自己的密钥直连对话接口；原站的服务端代跑模式不在复刻范围内。
      </p>
      <div className="mt-6 rounded-3xl border border-line-1 bg-surface-1 p-5">
        <label className="text-sm font-medium text-fg-2">目标</label>
        <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
          placeholder="例如：为一款保温杯写一份上市推广方案"
          className="mt-2 w-full resize-y rounded-2xl border border-line-2 bg-bg px-4 py-3 text-[15px] outline-none placeholder:text-fg-4 focus:border-accent" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}
            className="max-w-[260px] truncate rounded-full border border-line-2 bg-transparent px-3 py-2 text-sm outline-none">
            {TEXT_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={() => void run()} disabled={running}
            className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-strong disabled:opacity-50">
            {running ? "运行中…" : "开始运行"}
          </button>
          {running && <button onClick={() => { stopRef.current = true; }} className="rounded-full border border-line-2 px-4 py-2 text-sm hover:bg-fill-1">停止</button>}
        </div>
      </div>
      {steps.length > 0 && (
        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="rounded-3xl border border-line-1 bg-surface-1 p-5">
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${s.done ? "bg-accent text-accent-fg" : "bg-fill-2 text-fg-3"}`}>{s.done ? "✓" : i + 1}</span>
                <span className="font-medium">{s.title}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-2">{s.detail}</p>
            </li>
          ))}
        </ol>
      )}
      {final && (
        <section className="nl-enter mt-6 rounded-3xl border border-accent/40 bg-accent-soft p-5">
          <h2 className="font-serif text-xl">最终交付</h2>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{final}</p>
        </section>
      )}
    </div>
  );
}
