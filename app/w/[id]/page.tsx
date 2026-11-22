import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE, WORK_MEDIA, BASE_PATH } from "@/lib/data";

export function generateStaticParams() {
  return (SITE.works ?? []).map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = (SITE.works ?? []).find((x) => x.id === id);
  return { title: w ? w.title.slice(0, 40) : "作品" };
}

export default async function WorkDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = (SITE.works ?? []).find((x) => x.id === id);
  if (!w) notFound();
  const ext = WORK_MEDIA[id];
  const mediaUrl = `https://labs.openai-next.com/nextlab/works/${id}/0-a1.${ext ?? "jpg"}`;
  return (
    <div className="nl-enter mx-auto max-w-4xl py-10">
      <nav className="text-sm text-fg-3">
        <Link href="/gallery" className="hover:text-fg-1">画廊</Link>
        <span className="mx-2 text-fg-4">/</span>
        <span className="text-fg-1">作品</span>
      </nav>
      <h1 className="mt-4 font-serif text-[26px] leading-snug">{w.title}</h1>
      {w.model && <div className="mt-2 text-sm text-fg-3">生成模型：{w.model}</div>}
      <div className="mt-6 overflow-hidden rounded-3xl border border-line-1">
        {ext === "mp4" ? (
          <video src={mediaUrl} controls className="w-full" poster={`${BASE_PATH}/assets${w.thumb.replace("/nextlab", "")}`} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl} alt={w.title} className="w-full" />
        )}
      </div>
      <p className="mt-3 text-xs text-fg-4">大图/视频由原站公开地址流式加载（与静态版一致的取舍）。</p>
      <div className="mt-6 flex gap-2">
        <Link href="/play" className="rounded-full bg-[var(--invert)] px-5 py-2 text-sm font-medium text-[var(--invert-fg)] hover:opacity-90">用这个提示词去工作台</Link>
        <Link href="/gallery" className="rounded-full border border-line-2 px-5 py-2 text-sm hover:bg-fill-1">返回画廊</Link>
      </div>
    </div>
  );
}
