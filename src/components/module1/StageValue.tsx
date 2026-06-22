import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KnowItDialog } from "../KnowItDialog";
import { Medal } from "./Medal";
import { useGameState } from "@/lib/game-state";

const OPTIONS = [
  "A. 为了家里人",
  "B. 为了圆心愿",
  "C. 为了求踏实",
  "D. 就是为了自己",
];

function stopAndResetAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function StageValue({ onFinish, busy }: { onFinish: () => void; busy: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showMedal, setShowMedal] = useState(false);
  const { logAction } = useGameState();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(
    (src: string, action: string) => {
      stopAndResetAudio(audioRef.current);
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.play();
      logAction(action);
    },
    [logAction],
  );

  useEffect(() => {
    playAudio("/m1_value_question.mp3", "m1_played_value_question");
    return () => {
      stopAndResetAudio(audioRef.current);
      audioRef.current = null;
    };
  }, [playAudio]);

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    playAudio("/m1_value_feedback.mp3", "m1_played_value_feedback");
    setTimeout(() => setShowDialog(true), 600);
  };

  return (
    <div className="relative flex flex-1 flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-b from-rose-50 to-amber-50 p-5">
      {/* family-line decoration */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-30"
        viewBox="0 0 200 60"
        fill="none"
        stroke="#f43f5e"
        strokeWidth="0.8"
      >
        <circle cx="60" cy="30" r="10" />
        <circle cx="100" cy="28" r="12" />
        <circle cx="140" cy="32" r="9" />
        <path d="M40 60 L60 40 L80 60 M82 60 L100 40 L118 60 M120 60 L140 42 L160 60" />
      </svg>

      {!showMedal ? (
        <>
          <h2 className="text-2xl font-bold leading-relaxed text-slate-800">
            其实咱们努力保重身体，
            <br />
            <span className="text-rose-600">"谁是您最想保持健康的理由？"</span>
          </h2>

          <div className="flex flex-col gap-3">
            {OPTIONS.map((o, i) => (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => handlePick(i)}
                className={`min-h-16 w-full rounded-2xl border-2 px-5 py-3 text-left text-xl font-bold transition active:translate-y-[2px] ${
                  picked === i
                    ? "border-rose-500 bg-rose-100 text-rose-700"
                    : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <Medal color="red" label="行动先锋" />
          <p className="text-center text-xl text-slate-700">
            恭喜完成模块一！
            <br />
            您已迈出守护健康的第一步。
          </p>
          <button
            disabled={busy}
            onClick={onFinish}
            className="min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:translate-y-[2px] disabled:opacity-60"
          >
            {busy ? "保存中..." : "完成本模块，返回大厅"}
          </button>
        </div>
      )}

      {/* hearts */}
      <AnimatePresence>
        {picked !== null && !showMedal && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute bottom-0 text-3xl"
                style={{
                  left: `${5 + i * 8}%`,
                  animation: `heart-rise 2.4s ease-out ${i * 0.12}s forwards`,
                }}
              >
                ❤️
              </span>
            ))}
          </div>
        )}
      </AnimatePresence>

      <KnowItDialog
        open={showDialog}
        title="小安想对您说"
        onClose={() => {
          setShowDialog(false);
          setShowMedal(true);
        }}
      >
        不管是哪种理由，这都是咱们管好身体的最大动力！做个筛查，就像给这份牵挂上了一份
        <span className="font-bold text-orange-600">"保险"</span>
        。记住，您的健康，对所有在乎您的人来说，都是<span className="font-bold text-rose-600">无价之宝</span>。
      </KnowItDialog>
    </div>
  );
}