import { createFileRoute } from "@tanstack/react-router";
import {
  Wrench, MessageSquare, PenLine, Languages, FileText, SpellCheck, FileUser, ScanText,
  FileSearch, Code2, Database, Palette, Volume2, Mic, Utensils, Leaf, ChefHat, Image as ImageIcon,
  Mail,
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
        { to: "/chat", label: "AI Chat", desc: "General assistant", icon: MessageSquare, color: "from-emerald-400 to-green-500" },
        { to: "/tools/blog-writer", label: "Blog Writer", desc: "SEO articles", icon: PenLine, color: "from-sky-400 to-blue-500" },
        { to: "/tools/translator", label: "Translator", desc: "Any language", icon: Languages, color: "from-indigo-400 to-violet-500" },
        { to: "/tools/text-summarizer", label: "Text Summarizer", desc: "Long → short", icon: FileText, color: "from-orange-400 to-red-500" },
        { to: "/tools/grammar-checker", label: "Grammar Checker", desc: "Fix & polish", icon: SpellCheck, color: "from-rose-400 to-pink-500" },
        { to: "/tools/resume-builder", label: "Resume Builder", desc: "ATS-friendly", icon: FileUser, color: "from-fuchsia-400 to-purple-500" },
        { to: "/tools/email-writer", label: "Email Writer", desc: "Polished emails", icon: Mail, color: "from-cyan-400 to-teal-500" },
        { to: "/tools/ocr", label: "OCR Scanner", desc: "Image → text", icon: ScanText, color: "from-cyan-400 to-teal-500" },
        { to: "/tools/pdf-summarizer", label: "PDF Summarizer", desc: "Summarize any PDF", icon: FileSearch, color: "from-slate-400 to-slate-600" },
        { to: "/tools/code-generator", label: "Code Generator", desc: "Any language", icon: Code2, color: "from-lime-400 to-green-500" },
        { to: "/tools/sql-generator", label: "SQL Generator", desc: "English → SQL", icon: Database, color: "from-amber-400 to-orange-500" },
        { to: "/tools/logo-generator", label: "Logo Generator", desc: "Brand + prompt", icon: Palette, color: "from-pink-400 to-rose-500" },
        { to: "/tools/text-to-speech", label: "Text-to-Speech", desc: "Speak any text", icon: Volume2, color: "from-violet-400 to-fuchsia-500" },

        { to: "/chat", label: "Speech-to-Text", desc: "Voice in chat", icon: Mic, color: "from-teal-400 to-cyan-500" },
        { to: "/scan", label: "Food Scanner", icon: Utensils, color: "from-amber-400 to-yellow-500" },
        { to: "/plant-scanner", label: "Plant Identifier", icon: Leaf, color: "from-emerald-400 to-green-500" },
        { to: "/meal-planner", label: "Meal Planner", icon: ChefHat, color: "from-orange-400 to-amber-500" },
        { to: "/scan", label: "Image Analyzer", icon: ImageIcon, color: "from-blue-400 to-indigo-500" },
      ]}
    />
  );
}
