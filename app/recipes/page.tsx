import Link from "next/link";

export default function RecipesPage() {
  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">范式</h1>
      <p className="mt-1 text-sm text-fg-3">把多个模型串成工作流的现成配方。</p>
      <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-line-2 py-20 text-center">
        <div className="font-serif text-2xl text-fg-2">还没有范式</div>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-3">
          原站此处目前也是空的 — 尚无已发布的范式。你可以先在工作台里把单个模型跑顺，或用对比页把多个模型串起来看。
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/play" className="rounded-full bg-[var(--invert)] px-5 py-2 text-sm font-medium text-[var(--invert-fg)] hover:opacity-90">打开工作台</Link>
          <Link href="/compare" className="rounded-full border border-line-2 px-5 py-2 text-sm hover:bg-fill-1">去对比页</Link>
        </div>
      </div>
    </div>
  );
}
