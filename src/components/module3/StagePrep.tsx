import { useState, useEffect } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { KnowItDialog } from "@/components/KnowItDialog";
import { useGameState } from "@/lib/game-state";

type ItemKey = "necklace" | "phone" | "key" | "card";
const ITEMS: { key: ItemKey; icon: string; label: string }[] = [
  { key: "necklace", icon: "📿", label: "项链" },
  { key: "phone", icon: "📱", label: "手机" },
  { key: "key", icon: "🔑", label: "钥匙" },
  { key: "card", icon: "💳", label: "医保卡" },
];

export function StagePrep({ onNext }: { onNext: () => void }) {
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const cardShake = useAnimationControls();
  const { logAction } = useGameState();

  // ====== 新增 1：进入页面自动播放引导语音 ======
  useEffect(() => {
    const audio = new Audio('/m3_prep_intro.mp3');
    audio.play().catch(() => {});
    logAction('m3_played_prep_intro');

    return () => { audio.pause(); };
  }, [logAction]);
  // ============================================

  const handleClick = async (k: ItemKey) => {
    if (k === "card") {
      logAction("m3_clicked_medical_card");
      
      // ====== 新增 2：点击医保卡时播放专属提示语音 ======
      const cardAudio = new Audio('/m3_prep_card.mp3');
      cardAudio.play().catch(() => {});
      logAction('m3_played_prep_card');
      // ===============================================

      setDialogOpen(true);
      await cardShake.start({
        x: [-14, 14, -12, 12, -8, 8, 0],
        transition: { duration: 0.55 },
      });
      return;
    }
    
    // 正常的金属物品移除埋点
    logAction(`m3_clicked_item_${k}`);
    setRemoved((r) => ({ ...r, [k]: true }));
  };

  const ready = removed.necklace && removed.phone && removed.key;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pb-6">
      <p className="text-center text-xl leading-relaxed text-slate-700">
        金属物件会晃坏机器的&ldquo;眼睛&rdquo;。点一下这些金属首饰和手机，放进储物柜吧。
      </p>

      <div className="flex items-center justify-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-6xl shadow ring-4 ring-blue-100">
          🧍
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {ITEMS.map((it) =>
            removed[it.key] ? null : (
              <motion.button
                key={it.key}
                layout
                initial={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                animate={it.key === "card" ? cardShake : undefined}
                onClick={() => handleClick(it.key)}
                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 bg-white text-xl font-bold text-slate-700 shadow-md active:translate-y-[2px]"
              >
                <span className="text-5xl">{it.icon}</span>
                <span>{it.label}</span>
              </motion.button>
            ),
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {ready && (
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={onNext}
            className="mt-auto min-h-16 w-full rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg active:bg-emerald-700"
          >
            随身物品已整理，进检查室
          </motion.button>
        )}
      </AnimatePresence>

      <KnowItDialog
        open={dialogOpen}
        title="小安提醒"
        onClose={() => setDialogOpen(false)}
      >
        哎呀，医保卡可是咱们的&ldquo;通行证&rdquo;，千万得拿好，不能点掉哦！
      </KnowItDialog>
    </div>
  );
}