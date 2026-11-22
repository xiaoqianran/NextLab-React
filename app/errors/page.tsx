import Link from "next/link";
import { SITE } from "@/lib/data";

export default function ErrorsPage() {
  const errors = SITE.errors ?? [];
  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">错误码</h1>
      <p className="mt-1 text-sm text-fg-3">调用接口时可能遇到的 {errors.length} 种错误与处理办法。</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {errors.map((e) => (
          <Link key={e.slug} href={`/errors/${e.slug}`} className="group rounded-3xl border border-line-1 bg-surface-1 p-4 transition hover:border-line-3">
            <code className="font-mono text-xs text-fg-4">{e.slug}</code>
            <div className="mt-1.5 font-medium leading-snug group-hover:text-accent">{e.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
