import type { ReactNode } from "react";

export function Highlight({ children }: { children: ReactNode }) {
  return <span className="highlight-pulse text-orange-600 font-bold">{children}</span>;
}