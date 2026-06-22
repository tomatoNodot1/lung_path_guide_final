import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useGameState } from "../lib/game-state";
import { StageIntro } from "../components/module1/StageIntro";
import { StageQuiz } from "../components/module1/StageQuiz";
import { StageClouds } from "../components/module1/StageClouds";
import { StageValue } from "../components/module1/StageValue";

type Step = "intro" | "quiz" | "clouds" | "value";

function Module1Page() {
  const { userId, markCompleted, hydrated } = useGameState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && !userId) navigate({ to: "/" });
  }, [hydrated, userId, navigate]);

  if (!hydrated || !userId) return null;

  const handleFinish = async () => {
    setBusy(true);
    await markCompleted(1);
    setBusy(false);
    navigate({ to: "/hall" });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 pt-2">
      <header className="flex items-center gap-3 pb-2">
        <button
          onClick={() => navigate({ to: "/hall" })}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow active:scale-95"
          aria-label="返回大厅"
        >
          <ChevronLeft className="h-7 w-7 text-slate-700" />
        </button>
        <div>
          <p className="text-sm text-slate-500">模块 1</p>
          <h1 className="text-2xl font-black text-slate-900">科普小助手</h1>
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
          {step === "quiz" && <StageQuiz onNext={() => setStep("clouds")} />}
          {step === "clouds" && <StageClouds onNext={() => setStep("value")} />}
          {step === "value" && <StageValue onFinish={handleFinish} busy={busy} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export const Route = createFileRoute("/module1")({
  ssr: false,
  component: Module1Page,
});