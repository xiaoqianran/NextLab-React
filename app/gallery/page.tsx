import Link from "next/link";
import { SITE } from "@/lib/data";

export default function GalleryPage() {
  const works = SITE.works ?? [];
  return (
    <div className="nl-enter py-10">
      <h1 className="font-serif text-[34px]">画廊</h1>
      <p className="mt-1 text-sm text-fg-3">社区作品 · 共 {works.length} 件（抓取快照）</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {works.map((w) => (
          <Link key={w.id} href={`/w/${w.id}`} className="group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/assets${w.thumb.replace("/nextlab", "")}`} alt={w.title}
              className="aspect-[4/3] w-full rounded-3xl border border-line-1 object-cover transition group-hover:opacity-90" />
            <div className="mt-2 line-clamp-2 text-sm leading-snug text-fg-2">{w.title}</div>
            {w.model && <div className="mt-0.5 text-xs text-fg-4">{w.model}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
