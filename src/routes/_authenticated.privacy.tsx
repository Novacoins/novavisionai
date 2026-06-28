import { createFileRoute } from "@tanstack/react-router";
import { Shield, Database, Camera, Cpu, Image as ImageIcon, Lock, UserCheck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/privacy")({
  component: PrivacyPage,
});

const SECTIONS = [
  { icon: Database,  color: "from-blue-500 to-cyan-500",       title: "Data we collect",   body: "We collect the information you provide (email, profile details), the images you upload, and basic device data needed to deliver the service." },
  { icon: Camera,    color: "from-emerald-500 to-green-600",   title: "Camera permissions", body: "Camera access is used only when you actively scan. Frames are processed on demand and never recorded without your action." },
  { icon: Cpu,       color: "from-amber-400 to-yellow-500",    title: "AI processing",      body: "Images and prompts are sent to our AI provider for analysis. Results are returned to your device and stored in your scan history." },
  { icon: ImageIcon, color: "from-violet-500 to-purple-600",   title: "Uploaded images",    body: "Images you upload are stored privately in your account's secure bucket. Only you can access them via signed links." },
  { icon: Lock,      color: "from-orange-500 to-red-500",      title: "Security",           body: "We use industry-standard encryption in transit and at rest, plus row-level security to isolate every user's data." },
  { icon: UserCheck, color: "from-rose-500 to-pink-600",       title: "Your rights",        body: "You may access, export, correct, or delete your data at any time. Reach out via Contact Support for assistance." },
  { icon: Trash2,    color: "from-slate-700 to-zinc-900",      title: "Data deletion",      body: "You can delete any scan from History, clear your account from Settings, or contact support to remove all data." },
];

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader title="Privacy Policy" icon={<Shield className="size-5 text-primary" />} subtitle="How we protect your information" />
      <div className="space-y-3">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
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
