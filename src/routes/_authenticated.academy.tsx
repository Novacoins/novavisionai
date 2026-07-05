import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Brain, Code2, Briefcase, Megaphone, Languages, Zap, Palette, Shield, DollarSign } from "lucide-react";
import { HubGrid } from "@/components/HubGrid";

export const Route = createFileRoute("/_authenticated/academy")({ component: Page });

function Page() {
  return (
    <HubGrid
      title="AI Learning Academy"
      subtitle="Interactive AI-powered lessons & quizzes"
      icon={<GraduationCap className="size-5 text-[color:var(--sky)]" />}
      tiles={[
        { to: "/academy/ai", label: "Artificial Intelligence", icon: Brain, color: "from-fuchsia-400 to-purple-500" },
        { to: "/academy/programming", label: "Programming", icon: Code2, color: "from-emerald-400 to-green-500" },
        { to: "/academy/business", label: "Business", icon: Briefcase, color: "from-amber-400 to-orange-500" },
        { to: "/academy/marketing", label: "Marketing", icon: Megaphone, color: "from-rose-400 to-pink-500" },
        { to: "/academy/english", label: "English", icon: Languages, color: "from-sky-400 to-blue-500" },
        { to: "/academy/productivity", label: "Productivity", icon: Zap, color: "from-yellow-400 to-amber-500" },
        { to: "/academy/design", label: "Graphic Design", icon: Palette, color: "from-pink-400 to-rose-500" },
        { to: "/academy/cybersecurity", label: "Cybersecurity", icon: Shield, color: "from-slate-400 to-slate-600" },
        { to: "/academy/finance", label: "Finance", icon: DollarSign, color: "from-lime-400 to-green-500" },
      ]}
    />
  );
}
