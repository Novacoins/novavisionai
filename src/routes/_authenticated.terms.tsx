import { createFileRoute } from "@tanstack/react-router";
import { FileText, Handshake, ShieldCheck, Ban, Copyright, AlertTriangle, UserX, RefreshCw, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/terms")({
  head: () => pageHead({
    path: "/terms",
    title: "Terms of Service — Nova Vision AI",
    description: "The terms that govern your use of Nova Vision AI, including acceptable use, AI disclaimers, and account responsibilities.",
  }),
  component: TermsPage,
});

const SECTIONS = [
  { icon: Handshake,     color: "from-blue-500 to-cyan-500",     title: "Agreement",            body: "By creating an account or using Nova Vision AI, you agree to these terms. If you do not agree, please discontinue use." },
  { icon: ShieldCheck,   color: "from-emerald-500 to-green-600", title: "User responsibilities", body: "You're responsible for the content you upload, the accuracy of the information you provide, and keeping your account credentials secure." },
  { icon: Ban,           color: "from-amber-400 to-yellow-500",  title: "Acceptable use",       body: "Use Nova Vision AI for lawful, personal purposes. Don't abuse the service, harass others, or attempt to harm the platform." },
  { icon: Copyright,     color: "from-violet-500 to-purple-600", title: "Intellectual property", body: "Nova Vision AI's brand, code, and content are owned by us. Your scans and content remain yours; you grant us a limited license to process them." },
  { icon: AlertTriangle, color: "from-orange-500 to-red-500",    title: "AI disclaimer",        body: "AI responses are informational and may be inaccurate. Always verify critical decisions (medical, legal, safety) with qualified professionals." },
  { icon: UserX,         color: "from-rose-500 to-pink-600",     title: "Account termination",  body: "We may suspend accounts that violate these terms. You can delete your account at any time from Settings." },
  { icon: RefreshCw,     color: "from-teal-500 to-cyan-600",     title: "Updates",              body: "We may update these terms occasionally. Significant changes will be communicated in-app or by email." },
  { icon: Mail,          color: "from-slate-700 to-zinc-900",    title: "Contact",              body: "Questions about these terms? Reach us through Contact Support inside the app." },
];

function TermsPage() {
  return (
    <PageShell>
      <PageHeader title="Terms of Service" icon={<FileText className="size-5 text-primary" />} subtitle="The rules of the road" />
      <div className="space-y-3">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="glass-card p-4 flex gap-3"
          >
            <div className={`shrink-0 size-11 rounded-2xl bg-gradient-to-br ${s.color} grid place-items-center shadow-lg`}>
              <s.icon className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
