import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameState } from "@/lib/game-state";

type ScanStep = 1 | 2 | 3;
type Phase = "inhale" | "hold" | "done";

export function StageScan({ onNext }: { onNext: () => void }) {
  const [scanStep, setScanStep] = useState<ScanStep>(1);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pb-6">
      {scanStep === 1 && <SubEnter onNext={() => setScanStep(2)} />}
      {scanStep === 2 && <SubScanning onNext={() => setScanStep(3)} />}
      {scanStep === 3 && <SubBreath onNext={onNext} />}
    </div>
  );
}

// 阶段 1：进检查室躺平
function SubEnter({ onNext }: { onNext: () => void }) {
  const { logAction } = useGameState();

  useEffect(() => {
    const audio = new Audio('/m3_scan_step1.mp3');
    audio.play().catch(() => {});
    logAction('m3_played_scan_step1');

    return () => { audio.pause(); };
  }, [logAction]);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[14px] border-slate-300" />
          <div className="absolute inset-6 rounded-full border-4 border-slate-200" />
          <span className="text-5xl">🛏️</span>
        </div>
        <p className="text-center text-xl leading-relaxed text-slate-700">
          请跟紧我，咱们进检查室啦。请躺平在柔软的检查床上，双手高举过头顶，身体放轻松。
        </p>
      </div>
      <button
        onClick={onNext}
        className="mt-auto min-h-16 w-full rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg active:bg-emerald-700"
      >
        我已经躺好啦
      </button>
    </>
  );
}

// 阶段 2：检查床移动
function SubScanning({ onNext }: { onNext: () => void }) {
  const { logAction } = useGameState();

  useEffect(() => {
    const audio = new Audio('/m3_scan_step2.mp3');
    audio.play().catch(() => {});
    logAction('m3_played_scan_step2');

    return () => { audio.pause(); };
  }, [logAction]);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-full border-[22px] border-slate-300 bg-slate-100 shadow-inner">
          <motion.div
            className="absolute left-0 right-0 h-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.9)]"
            initial={{ top: "10%" }}
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-center text-xl leading-relaxed text-slate-700">
          检查床正在慢慢移动，机器发出微弱的嗡嗡声是正常的，别怕。马上要听广播指挥咯。
        </p>
      </div>
      <button
        onClick={onNext}
        className="mt-auto min-h-16 w-full rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg active:bg-emerald-700"
      >
        准备听口令
      </button>
    </>
  );
}

// 阶段 3：听口令呼吸
function SubBreath({ onNext }: { onNext: () => void }) {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [count, setCount] = useState(5);
  const { logAction } = useGameState();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | null = null;
    let audio: HTMLAudioElement;

    // 0s: 播放吸气语音
    audio = new Audio('/m3_scan_breathe_in.mp3');
    audio.play().catch(() => {});
    logAction('m3_played_scan_breathe_in');

    // 5s（修改点）: 播放憋气语音 + 开始倒计时
    timers.push(
      setTimeout(() => {
        audio.pause();
        audio = new Audio('/m3_scan_hold_breath.mp3');
        audio.play().catch(() => {});
        logAction('m3_played_scan_hold_breath');

        setPhase("hold");
        setCount(5);
        interval = setInterval(() => {
          setCount((c) => (c > 1 ? c - 1 : c));
        }, 1000);
      }, 5000),
    );

    // 10s（修改点）: 播放完成语音
    timers.push(
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        audio.pause();
        audio = new Audio('/m3_scan_done.mp3');
        audio.play().catch(() => {});
        logAction('m3_played_scan_done');

        setPhase("done");
      }, 10000),
    );

    return () => {
      timers.forEach(clearTimeout);
      if (interval) clearInterval(interval);
      if (audio) audio.pause();
    };
  }, [logAction]);

  const ringColor =
    phase === "inhale"
      ? "bg-sky-400"
      : phase === "hold"
        ? "bg-rose-500"
        : "bg-emerald-400";

  const ringAnim =
    phase === "inhale"
      ? { scale: 1.6, opacity: 0.5 }
      : phase === "hold"
        ? { scale: 1.05, opacity: 0.85 }
        : { scale: 1.9, opacity: 0 };

  // 修改点：吸气动画的时长改为 5 秒
  const ringTransition =
    phase === "inhale"
      ? { duration: 5, ease: "easeInOut" as const }
      : phase === "hold"
        ? { duration: 0.4 }
        : { duration: 1 };

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <motion.div
            initial={{ scale: 1, opacity: 0.7 }}
            animate={ringAnim}
            transition={ringTransition}
            className={`absolute inset-0 rounded-full ${ringColor} shadow-2xl`}
          />
          {phase === "hold" && (
            <motion.span
              key={count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative text-8xl font-black text-white drop-shadow-lg"
            >
              {count}
            </motion.span>
          )}
        </div>

        {phase === "inhale" && (
          <p className="text-center text-2xl font-bold leading-relaxed text-sky-700">
            跟着光环，深深吸一口气——
          </p>
        )}
        {phase === "hold" && (
          <motion.p
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-center text-2xl font-bold leading-relaxed text-rose-600"
          >
            就像潜水一样，憋住气！千万别动！
          </motion.p>
        )}
        {phase === "done" && (
          <p className="text-center text-2xl font-bold leading-relaxed text-emerald-700">
            呼——可以正常呼吸啦！您配合得特别棒，检查完成！
          </p>
        )}
      </div>

      <AnimatePresence>
        {phase === "done" && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              logAction("m3_scan_completed");
              onNext();
            }}
            className="mt-auto min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg active:bg-sky-700"
          >
            查看检查报告
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}