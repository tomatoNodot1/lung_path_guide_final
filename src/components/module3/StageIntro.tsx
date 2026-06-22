import { useEffect } from "react";
import { motion } from "framer-motion";
import { Highlight } from "@/components/Highlight";
import { useGameState } from "../../lib/game-state"; // 新增：引入状态

export function StageIntro({ onNext }: { onNext: () => void }) {
  const { logAction } = useGameState(); // 新增：获取埋点工具

  // ====== 新增的自动播放欢迎语音逻辑 ======
  useEffect(() => {
    const audio = new Audio('/m3_intro.mp3');
    audio.play().catch(() => {});
    logAction('m3_played_intro');

    return () => { audio.pause(); };
  }, [logAction]);
  // =======================================

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: [0, 15, -10, 15, 0],
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: { duration: 0.4 },
          rotate: { duration: 1.6, repeat: Infinity, repeatDelay: 1.2 },
        }}
        className="flex h-40 w-40 items-center justify-center rounded-full bg-sky-100 text-7xl shadow-lg ring-4 ring-sky-200"
      >
        👩‍⚕️
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative w-full rounded-2xl border border-sky-200 bg-white px-5 py-4 shadow-md"
      >
        <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-l border-t border-sky-200 bg-white" />
        <p className="text-center text-xl leading-relaxed text-slate-700">
          最后一关咯！咱们花两分钟，像<Highlight>彩排</Highlight>一样体验一遍真实的CT检查，包教包会！
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        onClick={onNext}
        className="mt-4 min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg transition active:bg-sky-700"
      >
        开始彩排
      </motion.button>
    </div>
  );
}