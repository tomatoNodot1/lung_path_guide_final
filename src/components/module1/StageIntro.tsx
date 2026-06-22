import { useEffect } from "react";
import { useGameState } from "../../lib/game-state";

export function StageIntro({ onNext }: { onNext: () => void }) {
  const { logAction } = useGameState();

  useEffect(() => {
    const audio = new Audio("/m1_intro.mp3");
    audio.play();
    logAction("m1_played_intro_audio");
    return () => {
      audio.pause();
    };
  }, [logAction]);

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-8 rounded-3xl bg-orange-50 p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div
          className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-orange-200 text-7xl shadow-lg"
          style={{ animation: "float-y 2.4s ease-in-out infinite" }}
          aria-label="护士小安"
        >
          👩‍⚕️
        </div>
        <p className="text-2xl font-bold leading-relaxed text-slate-800">
          您好！我是护士<span className="text-orange-600">小安</span>~
          <br />
          咱们就像拉家常一样，
          <br />
          花几分钟把"肺癌筛查"聊透彻。
          <br />
          别担心，非常简单！
        </p>
      </div>
      <button
        onClick={onNext}
        className="min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:translate-y-[2px] active:brightness-90"
      >
        开始聊天
      </button>
    </div>
  );
}