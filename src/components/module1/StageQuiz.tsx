import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Highlight } from "../Highlight";
import { Medal } from "./Medal";
import { useGameState } from "@/lib/game-state";

type Option = { label: string; feedback: ReactNode };
type Question = { question: string; options: [Option, Option] };

function stopAndResetAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

const QUESTIONS: Question[] = [
  {
    question: "我明明没觉得哪里不舒服，为啥还要做肺癌筛查呢？",
    options: [
      {
        label: "A. 查出问题能早点治",
        feedback: (
          <>
            太对啦！肺癌早期就像个"隐形人"，不痛不痒的。筛查就像
            <Highlight>安检</Highlight>，提前揪出隐患，咱们治好它的机会特别大！
          </>
        ),
      },
      {
        label: "B. 等身体有感觉再去查",
        feedback: (
          <>
            其实呀，这是个常见误区。肺癌早期特别能"藏"，等出现不舒服的症状时，往往已经错过了最佳治疗时机。咱们提前做个
            <Highlight>安检</Highlight>，防患于未然，治愈的希望也大得多！
          </>
        ),
      },
    ],
  },
  {
    question: "下面这两种情况，您觉得谁的风险更大？",
    options: [
      {
        label: "A. 50岁以上抽了20年烟，无家族史",
        feedback: (
          <>
            您考虑得有道理，抽烟确实是头号"健康杀手"。但医学上发现，如果再加上家里有血缘关系的亲属得过这个病，风险就会叠加。所以两样全占的人，咱们更得提高警惕哦。
          </>
        ),
      },
      {
        label: "B. 50岁以上抽了20年烟，有家族史",
        feedback: (
          <>
            眼光真准！抽烟加上家族里有人得过，就像是<Highlight>双重预警</Highlight>
            。风险叠加在一起，这类人群是我们最需要重点保护和提早筛查的。
          </>
        ),
      },
    ],
  },
  {
    question: "如果要给肺部做个性价比最高的早期体检，医生最推荐啥？",
    options: [
      {
        label: "A. 低剂量螺旋CT",
        feedback: (
          <>
            现在呀，大夫最推荐的是<Highlight>低剂量螺旋CT</Highlight>
            。它就像给肺部拍了个"高清微创照片"，辐射量特别小，但连极小的病变都能看得清清楚楚。
          </>
        ),
      },
      {
        label: "B. 胸部X光片",
        feedback: (
          <>
            现在呀，大夫最推荐的是<Highlight>低剂量螺旋CT</Highlight>
            。它就像给肺部拍了个"高清微创照片"，辐射量特别小，但连极小的病变都能看得清清楚楚。
          </>
        ),
      },
    ],
  },
  {
    question: "这个'低剂量螺旋CT'到底能帮咱们看清啥？",
    options: [
      {
        label: "A. 能直接治好肺癌",
        feedback: (
          <>
            CT
            就像给肺部拍高清照片，是用来发现问题的检查工具，不能直接治好肺癌。要是真查出小问题，医生会专门制定治疗方案，早发现早处理，效果才最好呀。
          </>
        ),
      },
      {
        label: "B. 能揪出早期的异常小点点",
        feedback: (
          <>
            CT
            就像给肺部拍高清照片，是用来发现问题的检查工具，不能直接治好肺癌。要是真查出小问题，医生会专门制定治疗方案，早发现早处理，效果才最好呀。
          </>
        ),
      },
    ],
  },
];

export function StageQuiz({ onNext }: { onNext: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
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
    if (done) {
      stopAndResetAudio(audioRef.current);
      return;
    }

    const qNum = qIndex + 1;
    if (picked === null) {
      playAudio(`/m1_q${qNum}_question.mp3`, `m1_played_q${qNum}_question`);
    } else {
      const letter = picked === 0 ? "a" : "b";
      playAudio(`/m1_q${qNum}_feedback_${letter}.mp3`, `m1_played_q${qNum}_feedback_${letter}`);
    }
  }, [qIndex, picked, done, playAudio]);

  useEffect(() => {
    return () => {
      stopAndResetAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  if (done) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50 to-orange-100 p-6">
        {/* fireworks */}
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-6 w-6 rounded-full"
            style={{
              left: `${10 + i * 10}%`,
              top: `${15 + (i % 3) * 20}%`,
              background: ["#f59e0b", "#ef4444", "#3b82f6", "#10b981"][i % 4],
              animation: `firework 1.4s ease-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
        <Medal color="blue" label="知识达人" />
        <p className="text-center text-xl text-slate-700">恭喜您学完所有知识点！</p>
        <button
          onClick={onNext}
          className="min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:translate-y-[2px]"
        >
          进入下一关
        </button>
      </div>
    );
  }

  const q = QUESTIONS[qIndex];

  return (
    <div className="flex flex-1 flex-col gap-5 rounded-3xl bg-orange-50 p-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-orange-600">第 {qIndex + 1} / 4 题</span>
        <div className="flex gap-1">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full ${i <= qIndex ? "bg-orange-500" : "bg-orange-200"}`} />
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold leading-relaxed text-slate-800">{q.question}</h2>

      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            disabled={picked !== null}
            onClick={() => setPicked(i)}
            className={`min-h-16 w-full rounded-2xl border-2 px-5 py-3 text-left text-xl font-bold transition active:translate-y-[2px] active:brightness-90 ${
              picked === i
                ? "border-orange-500 bg-orange-100 text-orange-700"
                : picked !== null
                  ? "border-slate-200 bg-white text-slate-400"
                  : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {picked !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-white p-5 text-xl leading-relaxed text-slate-700 shadow-md">
              {q.options[picked].feedback}
            </div>
            <button
            onClick={() => {
              logAction(`m1_answered_q${qIndex + 1}_picked_${picked === 0 ? 'A' : 'B'}`);
              if (qIndex === QUESTIONS.length - 1) {
                setDone(true);
              } else {
                setQIndex(qIndex + 1);
                setPicked(null);
              }
            }}
              className="mt-4 min-h-16 w-full rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg active:translate-y-[2px]"
            >
              {qIndex === QUESTIONS.length - 1 ? "完成本关" : "下一题"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* ⬇️ 这里是为你新增的【返回上一题】按钮区块 ⬇️ */}
      {/* ========================================= */}
      {qIndex > 0 && (
        <button
          onClick={() => {
            logAction("m1_clicked_go_back");
            setQIndex(qIndex - 1);
            setPicked(null); // 清空当前题目的选择，方便长辈重新作答
          }}
          className="mt-2 min-h-16 w-full rounded-2xl border-2 border-slate-300 bg-transparent text-xl font-bold text-slate-500 transition active:bg-slate-200 active:translate-y-[2px]"
        >
          ⬅️ 返回上一题
        </button>
      )}
    </div>
  );
}
