import Link from "next/link";
import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; intro: string; sections: { h: string; body: string; code?: string }[] }> = {
  platforms: {
    title: "平台接入",
    intro: "各家厂商的模型被统一成一套接口：同一个密钥、同一个地址，按模型 id 切换背后的厂商。",
    sections: [
      { h: "接口地址与鉴权", body: "全部请求发往 https://api.openai-next.com，路径风格与 OpenAI 兼容。鉴权使用 Bearer 密钥：", code: 'Authorization: Bearer $OPENAI_NEXT_API_KEY' },
      { h: "按模型 id 调用", body: "不需要为每家厂商单独适配 SDK。把请求体里的 model 换成目标模型 id（例如 gpt-image-2、claude-sonnet-5-5、doubao-seedance-2-0-260128），其余参数按该模型详情页的说明填写。", code: 'POST /v1/images/generations\n{ "model": "gpt-image-2", "prompt": "…", "size": "1024x1024" }' },
      { h: "同步与异步", body: "文本与图片为同步返回；视频与音频为异步任务，创建后按任务 id 轮询，详见「异步任务」。" },
    ],
  },
  tasks: {
    title: "异步任务",
    intro: "视频、音频等耗时生成以任务形式运行：先创建，拿到任务 id，再轮询直到完成。",
    sections: [
      { h: "创建任务", body: "向模型的生成端点发 POST，响应里包含任务 id 与初始状态（pending/running）。", code: 'POST /v1/videos/generations\n→ { "id": "task_…", "status": "running" }' },
      { h: "轮询状态", body: "每隔数秒查询一次任务，直到 status 变为 succeeded/completed（结果里带产物地址）或 failed（带错误信息）。", code: "GET /v1/tasks/<task_id>" },
      { h: "超时与重试", body: "长视频可能需要数分钟。轮询请设置总超时（建议 ≥ 10 分钟）与退避间隔；任务失败时不要立即重提，先对照错误码确认原因。" },
    ],
  },
  files: {
    title: "文件与参考图",
    intro: "图生图、视频首帧、音频参考等场景需要把文件作为参数传入。",
    sections: [
      { h: "以 URL 引用", body: "文件若有公开地址，直接把 URL 填进对应参数（如 reference_image）。" },
      { h: "以 base64 传入", body: "本地文件可编码为 data URL 后填入同一参数。本站工作台的「添加参考图」就是这样做的：", code: '"reference_image": "data:image/png;base64,iVBORw0KGgo…"' },
      { h: "格式与尺寸", body: "常见限制：图片 PNG/JPEG/WEBP，尺寸与大小上限因模型而异；不符合时会返回对应的错误码（如 image_size）。提交前先在模型详情页确认参数说明。" },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: DOCS[slug]?.title ?? slug };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DOCS[slug];
  if (!d) notFound();
  return (
    <div className="nl-enter mx-auto max-w-3xl py-10">
      <nav className="text-sm text-fg-3">
        <Link href="/docs" className="hover:text-fg-1">文档</Link>
        <span className="mx-2 text-fg-4">/</span>
        <span className="text-fg-1">{d.title}</span>
      </nav>
      <h1 className="mt-4 font-serif text-[32px]">{d.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{d.intro}</p>
      <div className="mt-8 space-y-8">
        {d.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-xl">{s.h}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{s.body}</p>
            {s.code && <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-2xl border border-line-1 bg-surface-1 p-4 font-mono text-[12.5px] leading-relaxed text-fg-2">{s.code}</pre>}
          </section>
        ))}
      </div>
    </div>
  );
}
