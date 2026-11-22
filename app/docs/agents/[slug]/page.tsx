import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/data";

export function generateStaticParams() {
  return (SITE.agents ?? []).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = (SITE.agents ?? []).find((x) => x.slug === slug);
  return { title: a ? a.name : slug };
}

export default async function AgentDoc({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = (SITE.agents ?? []).find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <div className="nl-enter mx-auto max-w-3xl py-10">
      <nav className="text-sm text-fg-3">
        <Link href="/docs" className="hover:text-fg-1">文档</Link>
        <span className="mx-2 text-fg-4">/</span>
        <Link href="/docs/agents" className="hover:text-fg-1">Agent 工具</Link>
        <span className="mx-2 text-fg-4">/</span>
        <span className="text-fg-1">{a.name}</span>
      </nav>
      <h1 className="mt-4 font-serif text-[32px]">{a.name}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-2">
        把 {a.name} 接到 NextLabs 后，它就能以同一套接口调用全部多模态模型：生成图片、视频、音频，以及对话推理。接入只需要一个 API 密钥。
      </p>
      <section className="mt-8 space-y-6 rounded-3xl border border-line-1 bg-surface-1 p-6">
        <div>
          <h2 className="font-serif text-lg">1 · 准备密钥</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-2">在本站「登录」中保存你的密钥，或在 {a.name} 的环境里设置环境变量：</p>
          <pre className="mt-2 overflow-auto rounded-2xl bg-fill-1 p-4 font-mono text-[12.5px]">export OPENAI_NEXT_API_KEY="sk-…"</pre>
        </div>
        <div>
          <h2 className="font-serif text-lg">2 · 指向接口地址</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-2">把 {a.name} 的模型服务地址（base URL）设为：</p>
          <pre className="mt-2 overflow-auto rounded-2xl bg-fill-1 p-4 font-mono text-[12.5px]">https://api.openai-next.com/v1</pre>
          <p className="mt-1.5 text-sm text-fg-3">接口与 OpenAI 风格兼容：对话走 /chat/completions，图片走 /images/generations，视频与音频为异步任务。</p>
        </div>
        <div>
          <h2 className="font-serif text-lg">3 · 验证</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-2">在 {a.name} 里发出一次最简单的请求（例如生成一张图），能正常返回即接入完成。遇到错误时对照错误码页排查。</p>
        </div>
      </section>
      <div className="mt-6 flex gap-2">
        <Link href="/play" className="rounded-full bg-[var(--invert)] px-5 py-2 text-sm font-medium text-[var(--invert-fg)] hover:opacity-90">先在工作台试一次</Link>
        <Link href="/errors" className="rounded-full border border-line-2 px-5 py-2 text-sm hover:bg-fill-1">错误码</Link>
      </div>
    </div>
  );
}
