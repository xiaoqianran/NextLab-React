import Link from "next/link";
import { MODELS, SITE, TYPE_LABEL } from "@/lib/data";

export default function Home() {
  const stats = SITE.home?.stats ?? {};
  const works = (SITE.works ?? []).slice(0, 10);
  const updates = (SITE.updates ?? []).slice(0, 2);
  const chronicle = (SITE.chronicle ?? []).slice(0, 6);
  const featured = MODELS.filter((m) => m.promptCount).slice(0, 8);
  return (
    <div className="nl-enter">
      <section className="dot-grid relative overflow-hidden py-16 sm:py-24">
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-[42px] leading-[1.15] tracking-tight sm:text-[56px]">
            每个会创作的模型，<br />都在一间开放实验室。
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-fg-3">
            每个多模态模型的开放实验室：试用、对比、调用。438 个模型、一套接口，在浏览器里直接开跑。
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/play" className="rounded-full bg-[var(--invert)] px-6 py-2.5 text-sm font-medium text-[var(--invert-fg)] hover:opacity-90">打开工作台</Link>
            <Link href="/models" className="rounded-full border border-line-2 px-6 py-2.5 text-sm hover:bg-fill-1">浏览模型</Link>
          </div>
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-4 gap-4">
            {[
              [stats.models, "个模型"], [stats.prompts, "条提示词"], [stats.vendors, "家厂商"], [stats.works, "部作品"],
            ].map(([n, label]) => (
              <div key={label as string}>
                <div className="font-serif text-[26px]">{n ?? "—"}</div>
                <div className="mt-1 text-xs text-fg-3">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {works.length > 0 && (
        <section className="py-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {works.map((w) => (
              <Link key={w.id} href={`/w/${w.id}`} className="group w-[240px] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets${w.thumb.replace("/nextlab", "")}`} alt={w.title}
                  className="aspect-[4/3] w-full rounded-2xl border border-line-1 object-cover transition group-hover:opacity-90" />
                <div className="mt-2 line-clamp-1 text-[13px] text-fg-2">{w.title}</div>
                {w.model && <div className="text-xs text-fg-4">{w.model}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-10 py-12 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">最近上新</h2>
            <Link href="/updates" className="text-sm text-accent">全部更新 →</Link>
          </div>
          <div className="mt-5 space-y-5">
            {updates.map((g) => (
              <div key={g.version} className="rounded-3xl border border-line-1 bg-surface-1 p-5">
                <div className="flex items-baseline gap-3">
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-xs font-medium text-accent">{g.version}</span>
                  <span className="text-sm text-fg-3">{g.date}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <span key={it} className="rounded-full border border-line-2 px-3 py-1 text-sm">{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">编年史</h2>
            <Link href="/chronicle" className="text-sm text-accent">完整编年史 →</Link>
          </div>
          <ul className="mt-5 divide-y divide-line-1 rounded-3xl border border-line-1 bg-surface-1 px-5">
            {chronicle.map((c, i) => (
              <li key={i} className="flex items-baseline gap-4 py-3">
                <span className="w-16 shrink-0 text-[13px] text-fg-4">{c.date}</span>
                {c.modelId ? (
                  <Link href={`/models/${c.modelId}`} className="truncate text-sm hover:text-accent">{c.text}</Link>
                ) : (
                  <span className="truncate text-sm">{c.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="pb-16">
          <h2 className="font-serif text-2xl">热门模型</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((m) => (
              <Link key={m.id} href={`/models/${m.id}`} className="group rounded-3xl border border-line-1 bg-surface-1 p-5 transition hover:border-line-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-fill-2 px-2 py-0.5 text-[11px] text-fg-3">{TYPE_LABEL[m.type]}</span>
                  <span className="text-[11px] text-fg-4">{m.promptCount} 条提示</span>
                </div>
                <div className="mt-3 font-medium group-hover:text-accent">{m.name}</div>
                <div className="mt-0.5 text-[13px] text-fg-3">{m.vendor}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
