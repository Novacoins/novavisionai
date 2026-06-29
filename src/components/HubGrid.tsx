import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "./PageShell";
import { cn } from "@/lib/utils";

export type HubTile = {
  to?: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
  color: string;
  soon?: boolean;
};

export function HubGrid({
  title,
  subtitle,
  icon,
  tiles,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  tiles: HubTile[];
}) {
  return (
    <PageShell>
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          const content = (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "relative glass-card p-4 h-32 flex flex-col justify-between overflow-hidden active:scale-[0.97] transition",
                tile.soon && "opacity-80",
              )}
            >
              <span className={cn(
                "size-11 rounded-2xl grid place-items-center text-white shadow-md bg-gradient-to-br",
                tile.color,
              )}>
                <Icon className="size-5" />
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">{tile.label}</div>
                {tile.desc && <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{tile.desc}</div>}
              </div>
              {tile.soon && (
                <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[oklch(0.78_0.13_235_/_0.18)] text-[color:var(--sky-soft)] border border-[oklch(0.78_0.13_235_/_0.35)]">
                  Soon
                </span>
              )}
            </motion.div>
          );
          return tile.to && !tile.soon ? (
            <Link key={tile.label} to={tile.to as "/"} className="block">{content}</Link>
          ) : (
            <div key={tile.label}>{content}</div>
          );
        })}
      </div>
    </PageShell>
  );
}
