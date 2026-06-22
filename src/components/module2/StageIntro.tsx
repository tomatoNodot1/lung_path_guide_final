import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameState } from "../../lib/game-state";

export function StageIntro({ onNext }: { onNext: () => void }) {
  // 引入全局状态，拿出用来做埋点的工具
  const { logAction } = useGameState();

  // ====== 新增的自动播放语音逻辑 ======
  useEffect(() => {
    const audio = new Audio('/m2_intro.mp3');
    audio.play().catch(() => {});
    logAction('m2_played_intro'); // 记录埋点

    // 如果长辈点得太快直接去了下一页，赶紧把声音掐断
    return () => { audio.pause(); };
  }, [logAction]);
  // ===================================

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-40 w-40 items-center justify-center rounded-full bg-sky-100 text-7xl shadow-lg ring-4 ring-sky-200"
      >
        👩‍⚕️
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center text-xl leading-relaxed text-slate-700"
      >
        欢迎来到“风险透视仪”！咱们用几个简单的选择题，给您的肺部做个初步的“风险画像”。心里有底，遇事才不慌~
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        onClick={onNext}
        className="mt-4 min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg transition active:bg-sky-700"
      >
        开始评估
      </motion.button>
    </div>
  );
}