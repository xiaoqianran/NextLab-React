"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getApiKey, setApiKey } from "./api";

interface Store {
  theme: "light" | "dark";
  toggleTheme: () => void;
  apiKey: string;
  saveApiKey: (k: string) => void;
  keyModalOpen: boolean;
  setKeyModalOpen: (v: boolean) => void;
  toast: (msg: string) => void;
}

const Ctx = createContext<Store>({
  theme: "light", toggleTheme: () => {}, apiKey: "", saveApiKey: () => {},
  keyModalOpen: false, setKeyModalOpen: () => {}, toast: () => {},
});
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [apiKey, setKey] = useState("");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const tid = useRef(0);

  useEffect(() => {
    const t = (localStorage.getItem("nl-theme") as "light" | "dark") || "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
    setKey(getApiKey());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("nl-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.classList.toggle("light", next === "light");
      return next;
    });
  }, []);

  const saveApiKey = useCallback((k: string) => { setApiKey(k); setKey(k); }, []);

  const toast = useCallback((msg: string) => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ theme, toggleTheme, apiKey, saveApiKey, keyModalOpen, setKeyModalOpen, toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="nl-pop pointer-events-auto rounded-full border border-line-1 bg-surface-1 px-4 py-2 text-sm text-fg-1 shadow-[var(--elevation-float)]">{t.msg}</div>
        ))}
      </div>
      {keyModalOpen && <KeyModal close={() => setKeyModalOpen(false)} />}
    </Ctx.Provider>
  );
}

function KeyModal({ close }: { close: () => void }) {
  const { apiKey, saveApiKey, toast } = useStore();
  const [val, setVal] = useState(apiKey);
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="nl-fade absolute inset-0 bg-[var(--scrim)]" onClick={close} />
      <div className="glass-panel nl-pop relative w-full max-w-md rounded-3xl p-6">
        <h3 className="font-serif text-xl">API 密钥</h3>
        <p className="mt-1 text-sm text-fg-3">本地访客模式：密钥只保存在此浏览器，生成请求由浏览器直连 api.openai-next.com。</p>
        <input
          value={val} onChange={(e) => setVal(e.target.value)} type="password" placeholder="sk-…"
          className="mt-4 w-full rounded-xl border border-line-2 bg-surface-1 px-3 py-2.5 font-mono text-sm outline-none focus:border-accent"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={close} className="rounded-full border border-line-2 px-4 py-2 text-sm hover:bg-fill-2">取消</button>
          <button onClick={() => { saveApiKey(val.trim()); toast(val.trim() ? "密钥已保存到本地" : "密钥已清除"); close(); }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-strong">保存</button>
        </div>
      </div>
    </div>
  );
}
