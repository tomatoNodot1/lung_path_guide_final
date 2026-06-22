import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useGameState } from "../lib/game-state";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "肺癌筛查全流程体验" },
      { name: "description", content: "面向长者的肺癌筛查科普严肃游戏" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { userId, setUserId, hydrated } = useGameState();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  if (!hydrated) return null;

  const enterHall = () => navigate({ to: "/hall" });

  const handleSubmit = async () => {
    const id = input.trim();
    if (!id) return;
    setBusy(true);
    await setUserId(id);
    setBusy(false);
    enterHall();
  };

  return (
    <main className="flex flex-1 flex-col gap-6 pt-20">
      <h1 className="text-3xl font-black leading-tight">
        肺癌筛查
        <br />
        全流程体验
      </h1>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold">隐私提示</h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-700">
          本游戏仅用于<span className="highlight-pulse">健康科普</span>，
          所有答题数据仅用于研究分析，不会收集您的个人隐私信息。
        </p>
      </section>

      {userId ? (
        <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xl">
            欢迎回来，您的编号是：
            <span className="ml-1 font-black text-orange-600">{userId}</span>
          </p>
          <button
            onClick={enterHall}
            className="min-h-16 w-full rounded-2xl bg-orange-500 p-4 text-xl font-bold text-white shadow active:scale-[0.98]"
          >
            进入游戏大厅
          </button>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <label className="text-xl font-bold" htmlFor="uid">
            请输入您的专属数字编号
          </label>
          <input
            id="uid"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：1024"
            className="min-h-16 w-full rounded-2xl border-2 border-slate-200 px-4 text-2xl tracking-widest outline-none focus:border-orange-500"
          />
          <button
            disabled={busy || !input.trim()}
            onClick={handleSubmit}
            className="min-h-16 w-full rounded-2xl bg-orange-500 p-4 text-xl font-bold text-white shadow active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "正在进入…" : "开始体验"}
          </button>
        </section>
      )}
    </main>
  );
}
