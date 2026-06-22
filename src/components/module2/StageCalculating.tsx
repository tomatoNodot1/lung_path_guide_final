import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameState } from "../../lib/game-state"; // 引入状态

export function StageCalculating({ onDone }: { onDone: () => void }) {
  const { logAction } = useGameState(); // 获取埋点工具

  // 动画时长 2 秒后自动跳转
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  // 新增：进入页面立即播放安抚语音并埋点
  useEffect(() => {
    const audio = new Audio('/m2_calculating.mp3');
    audio.play().catch(() => {});
    logAction('m2_played_calculating');

    // 2秒后组件卸载时立即停止声音，防止带入下一个页面
    return () => { audio.pause(); };
  }, [logAction]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 rounded-full border-4 border-sky-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-sky-500" />
        <div className="absolute inset-4 rounded-full border-2 border-sky-100" />
        <div
          className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-b-sky-400"
          style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.7)]"
          />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xl font-medium text-slate-600"
      >
        小安正在为您生成风险画像，请稍候...
      </motion.p>
    </div>
  );
}