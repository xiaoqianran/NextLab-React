import { SITE } from "@/lib/data";

export default function UpdatesPage() {
  const groups = SITE.updates ?? [];
  return (
    <div className="nl-enter mx-auto max-w-3xl py-10">
      <h1 className="font-serif text-[34px]">更新</h1>
      <p className="mt-1 text-sm text-fg-3">版本与上新记录（抓取快照）</p>
      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <section key={g.version} className="rounded-3xl border border-line-1 bg-surface-1 p-6">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-sm font-medium text-accent">{g.version}</span>
              <span className="text-sm text-fg-3">{g.date}</span>
              <span className="text-sm text-fg-4">{g.items.length} 项上新</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.items.map((it) => (
                <span key={it} className="rounded-full border border-line-2 px-3 py-1.5 text-sm">{it}</span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
