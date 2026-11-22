export const API_BASE = "https://api.openai-next.com";

export function getApiKey(): string {
  try { return localStorage.getItem("nl-api-key") || ""; } catch { return ""; }
}
export function setApiKey(k: string) {
  try { k ? localStorage.setItem("nl-api-key", k) : localStorage.removeItem("nl-api-key"); } catch {}
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const key = getApiKey();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as Record<string, string> || {}) };
  if (key) headers["Authorization"] = "Bearer " + key;
  return fetch(API_BASE + path, { ...init, headers });
}

export interface RunResult {
  kind: "image" | "video" | "audio" | "text" | "json";
  url?: string;
  text?: string;
  raw: unknown;
}

function pickMediaUrl(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;
  if (typeof obj.url === "string" && /^https?:/.test(obj.url)) return obj.url;
  if (Array.isArray(obj.data) && obj.data[0]) return pickMediaUrl(obj.data[0]);
  if (obj.output) return pickMediaUrl(obj.output);
  if (obj.result) return pickMediaUrl(obj.result);
  return null;
}

/** Run a generation request against the model's endpoint; poll async tasks when the API returns one. */
export async function runGeneration(endpointPath: string, body: Record<string, unknown>, type: string): Promise<RunResult> {
  const res = await apiFetch(endpointPath, { method: "POST", body: JSON.stringify(body) });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.message || ("HTTP " + res.status));
  const url = pickMediaUrl(data);
  if (url) return { kind: type === "image" || type === "video" || type === "audio" ? (type as RunResult["kind"]) : "json", url, raw: data };
  if (data?.data?.[0]?.b64_json) {
    return { kind: "image", url: "data:image/png;base64," + data.data[0].b64_json, raw: data };
  }
  const taskId = data?.id || data?.task_id;
  const status = String(data?.status || "").toLowerCase();
  if (taskId && (status === "pending" || status === "running" || status === "processing" || status === "queued" || type === "video" || type === "audio")) {
    for (let i = 0; i < 80; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pr = await apiFetch("/v1/tasks/" + taskId);
      const pd: any = await pr.json().catch(() => ({}));
      const pu = pickMediaUrl(pd);
      if (pu) return { kind: type as RunResult["kind"], url: pu, raw: pd };
      const ps = String(pd?.status || "").toLowerCase();
      if (ps === "failed" || ps === "error") throw new Error(pd?.error?.message || "任务失败");
      if (ps === "succeeded" || ps === "completed" || ps === "success") return { kind: "json", raw: pd };
    }
    throw new Error("任务超时");
  }
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text === "string") return { kind: "text", text, raw: data };
  return { kind: "json", raw: data };
}
