import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Medal } from "../module1/Medal";
import { Highlight } from "../Highlight";
import { type AnswerKey } from "./questions";
import { useGameState } from "../../lib/game-state";

export type RiskLevel = "elder" | "high" | "mid" | "low";

export function computeRisk(answers: Record<string, AnswerKey>): RiskLevel {
  const a = answers;
  const hasRisk =
    a.Q2 === "C" ||
    a.Q2 === "D" ||
    a.Q3 === "B" ||
    a.Q4 === "B" ||
    a.Q5 === "B" ||
    a.Q6 === "B";

  if (a.Q1 === "D") return "elder";
  if (a.Q1 === "C" && hasRisk) return "high";
  if ((a.Q1 === "B" && hasRisk) || (a.Q1 === "C" && !hasRisk)) return "mid";
  return "low";
}

const riskConfig: Record<
  RiskLevel,
  {
    title: string;
    cardClass: string;
    medalColor: "blue" | "red" | "green";
    text: ReactNode;
  }
> = {
  elder: {
    title: "高龄待评估",
    cardClass: "bg-amber-50 border-amber-300 text-amber-900",
    medalColor: "green",
    text: (
      <>
        您年龄≥75岁，属于高龄人群。筛查前建议进行
        <Highlight>综合老年评估</Highlight>
        ，由医生权衡获益与风险后决定是否进行
        <Highlight>LDCT</Highlight>筛查。
      </>
    ),
  },
  high: {
    title: "高风险",
    cardClass: "bg-rose-50 border-rose-300 text-rose-900",
    medalColor: "red",
    text: (
      <>
        根据《国家卫生健康委肺癌筛查与早诊早治方案（2024年版）》，您属于肺癌筛查高危人群，建议
        <Highlight>每年进行一次</Highlight>低剂量螺旋CT（
        <Highlight>LDCT</Highlight>）筛查。
      </>
    ),
  },
  mid: {
    title: "中风险",
    cardClass: "bg-sky-50 border-sky-300 text-sky-900",
    medalColor: "blue",
    text: (
      <>
        您存在一定肺癌相关风险因素，尚未达到高危标准。建议
        <Highlight>咨询医生</Highlight>
        ，结合个人情况评估是否需要<Highlight>LDCT</Highlight>筛查。
      </>
    ),
  },
  low: {
    title: "低风险",
    cardClass: "bg-emerald-50 border-emerald-300 text-emerald-900",
    medalColor: "green",
    text: (
      <>
        您目前不符合肺癌高危人群标准，建议
        <Highlight>保持健康生活方式</Highlight>
        ，定期常规体检。
      </>
    ),
  },
};

interface Props {
  answers: Record<string, AnswerKey>;
  onFinish: () => void;
  busy: boolean;
}

export function StageResult({ answers, onFinish, busy }: Props) {
  const level = computeRisk(answers);
  const cfg = riskConfig[level];
  const [showMedal, setShowMedal] = useState(false);
  const { logAction } = useGameState(); 

  useEffect(() => {
    const t = setTimeout(() => setShowMedal(true), 500);
    return () => clearTimeout(t);
  }, []);

  // ====== 新增的自动播放结果语音逻辑 ======
  useEffect(() => {
    if (!level) return;
    
    // 动态拼接出 /m2_result_elder.mp3 等文件名
    const audio = new Audio(`/m2_result_${level}.mp3`);
    audio.play().catch(() => {});
    logAction(`m2_played_result_${level}`);

    return () => { audio.pause(); };
  }, [level, logAction]);
  // =======================================

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full rounded-2xl border-2 p-6 text-xl leading-relaxed ${cfg.cardClass}`}
      >
        <h2 className="mb-4 text-center text-2xl font-black">{cfg.title}</h2>
        <p>{cfg.text}</p>
      </motion.div>

      {showMedal && <Medal color={cfg.medalColor} label="风险洞察家" />}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        disabled={busy}
        onClick={onFinish}
        className="min-h-16 w-full rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-lg transition active:bg-sky-700 disabled:opacity-50"
      >
        {busy ? "保存中..." : "完成本模块，返回大厅"}
      </motion.button>
    </div>
  );
}