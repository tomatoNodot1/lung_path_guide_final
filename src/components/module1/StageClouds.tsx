import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Highlight } from "../Highlight";
import { Medal } from "./Medal";
import { useGameState } from "@/lib/game-state";

type Cloud = { q: string; a: ReactNode };

function stopAndResetAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

const CLOUDS: Cloud[] = [
  {
    q: "做CT辐射大不大呀？",
    a: (
      <>
        非常安全！一次检查的<Highlight>辐射量</Highlight>
        ，跟咱们坐几趟长途飞机差不多，完全在身体能承受的健康范围内。
      </>
    ),
  },
  {
    q: "这检查是不是挺贵的？",
    a: (
      <>
        以咱们山西省肿瘤医院为例，做一次大概也就<Highlight>两百多块钱</Highlight>
        。花两百多换一整年的安心，这笔"健康账"算下来可是非常划算的！
      </>
    ),
  },
  {
    q: "去医院排队检查是不是特别折腾？",
    a: (
      <>
        可快啦！在机器上躺平，听口令憋一口气，几秒钟就扫完了。算上准备时间，
        <Highlight>十几分钟</Highlight>就能全搞定。
      </>
    ),
  },
  {
    q: "万一查出点啥，我岂不是天天睡不着觉？",
    a: (
      <>
        大部分肺里的小点点都是<Highlight>良性</Highlight>
        的。哪怕真有点问题，咱们早发现、早除根，把主动权抓在自己手里，总比一直瞎猜瞎担心要强得多呀！
      </>
    ),
  },
];

export function StageClouds({ onNext }: { onNext: () => void }) {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const { logAction } = useGameState();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCloudAudio = useCallback(
    (cloudIndex: number) => {
      const num = cloudIndex + 1;
      stopAndResetAudio(audioRef.current);
      const audio = new Audio(`/m1_cloud${num}.mp3`);
      audioRef.current = audio;
      audio.play();
      logAction(`m1_played_cloud_${num}`);
    },
    [logAction],
  );

  useEffect(() => {
    return () => {
      stopAndResetAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  const allDone = popped.size === CLOUDS.length;

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-3xl bg-gradient-to-b from-sky-100 to-sky-200 p-5">
      <h2 className="text-center text-2xl font-bold text-slate-800">
        点开每朵乌云，听听小安的解答
      </h2>

      <div className="flex flex-1 flex-col gap-4">
        {CLOUDS.map((c, i) => {
          const isOpen = popped.has(i);
          return (
            <div key={i} className="min-h-[88px]">
              <AnimatePresence mode="wait">
                {!isOpen ? (
                  <motion.button
                    key="cloud"
                    onClick={() => {
                      playCloudAudio(i);
                      setPopped((p) => {
                        const n = new Set(p);
                        n.add(i);
                        return n;
                      });
                    }}
                    exit={{ scale: 0.2, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex min-h-[88px] w-full items-center gap-3 rounded-[40px] bg-slate-300/80 px-6 py-4 text-left text-xl font-bold text-slate-700 shadow-inner active:scale-[0.97]"
                  >
                    <span className="text-3xl">❓</span>
                    <span className="flex-1">{c.q}</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ scale: 0.6, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                    className="rounded-2xl bg-white p-5 text-xl leading-relaxed text-slate-700 shadow-md"
                  >
                    {c.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Medal color="green" label="障碍清除师" />
            <button
              onClick={onNext}
              className="min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:translate-y-[2px]"
            >
              消除顾虑，下一步
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}