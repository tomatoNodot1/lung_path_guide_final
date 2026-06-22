import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGameState } from "../lib/game-state";

type Props = {
  n: 1 | 2 | 3;
  title: string;
  requires?: 1 | 2;
};

export function ModulePlaceholder({ n, title, requires }: Props) {
  const { userId, completed, markCompleted, hydrated } = useGameState();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!userId) {
      navigate({ to: "/" });
      return;
    }
    if (requires && !completed[`g${requires}` as const]) {
      navigate({ to: "/hall" });
    }
  }, [hydrated, userId, completed, requires, navigate]);

  if (!hydrated || !userId) return null;

  const done = completed[`g${n}` as const];

  return (
    <main className="flex flex-1 flex-col gap-6 pt-20">
      <header>
        <p className="text-base text-slate-500">模块 {n}</p>
        <h1 className="mt-1 text-3xl font-black">{title}</h1>
        <p className="mt-2 text-lg text-slate-600">这里将放置具体内容（占位）。</p>
      </header>

      <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-8">
        <p className="text-center text-lg text-slate-500">内容待开发</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await markCompleted(n);
            setBusy(false);
            navigate({ to: "/hall" });
          }}
          className="min-h-16 w-full rounded-2xl bg-orange-500 p-4 text-xl font-bold text-white shadow active:scale-[0.98] disabled:opacity-50"
        >
          {done ? "再次完成（测试）" : "完成本模块（测试用）"}
        </button>
        <button
          onClick={() => navigate({ to: "/hall" })}
          className="min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white p-3 text-lg font-bold text-slate-700 active:scale-[0.98]"
        >
          返回大厅
        </button>
      </div>
    </main>
  );
}