import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useGameState } from "../lib/game-state";
import { Highlight } from "./Highlight";

const CONFETTI_COLORS = ["#f97316", "#facc15", "#34d399", "#38bdf8", "#a78bfa", "#fb7185"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 5,
        size: 8 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 40,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-10vh", x: 0, rotate: 0 }}
          animate={{ y: "110vh", x: p.drift, rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

export function AllCompletedPage() {
  // 💡 1. 这里的解构里加上了 soundEnabled，如果你的全局状态里叫 isMuted，就改成 !isMuted
  const { userId, logout, logAction, soundEnabled } = useGameState();
  const navigate = useNavigate();
  const [reviewing, setReviewing] = useState(false);
  const [copyHint, setCopyHint] = useState(false);

  // ====== 新增：受开关控制的音频连招播放逻辑 ======
  useEffect(() => {
    logAction("enter_all_completed");

    // 如果全局把声音关掉了，这里直接拦截，什么都不放
    if (soundEnabled === false) {
      return;
    }

    const audioCongrats = new Audio('/end_congrats.mp3');
    const audioWelfare = new Audio('/end_welfare_taiyuan.mp3');

    let currentAudio: HTMLAudioElement = audioCongrats;

    // 1. 只有开启声音时才播放
    audioCongrats.play().catch(() => {});

    // 2. 监听第一段，播完自动接续第二段
    const handleCongratsEnded = () => {
      currentAudio = audioWelfare;
      audioWelfare.play().catch(() => {});
    };
    audioCongrats.addEventListener('ended', handleCongratsEnded);

    // 3. 离开页面时的清理工作
    return () => {
      audioCongrats.removeEventListener('ended', handleCongratsEnded);
      if (currentAudio) currentAudio.pause();
    };
  }, [logAction, soundEnabled]); // 💡 2. 把 soundEnabled 放进依赖数组里，开关变化时能立刻响应
  // =====================================

  const handleSwitch = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <main className="relative flex flex-1 flex-col gap-6 bg-gradient-to-b from-amber-50 to-rose-50 px-1 pt-6">
      <Confetti />

      <div className="relative z-10 flex items-center justify-between">
        <p className="text-base text-slate-600">欢迎，编号 {userId}</p>
        <button
          onClick={handleSwitch}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-slate-500 active:scale-95"
          aria-label="切换账号"
        >
          <LogOut className="h-4 w-4" />
          切换账号
        </button>
      </div>

      <section className="relative z-10 flex flex-col items-center gap-4 pt-2">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl"
          aria-hidden
        >
          👩‍⚕️
        </motion.div>

        <div className="relative mx-2 rounded-3xl bg-white px-5 py-4 text-xl leading-relaxed text-slate-800 shadow-lg ring-1 ring-slate-200">
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-0 w-0 -translate-x-1/2"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: "14px solid #ffffff",
              filter: "drop-shadow(0 -1px 0 rgb(226 232 240))",
            }}
          />
          太棒啦！您已经成功<Highlight>通关</Highlight>，掌握了肺癌筛查的
          <Highlight>全部秘籍</Highlight>！
        </div>
      </section>

      <section className="relative z-10 mt-4 flex flex-col gap-3 rounded-2xl border-2 border-green-200 bg-green-50 p-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-green-700">
          <span aria-hidden>🎁</span>
          专属福利：太原市免费早癌筛查
        </h2>
        <div className="text-lg leading-relaxed text-green-800">
          <p>筛查对象：45-74 岁居民</p>
          <p className="mt-1">
            参与方式：微信搜索下方小程序，完成测评后，高危人群即可预约【山西省肿瘤医院】免费筛查（院本部：杏花岭区职工新村3号）。
          </p>
          <p className="mt-1 text-sm text-green-600">
            不在年龄范围内？也没关系！建议您也在每年的常规体检中关注肺部健康哦。
          </p>
        </div>
        {copyHint && (
          <p className="text-center text-base font-bold text-green-700">
            已复制成功，快去微信搜索吧！
          </p>
        )}
        <button
          onClick={async () => {
            await navigator.clipboard.writeText("中国居民癌症防控行动");
            setCopyHint(true);
            logAction("m3_copy_taiyuan_program");
            setTimeout(() => setCopyHint(false), 2000);
          }}
          className="min-h-14 w-full rounded-xl bg-green-600 p-3 text-lg font-bold text-white shadow active:translate-y-[2px]"
        >
          一键复制小程序名称
        </button>
      </section>

      {reviewing && (
        <section className="relative z-10 flex flex-col gap-3">
          {[
            { n: 1, title: "科普小助手", desc: "认识肺癌与筛查" },
            { n: 2, title: "风险透视仪", desc: "评估你的风险" },
            { n: 3, title: "未来决策者", desc: "做出筛查决定" },
          ].map((m) => (
            <div
              key={m.n}
              className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-xl text-white">
                ✓
              </span>
              <div>
                <p className="text-lg font-bold text-slate-800">{m.title}</p>
                <p className="text-sm text-slate-500">{m.desc}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="relative z-10 mt-auto flex flex-col gap-3 pb-6">
        <button
          onClick={() => {
            setReviewing((r) => !r);
            logAction(reviewing ? "review_collapse" : "review_open");
          }}
          className="min-h-16 w-full rounded-2xl bg-orange-500 p-4 text-xl font-bold text-white shadow active:scale-[0.98]"
        >
          {reviewing ? "收起回顾" : "回顾我的旅程"}
        </button>
        <button
          onClick={handleSwitch}
          className="min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white p-3 text-lg font-bold text-slate-600 active:scale-[0.98]"
        >
          返回登入页
        </button>
      </div>
    </main>
  );
}