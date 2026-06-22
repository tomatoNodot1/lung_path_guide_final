export type AnswerKey = "A" | "B" | "C" | "D" | "E";

export interface Question {
  id: string;
  question: string;
  options: { label: string; value: AnswerKey }[];
}

export const questions: Question[] = [
  {
    id: "Q1",
    question: "您的年龄属于哪个范围？",
    options: [
      { label: "A. <45岁", value: "A" },
      { label: "B. 45-49岁", value: "B" },
      { label: "C. 50-74岁", value: "C" },
      { label: "D. ≥75岁", value: "D" },
    ],
  },
  {
    id: "Q2",
    question: "您的吸烟情况如何？",
    options: [
      { label: "A. 从不吸烟", value: "A" },
      { label: "B. 吸烟<20包年", value: "B" },
      { label: "C. 吸烟≥20包年", value: "C" },
      { label: "D. 曾经吸烟≥20包年但戒烟<15年", value: "D" },
      { label: "E. 曾经吸烟≥20包年且戒烟≥15年", value: "E" },
    ],
  },
  {
    id: "Q3",
    question: "您是否长期接触二手烟？",
    options: [
      { label: "A. 无", value: "A" },
      { label: "B. 有（与吸烟者共同生活或同室工作≥20年）", value: "B" },
    ],
  },
  {
    id: "Q4",
    question: "您是否有职业暴露史？",
    options: [
      { label: "A. 无", value: "A" },
      { label: "B. 有（暴露于石棉、氡、铍等≥1年）", value: "B" },
    ],
  },
  {
    id: "Q5",
    question: "您是否患有慢阻肺（COPD）？",
    options: [
      { label: "A. 无", value: "A" },
      { label: "B. 有（医生明确诊断）", value: "B" },
    ],
  },
  {
    id: "Q6",
    question: "您的直系亲属中是否有人患过肺癌？",
    options: [
      { label: "A. 无", value: "A" },
      { label: "B. 有（一级亲属得过肺癌）", value: "B" },
    ],
  },
];