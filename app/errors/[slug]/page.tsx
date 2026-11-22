import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/data";

export function generateStaticParams() {
  return (SITE.errors ?? []).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = (SITE.errors ?? []).find((x) => x.slug === slug);
  return { title: e ? e.title : slug };
}

export default async function ErrorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = (SITE.errors ?? []).find((x) => x.slug === slug);
  if (!e) notFound();
  return (
    <div className="nl-enter mx-auto max-w-3xl py-10">
      <nav className="text-sm text-fg-3">
        <Link href="/errors" className="hover:text-fg-1">错误码</Link>
        <span className="mx-2 text-fg-4">/</span>
        <code className="font-mono text-[13px]">{slug}</code>
      </nav>
      <h1 className="mt-4 font-serif text-[32px] leading-snug">{e.title}</h1>
      <section className="mt-8 space-y-4 rounded-3xl border border-line-1 bg-surface-1 p-6 text-[15px] leading-relaxed text-fg-2">
        <p>当接口返回 <code className="rounded bg-fill-2 px-1.5 py-0.5 font-mono text-[13px]">{slug}</code> 时，说明请求在到达模型之前（或在参数校验阶段）被拒绝，本次调用不会产生结果，也通常不会计费。</p>
        <h2 className="pt-2 font-serif text-lg text-fg-1">常见原因</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>请求参数不满足该模型的要求（尺寸、时长、格式或取值范围）</li>
          <li>参考图/音频的格式、尺寸或大小超出限制</li>
          <li>密钥无效、余额不足，或该模型未对当前密钥开放</li>
          <li>短时间请求过于频繁，触发限流</li>
        </ul>
        <h2 className="pt-2 font-serif text-lg text-fg-1">建议处理</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>对照该模型详情页的参数说明逐项检查请求体</li>
          <li>先用工作台以相同参数手动跑一次，确认能复现/排除</li>
          <li>若是限流或服务异常，稍后重试，并到状态页确认模型当前状态</li>
        </ul>
      </section>
      <div className="mt-6 flex gap-2">
        <Link href="/play" className="rounded-full bg-[var(--invert)] px-5 py-2 text-sm font-medium text-[var(--invert-fg)] hover:opacity-90">去工作台复现</Link>
        <Link href="/status" className="rounded-full border border-line-2 px-5 py-2 text-sm hover:bg-fill-1">查看模型状态</Link>
      </div>
    </div>
  );
}
