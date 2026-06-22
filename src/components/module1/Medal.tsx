import { motion } from "framer-motion";

const colorMap = {
  blue: "from-sky-400 to-blue-600",
  green: "from-emerald-400 to-green-600",
  red: "from-rose-400 to-red-600",
};

export function Medal({ color, label }: { color: "blue" | "green" | "red"; label: string }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
      className="flex flex-col items-center gap-3"
    >
      <div
        className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${colorMap[color]} text-5xl shadow-2xl ring-4 ring-white`}
      >
        🏅
      </div>
      <p className="text-2xl font-black text-slate-800">{label}</p>
    </motion.div>
  );
}