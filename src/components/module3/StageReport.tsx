import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Highlight } from "@/components/Highlight";
import { KnowItDialog } from "@/components/KnowItDialog";
import { Medal } from "@/components/module1/Medal";
import { useGameState } from "@/lib/game-state";

type Term = "nodule" | "size" | "followup";

const EXPLAIN: Record<Term, { title: string; body: string }> = {
  nodule: {
    title: "实性结节？",
    body: "肺里长了个小点点，非常常见，大部分都是良性的，不用自己吓自己。",
  },
  size: {
    title: "5mm？",
    body: "小于 6 毫米的小点点，指南说不用吃药也不用手术，它自己待着就行。",
  },
  followup: {
    title: "年度复查？",
    body: "这就叫『敌不动我不动』，咱们每年回来给它拍个照，看看长没长，最安全踏实。",
  },
};

export function StageReport({ onNext }: { onNext: () => void }) {
  const [viewed, setViewed] = useState<Record<Term, boolean>>({
    nodule: false,
    size: false,
    followup: false,
  });
  const [open, setOpen] = useState<Term | null>(null);
  const { logAction } = useGameState();

  // ====== 新增：音频控制器 ======
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 离开页面时打扫战场，停掉声音
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);
  // =============================

  const allViewed = viewed.nodule && viewed.size && viewed.followup;

  const handleOpen = (t: Term) => {
    if (t === "nodule") logAction("m3_view_nodule");
    else if (t === "size") logAction("m3_view_size");
    else if (t === "followup") logAction("m3_view_followup");
    
    setOpen(t);
    setViewed((v) => ({ ...v, [t]: true }));

    // ====== 新增：播放对应的解读语音 ======
    if (audioRef.current) {
      audioRef.current.pause(); // 停掉上一个可能没播完的声音
    }
    audioRef.current = new Audio(`/m3_report_${t}.mp3`);
    audioRef.current.play().catch(() => {});
    // ===================================
  };

  const handleClose = () => {
    setOpen(null);
    // ====== 新增：如果长辈关掉弹窗，声音也立刻停止 ======
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pb-6">
      <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between border-b border-dashed border-slate-300 pb-2">
          <span className="text-base font-bold text-slate-500">胸部 CT 报告</span>
          <span className="text-base text-slate-400">No. 2026-0622</span>
        </div>
        <p className="text-xl leading-relaxed text-slate-800">
          右肺上叶见一<Highlight>实性结节</Highlight>，大小约 <Highlight>5mm</Highlight>。
        </p>
        <p className="mt-3 text-xl leading-relaxed text-slate-800">
          结论：建议<Highlight>年度复查</Highlight>。
        </p>
      </div>

      <p className="text-center text-xl leading-relaxed text-slate-700">
        点一下下面三个词，听小安给您讲讲到底啥意思~
      </p>

      <div className="flex flex-col gap-3">
        {(Object.keys(EXPLAIN) as Term[]).map((t) => (
          <button
            key={t}
            onClick={() => handleOpen(t)}
            className={`min-h-16 w-full rounded-full border-2 text-xl font-bold shadow-sm transition active:translate-y-[2px] ${
              viewed[t]
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-orange-300 bg-white text-orange-600"
            }`}
          >
            {viewed[t] ? "✓ " : ""}
            {EXPLAIN[t].title}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {allViewed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <Medal color="blue" label="解读能手" />
            <button
              onClick={onNext}
              className="min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg active:bg-sky-700"
            >
              生成随访计划
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <KnowItDialog
        open={open !== null}
        title={open ? EXPLAIN[open].title : undefined}
        onClose={handleClose}
      >
        {open ? EXPLAIN[open].body : null}
      </KnowItDialog>
    </div>
  );
}