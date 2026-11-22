import Link from "next/link";
import { notFound } from "next/navigation";
import { MODEL_MAP, MODELS, TYPE_LABEL, endpointPath, relatedModels } from "@/lib/data";
import Playground from "@/components/Playground";

export function generateStaticParams() {
  return MODELS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = MODEL_MAP[id];
  return { title: m ? m.name : id };
}

export default async function ModelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = MODEL_MAP[id];
  if (!m) notFound();
  const related = relatedModels(m);
  return (
    <div className="nl-enter py-10">
      <nav className="text-sm text-fg-3">
        <Link href="/models" className="hover:text-fg-1">模型</Link>
        <span className="mx-2 text-fg-4">/</span>
        <span className="text-fg-1">{m.name}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-[34px] leading-tight">{m.name}</h1>
        {m.promptCount != null && (
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">{m.promptCount} 条提示</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-fg-3">
        <span className="rounded-full border border-line-2 px-3 py-1">{TYPE_LABEL[m.type]}模型</span>
        {m.vendor && <span className="rounded-full border border-line-2 px-3 py-1">{m.vendor}</span>}
        <code className="rounded-full bg-fill-2 px-3 py-1 font-mono text-xs">{m.id}</code>
        <code className="rounded-full bg-fill-2 px-3 py-1 font-mono text-xs">POST {endpointPath(m)}</code>
      </div>

      <div className="mt-8">
        <Playground model={m} />
      </div>

      {m.exampleRequest && (
        <section className="mt-10">
          <h2 className="font-serif text-xl">调用示例</h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-3xl border border-line-1 bg-surface-1 p-5 font-mono text-[12.5px] leading-relaxed text-fg-2">{m.exampleRequest}</pre>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10 pb-6">
          <h2 className="font-serif text-xl">相关模型</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/models/${r.id}`} className="group rounded-3xl border border-line-1 bg-surface-1 p-4 transition hover:border-line-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-fill-2 px-2 py-0.5 text-[11px] text-fg-3">{TYPE_LABEL[r.type]}</span>
                  <span className="text-[11px] text-fg-4">{r.vendor}</span>
                </div>
                <div className="mt-2 font-medium group-hover:text-accent">{r.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
