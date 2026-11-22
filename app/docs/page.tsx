import Link from "next/link";
import { SITE } from "@/lib/data";

const SECTIONS = [
  { slug: "platforms", title: "平台接入", desc: "把各家厂商的密钥统一接入，一套接口调用全部模型。" },
  { slug: "agents", title: "Agent 工具", desc: "让 Claude Code、Cursor 等 34 个 Agent 工具直接调用模型。" },
  { slug: "tasks", title: "异步任务", desc: "视频与音频生成的任务创建、轮询与回调约定。" },
  { slug: "files", title: "文件与参考图", desc: "参考图、音频等文件的上传与引用方式。" },
];

export default function DocsPage() {
  const agents = SITE.agents ?? [];
  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">文档</h1>
      <p className="mt-1 text-sm text-fg-3">接入指南与约定。</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.slug} href={s.slug === "agents" ? "/docs/agents" : `/docs/${s.slug}`}
            className="group rounded-3xl border border-line-1 bg-surface-1 p-6 transition hover:border-line-3">
            <div className="font-serif text-xl group-hover:text-accent">{s.title}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-3">{s.desc}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-12 font-serif text-2xl">Agent 工具（{agents.length}）</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((a) => (
          <Link key={a.slug} href={`/docs/agents/${a.slug}`} className="group rounded-3xl border border-line-1 bg-surface-1 p-4 transition hover:border-line-3">
            <div className="font-medium group-hover:text-accent">{a.name}</div>
            <code className="mt-0.5 block font-mono text-[11px] text-fg-4">{a.slug}</code>
          </Link>
        ))}
      </div>
    </div>
  );
}
