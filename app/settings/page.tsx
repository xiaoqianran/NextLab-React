"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { theme, toggleTheme, apiKey, saveApiKey, setKeyModalOpen, toast } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const clearAll = () => {
    for (const k of ["nl-api-key", "nl-theme", "nl_chat_history", "nl_play_last", "nl_play_state"]) localStorage.removeItem(k);
    saveApiKey("");
    toast("本地数据已清除，刷新后生效");
    setConfirmClear(false);
  };
  return (
    <div className="nl-enter mx-auto max-w-2xl py-10">
      <h1 className="font-serif text-[34px]">设置</h1>
      <p className="mt-1 text-sm text-fg-3">本站是本地访客模式：没有账号体系，所有设置只保存在此浏览器。</p>
      <section className="mt-8 space-y-6">
        <div className="rounded-3xl border border-line-1 bg-surface-1 p-6">
          <h2 className="font-medium">API 密钥</h2>
          <p className="mt-1 text-sm text-fg-3">{apiKey ? "已保存（浏览器直连接口时使用）" : "尚未保存 — 运行时会提示你填写"}</p>
          <button onClick={() => setKeyModalOpen(true)} className="mt-3 rounded-full border border-line-2 px-4 py-2 text-sm hover:bg-fill-1">
            {apiKey ? "更换密钥" : "设置密钥"}
          </button>
        </div>
        <div className="flex items-center justify-between rounded-3xl border border-line-1 bg-surface-1 p-6">
          <div>
            <h2 className="font-medium">外观</h2>
            <p className="mt-1 text-sm text-fg-3">当前为{theme === "light" ? "浅色" : "深色"}主题</p>
          </div>
          <button onClick={toggleTheme} className="rounded-full border border-line-2 px-4 py-2 text-sm hover:bg-fill-1">
            切换到{theme === "light" ? "深色" : "浅色"}
          </button>
        </div>
        <div className="rounded-3xl border border-danger/30 bg-surface-1 p-6">
          <h2 className="font-medium text-danger">清除本地数据</h2>
          <p className="mt-1 text-sm text-fg-3">删除保存在此浏览器中的密钥、主题、对话历史与工作台状态。</p>
          {confirmClear ? (
            <div className="mt-3 flex gap-2">
              <button onClick={clearAll} className="rounded-full bg-[var(--state-danger)] px-4 py-2 text-sm font-medium text-white">确认清除</button>
              <button onClick={() => setConfirmClear(false)} className="rounded-full border border-line-2 px-4 py-2 text-sm hover:bg-fill-1">取消</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="mt-3 rounded-full border border-line-2 px-4 py-2 text-sm hover:bg-fill-1">清除…</button>
          )}
        </div>
      </section>
    </div>
  );
}
