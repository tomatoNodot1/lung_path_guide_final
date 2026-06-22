import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Medal } from "@/components/module1/Medal";
import { useGameState } from "@/lib/game-state";

const PLAN_TEXT =
  "【肺部随访计划】\n姓名：本人\n检查结果：右肺上叶实性结节，约 5mm\n建议：每年复查一次低剂量螺旋 CT（LDCT）\n下次复查时间：2027 年 6 月\n复查医院：山西省肿瘤医院 呼吸内科\n注意事项：保持健康作息，戒烟，避免二手烟。";

const HOSPITAL_TEXT = "山西省肿瘤医院 呼吸内科";

export function StagePlan({ onFinish, busy }: { onFinish: () => void; busy: boolean }) {
  const [copiedOnce, setCopiedOnce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { logAction } = useGameState();

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
    setCopiedOnce(true);
    setToast("已复制成功");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pb-6">
      <div className="rounded-3xl bg-gradient-to-br from-sky-100 to-blue-50 p-6 shadow-xl ring-2 ring-sky-200">
        <h2 className="mb-3 text-3xl font-black text-sky-800">📋 我的随访卡</h2>
        <pre className="whitespace-pre-wrap break-words font-sans text-xl leading-relaxed text-slate-800">
          {PLAN_TEXT}
        </pre>
      </div>

      <p className="text-center text-xl leading-relaxed text-slate-700">
        您的专属随访卡出炉啦！点击下面按钮，可以直接把文字复制到手机里备用哦。
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            logAction("m3_copy_plan");
            copy(PLAN_TEXT);
          }}
          className="min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:bg-orange-600"
        >
          📄 复制随访计划文字
        </button>
        <button
          onClick={() => {
            logAction("m3_copy_hospital");
            copy(HOSPITAL_TEXT);
          }}
          className="min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:bg-orange-600"
        >
          🏥 复制山西省肿瘤医院呼吸科名称
        </button>
      </div>

      <AnimatePresence>
        {copiedOnce && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Medal color="red" label="行动领袖" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onFinish}
        disabled={busy}
        className="mt-auto min-h-16 w-full rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg transition active:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? "保存中..." : "完成所有体验，返回大厅"}
      </button>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-6 py-3 text-lg font-bold text-white shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}