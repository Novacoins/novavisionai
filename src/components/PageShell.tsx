import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({ title, icon, subtitle }: { title: string; icon?: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
        {icon}
        {title}
      </h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-3 pb-6 max-w-md mx-auto"
    >
      {children}
    </motion.div>
  );
}
