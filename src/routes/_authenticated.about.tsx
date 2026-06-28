import { createFileRoute } from "@tanstack/react-router";
import { Info, Sparkles, Target, Eye, Zap, Cpu, Code2, Globe, Rocket, MessageCircle, ScanLine } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/about")({
  component: AboutPage,
});

const FEATURES = [
  { icon: ScanLine, title: "AI Vision Scanner", desc: "Identify plants, food, products, and objects instantly." },
  { icon: Cpu,      title: "Multimodal AI",     desc: "Powered by advanced vision + reasoning models." },
  { icon: Zap,      title: "Lightning Fast",    desc: "Optimized pipelines for real-time results." },
  { icon: Globe,    title: "Multi-Language",    desc: "Use the app in your preferred language." },
];

const STACK = ["React 19", "TanStack Start", "Tailwind v4", "Lovable AI", "Lovable Cloud", "Framer Motion"];
const ROADMAP = ["Voice assistant", "Community feed", "PDF export", "Offline scans", "Barcode mode"];

function AboutPage() {
  return (
    <PageShell>
      <PageHeader title="About" icon={<Info className="size-5 text-primary" />} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-7 text-center"
      >
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-20 -left-10 size-60 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 size-60 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <motion.div
          initial={{ scale: 0.7, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="size-20 rounded-3xl hero-gradient grid place-items-center mx-auto glow mb-4"
        >
          <Sparkles className="size-10 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Nova Vision AI</h2>
        <p className="text-xs text-muted-foreground mt-1">Version 9.7.1</p>
        <p className="text-sm font-medium text-foreground/90 mt-3">
          Smart AI Vision • Scan Anything • Understand Everything
        </p>
      </motion.div>

      {/* Mission / Vision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: Target, title: "Our Mission", body: "Make AI vision accessible, accurate, and helpful for everyone — every day.", color: "from-emerald-500 to-green-600" },
          { icon: Eye,    title: "Our Vision",  body: "A world where understanding any object is just one tap away.",               color: "from-cyan-500 to-blue-600" },
        ].map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            <div className={`size-10 rounded-2xl bg-gradient-to-br ${c.color} grid place-items-center mb-2 shadow-lg`}>
              <c.icon className="size-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Core features */}
      <div>
        <h3 className="text-sm font-semibold mb-2 px-1">Core Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-3"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                className="size-9 rounded-xl hero-gradient grid place-items-center mb-2"
              >
                <f.icon className="size-5 text-primary-foreground" />
              </motion.div>
              <p className="text-xs font-semibold">{f.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Technology Stack</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STACK.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Future Roadmap</h3>
        </div>
        <ul className="space-y-1.5">
          {ROADMAP.map((r) => (
            <li key={r} className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-gradient-to-r from-primary to-cyan-400" />
              {r}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Developer / Contact */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-4 text-center"
      >
        <MessageCircle className="size-6 mx-auto text-primary mb-2" />
        <p className="text-sm font-semibold">Need help?</p>
        <p className="text-xs text-muted-foreground mt-1">Reach our team via Contact Support in the sidebar.</p>
        <p className="text-[11px] text-muted-foreground mt-3">Built with care by the Nova Vision AI team.</p>
      </motion.div>
    </PageShell>
  );
}
