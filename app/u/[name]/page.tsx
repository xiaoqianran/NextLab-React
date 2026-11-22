import Link from "next/link";
import { SITE, BASE_PATH } from "@/lib/data";

export function generateStaticParams() {
  return [{ name: "lab_openai-next" }];
}

export default async function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const works = SITE.works ?? [];
  return (
    <div className="nl-enter py-10">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft font-serif text-2xl text-accent">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-[28px] leading-tight">{name}</h1>
          <p className="text-sm text-fg-3">NextLabs 官方账号 · {works.length} 件作品（抓取快照）</p>
        </div>
      </div>
      <h2 className="mt-10 font-serif text-xl">作品</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {works.map((w) => (
          <Link key={w.id} href={`/w/${w.id}`} className="group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_PATH}/assets${w.thumb.replace("/nextlab", "")}`} alt={w.title}
              className="aspect-[4/3] w-full rounded-3xl border border-line-1 object-cover transition group-hover:opacity-90" />
            <div className="mt-2 line-clamp-2 text-sm text-fg-2">{w.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
