import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { questions, type AnswerKey } from "./questions";

interface Props {
  onFinish: (answers: Record<string, AnswerKey>) => void;
}

export function StageQuiz({ onFinish }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});

  const q = questions[qIndex];
  const progress = ((qIndex + 1) / questions.length) * 100;

  const pick = (value: AnswerKey) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);

    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      onFinish(next);
    }
  };

  const goBack = () => {
    if (qIndex > 0) setQIndex((i) => i - 1);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-sky-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="shrink-0 text-lg font-bold text-slate-600">
          {qIndex + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col gap-6"
        >
          <p className="text-2xl font-bold leading-relaxed text-slate-800">
            {q.question}
          </p>

          <div className="flex flex-col gap-4">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => pick(opt.value)}
                  className={`flex min-h-16 items-center rounded-2xl border-2 px-5 text-left text-xl font-medium transition ${
                    selected
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                  }`}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {qIndex > 0 && (
        <button
          onClick={goBack}
          className="mx-auto mt-6 flex min-h-12 w-fit items-center justify-center rounded-full border border-slate-300 bg-transparent px-6 text-base text-slate-500 transition active:bg-slate-200"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回上一题
        </button>
      )}
    </div>
  );
}