import modelsJson from "../data/models.json";
import siteJson from "../data/site.json";
import workMediaJson from "../data/workmedia.json";

export interface ModelParam {
  id: string; label: string;
  kind: "select" | "number" | "range" | "text" | "textarea" | "switch";
  options?: string[]; default?: string | null;
  min?: string | null; max?: string | null; step?: string | null;
}
export interface Model {
  id: string; name: string;
  type: "text" | "image" | "video" | "audio";
  vendor: string; promptCount: number | null;
  endpoint: { method: string; url: string } | null;
  params: ModelParam[];
  exampleRequest: string | null;
  pricing: string[];
}
export interface Work { id: string; title: string; thumb: string; model: string | null }
export interface SiteData {
  home?: { stats?: Record<string, number | null> };
  chronicle?: { date: string; text: string; modelId: string | null }[];
  updates?: { version: string; date: string; items: string[] }[];
  status?: { model: string; status: string; rate: string; latency: string; runs: string; note: string }[];
  works?: Work[];
  recipes?: { title: string; desc: string; href: string }[];
  errors?: { slug: string; title: string }[];
  agents?: { slug: string; name: string }[];
}

export const MODELS: Model[] = Object.values(modelsJson as Record<string, Model>);
export const MODEL_MAP: Record<string, Model> = modelsJson as Record<string, Model>;
export const SITE: SiteData = siteJson as SiteData;
export const WORK_MEDIA: Record<string, string> = workMediaJson as Record<string, string>;

// 部署子路径（GitHub Pages 项目站点为 /NextLab-React）；本地为空。
// 手写绝对路径的静态资源（图片、图标）必须带上它，Next 的路由与 _next 资源由 basePath 自动处理。
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const TYPE_LABEL: Record<Model["type"], string> = { text: "文本", image: "图像", video: "视频", audio: "音频" };
export const TYPE_ORDER: Model["type"][] = ["text", "image", "video", "audio"];

export const VENDORS: string[] = Array.from(new Set(MODELS.map((m) => m.vendor).filter(Boolean))).sort();

export function endpointPath(m: Model): string {
  if (m.endpoint?.url) {
    try { return new URL(m.endpoint.url).pathname; } catch { /* fall through */ }
  }
  if (m.type === "image") return "/v1/images/generations";
  if (m.type === "video") return "/v1/videos/generations";
  if (m.type === "audio") return "/v1/audio/generations";
  return "/v1/chat/completions";
}

export function relatedModels(m: Model, n = 6): Model[] {
  return MODELS.filter((x) => x.id !== m.id && (x.vendor === m.vendor || x.type === m.type))
    .sort((a, b) => Number(b.vendor !== m.vendor) - Number(a.vendor !== m.vendor))
    .slice(0, n);
}
