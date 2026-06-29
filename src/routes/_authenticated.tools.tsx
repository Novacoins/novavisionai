import { createFileRoute } from "@tanstack/react-router";
import {
  Wrench, MessageSquare, PenLine, Languages, FileText, SpellCheck, FileUser, ScanText,
  FileSearch, Code2, Calculator, Palette, Volume2, Mic, Utensils, Leaf, ChefHat, Image as ImageIcon,
} from "lucide-react";
import { HubGrid } from "@/components/HubGrid";

export const Route = createFileRoute("/_authenticated/tools")({ component: Page });

function Page() {
  return (
    <HubGrid
      title="AI Tools Hub"
      subtitle="All your AI utilities in one place"
      icon={<Wrench className="size-5 text-[color:var(--sky)]" />}
      tiles={[
        { to: "/chat", label: "AI Chat", icon: MessageSquare, color: "from-emerald-400 to-green-500" },
        { to: "/chat", label: "AI Writer", desc: "Drafts & rewrites", icon: PenLine, color: "from-sky-400 to-blue-500" },
        { to: "/chat", label: "Translator", desc: "Any language", icon: Languages, color: "from-indigo-400 to-violet-500" },
        { to: "/chat", label: "Summarizer", desc: "Long → short", icon: FileText, color: "from-amber-400 to-orange-500" },
        { to: "/chat", label: "Grammar Checker", icon: SpellCheck, color: "from-rose-400 to-pink-500" },
        { label: "Resume Builder", icon: FileUser, color: "from-fuchsia-400 to-purple-500", soon: true },
        { to: "/scan", label: "OCR Scanner", desc: "Image → text", icon: ScanText, color: "from-cyan-400 to-teal-500" },
        { label: "PDF Assistant", icon: FileSearch, color: "from-slate-400 to-slate-600", soon: true },
        { to: "/chat", label: "Code Assistant", icon: Code2, color: "from-lime-400 to-green-500" },
        { to: "/chat", label: "Math Solver", icon: Calculator, color: "from-orange-400 to-red-500" },
        { label: "Logo Generator", icon: Palette, color: "from-pink-400 to-rose-500", soon: true },
        { label: "Text-to-Speech", icon: Volume2, color: "from-violet-400 to-fuchsia-500", soon: true },
        { to: "/chat", label: "Speech-to-Text", icon: Mic, color: "from-teal-400 to-cyan-500" },
        { to: "/scan", label: "Food Scanner", icon: Utensils, color: "from-amber-400 to-yellow-500" },
        { to: "/plant-scanner", label: "Plant Identifier", icon: Leaf, color: "from-emerald-400 to-green-500" },
        { to: "/meal-planner", label: "Meal Planner", icon: ChefHat, color: "from-orange-400 to-amber-500" },
        { to: "/scan", label: "Image Analyzer", icon: ImageIcon, color: "from-blue-400 to-indigo-500" },
      ]}
    />
  );
}
