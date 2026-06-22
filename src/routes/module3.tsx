import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useGameState } from "../lib/game-state";
import { StageIntro } from "../components/module3/StageIntro";
import { StagePrep } from "../components/module3/StagePrep";
import { StageScan } from "../components/module3/StageScan";
import { StageReport } from "../components/module3/StageReport";
import { StagePlan } from "../components/module3/StagePlan";

type Step = "intro" | "prep" | "scan" | "report" | "plan";

function Module3Page() {
  const { userId, markCompleted, hydrated } = useGameState();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated && !userId) navigate({ to: "/" });
  }, [hydrated, userId, navigate]);

  if (!hydrated || !userId) return null;

  const handleFinish = async () => {
    if (busy) return;
    setBusy(true);
    await markCompleted(3);
    setBusy(false);
    navigate({ to: "/hall" });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 bg-blue-50 pt-2">
      <header className="flex items-center gap-3 pb-2">
        <button
          onClick={() => navigate({ to: "/hall" })}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow active:scale-95"
          aria-label="返回大厅"
        >
          <ChevronLeft className="h-7 w-7 text-slate-700" />
        </button>
        <div>
          <p className="text-sm text-slate-500">模块 3</p>
          <h1 className="text-2xl font-black text-slate-900">未来决策者</h1>
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
          {step === "intro" && <StageIntro onNext={() => setStep("prep")} />}
          {step === "prep" && <StagePrep onNext={() => setStep("scan")} />}
          {step === "scan" && <StageScan onNext={() => setStep("report")} />}
          {step === "report" && <StageReport onNext={() => setStep("plan")} />}
          {step === "plan" && <StagePlan onFinish={handleFinish} busy={busy} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export const Route = createFileRoute("/module3")({
  ssr: false,
  component: Module3Page,
});