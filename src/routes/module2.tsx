import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useGameState, upsertSession } from "../lib/game-state";
import { StageIntro } from "../components/module2/StageIntro";
import { StageQuiz } from "../components/module2/StageQuiz";
import { StageCalculating } from "../components/module2/StageCalculating";
import { StageResult, computeRisk } from "../components/module2/StageResult";
import type { AnswerKey } from "../components/module2/questions";

type Step = "intro" | "quiz" | "calculating" | "result";

function Module2Page() {
  const { userId, sessionId, markCompleted, hydrated } = useGameState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && !userId) navigate({ to: "/" });
  }, [hydrated, userId, navigate]);

  if (!hydrated || !userId) return null;

  const handleQuizFinish = (a: Record<string, AnswerKey>) => {
    setAnswers(a);
    setStep("calculating");
  };

  const handleFinish = async () => {
    setBusy(true);
    const level = computeRisk(answers);
    await Promise.all([
      markCompleted(2),
      upsertSession(sessionId, userId, {
        answers: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [`m2_${k}`, v]),
        ),
        module2_risk_level: level,
      }),
    ]);
    setBusy(false);
    navigate({ to: "/hall" });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 bg-slate-50 pt-2">
      <header className="flex items-center gap-3 pb-2">
        <button
          onClick={() => navigate({ to: "/hall" })}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow active:scale-95"
          aria-label="返回大厅"
        >
          <ChevronLeft className="h-7 w-7 text-slate-700" />
        </button>
        <div>
          <p className="text-sm text-slate-500">模块 2</p>
          <h1 className="text-2xl font-black text-slate-900">风险透视仪</h1>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          {step === "intro" && <StageIntro onNext={() => setStep("quiz")} />}
          {step === "quiz" && <StageQuiz onFinish={handleQuizFinish} />}
          {step === "calculating" && (
            <StageCalculating onDone={() => setStep("result")} />
          )}
          {step === "result" && (
            <StageResult answers={answers} onFinish={handleFinish} busy={busy} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export const Route = createFileRoute("/module2")({
  ssr: false,
  component: Module2Page,
});