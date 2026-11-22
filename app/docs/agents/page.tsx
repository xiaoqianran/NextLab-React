import Link from "next/link";
import { SITE } from "@/lib/data";

export default function AgentsIndex() {
  const agents = SITE.agents ?? [];
  return (
    <div className="nl-enter py-10">
      <nav className="text-sm text-fg-3">
        <Link href="/docs" className="hover:text-fg-1">文档</Link>
        <span className="mx-2 text-fg-4">/</span>
        <span className="text-fg-1">Agent 工具</span>
      </nav>
      <h1 className="mt-4 font-serif text-[34px]">Agent 工具接入</h1>
      <p className="mt-1 text-sm text-fg-3">共 {agents.length} 个工具的接入说明。</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
