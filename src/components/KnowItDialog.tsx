import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  buttonText?: string;
};

export function KnowItDialog({ open, title, children, onClose, buttonText = "我知道啦" }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Block tap-outside closing
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            {title && <h3 className="mb-3 text-2xl font-black text-slate-800">{title}</h3>}
            <div className="text-xl leading-relaxed text-slate-700">{children}</div>
            <button
              onClick={onClose}
              className="mt-6 min-h-16 w-full rounded-2xl bg-orange-500 px-4 text-xl font-bold text-white shadow-md active:translate-y-[2px] active:brightness-90"
            >
              {buttonText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}