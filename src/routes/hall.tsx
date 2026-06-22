import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useGameState } from "../lib/game-state";
import { AllCompletedPage } from "../components/AllCompletedPage";

export const Route = createFileRoute("/hall")({
  ssr: false,
  component: HallPage,
});

type ModuleCard = {
  n: 1 | 2 | 3;
  title: string;
  subtitle: string;
  to: "/module1" | "/module2" | "/module3";
  color: string;
};

const MODULES: ModuleCard[] = [
  { n: 1, title: "科普小助手", subtitle: "认识肺癌与筛查", to: "/module1", color: "bg-orange-500" },
  { n: 2, title: "风险透视仪", subtitle: "评估你的风险", to: "/module2", color: "bg-sky-600" },
  { n: 3, title: "未来决策者", subtitle: "做出筛查决定", to: "/module3", color: "bg-emerald-600" },
];

function HallPage() {
  const { userId, completed, hydrated, resetProgress, logout } = useGameState();
  const navigate = useNavigate();
  const router = useRouter();
  const [shaking, setShaking] = useState<number | null>(null);

  useEffect(() => {
    if (hydrated && !userId) navigate({ to: "/" });
  }, [hydrated, userId, navigate]);

  if (!hydrated || !userId) return null;

  if (completed.g1 && completed.g2 && completed.g3) {
    return <AllCompletedPage />;
  }

  const isUnlocked = (n: 1 | 2 | 3) => {
    if (n === 1) return true;
    if (n === 2) return completed.g1;
    return completed.g2;
  };

  return (
    <main className="flex flex-1 flex-col gap-6 pt-20">
      <header>
        <div className="flex items-center justify-between">
          <p className="text-base text-slate-500">欢迎，编号 {userId}</p>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-slate-500 active:scale-95"
            aria-label="切换账号"
          >
            <LogOut className="h-4 w-4" />
            切换账号
          </button>
        </div>
        <h1 className="mt-1 text-3xl font-black">游戏大厅</h1>
        <p className="mt-2 text-lg text-slate-600">请按顺序解锁三个模块</p>
      </header>

      <div className="flex flex-col gap-4">
        {MODULES.map((m) => {
          const unlocked = isUnlocked(m.n);
          const done = completed[`g${m.n}` as const];
          return (
            <motion.button
              key={m.n}
              animate={shaking === m.n ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => {
                if (!unlocked) {
                  setShaking(m.n);
                  setTimeout(() => setShaking(null), 450);
                  return;
                }
                navigate({ to: m.to });
              }}
              className={`relative flex min-h-28 w-full items-center gap-4 rounded-3xl p-5 text-left shadow-sm ring-1 ring-slate-200 ${
                unlocked ? "bg-white" : "bg-slate-100 opacity-60"
              }`}
            >
              <div
                className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-black text-white ${m.color}`}
              >
                {m.n}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xl font-bold">{m.title}</h2>
                  {done && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-700">
                      已完成
                    </span>
                  )}
                </div>
                <p className="mt-1 text-base text-slate-600">{m.subtitle}</p>
              </div>
              {!unlocked && (
                <Lock className="h-6 w-6 shrink-0 text-slate-500" aria-hidden />
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={async () => {
          await resetProgress();
          router.invalidate();
        }}
        className="mt-4 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white p-3 text-lg font-bold text-slate-600 active:scale-[0.98]"
      >
        重置进度（测试用）
      </button>
    </main>
  );
}