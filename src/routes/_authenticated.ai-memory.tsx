import { createFileRoute } from "@tanstack/react-router";
import { Brain, MessageSquare, Sparkles, Settings, Trash2, BookOpen } from "lucide-react";
import { HubGrid } from "@/components/HubGrid";

export const Route = createFileRoute("/_authenticated/ai-memory")({ component: Page });

function Page() {
  return (
    <HubGrid
      title="AI Memory"
      subtitle="Conversations, preferences and saved prompts"
      icon={<Brain className="size-5 text-[color:var(--sky)]" />}
      tiles={[
        { to: "/chat", label: "Conversations", desc: "Resume your AI chats", icon: MessageSquare, color: "from-emerald-400 to-green-500" },
        { label: "Preferences", desc: "Tone & writing style", icon: Settings, color: "from-sky-400 to-blue-500", soon: true },
        { label: "Saved Prompts", desc: "Reusable prompts library", icon: BookOpen, color: "from-fuchsia-400 to-purple-500", soon: true },
        { label: "Smart Memories", desc: "What Nova remembers", icon: Sparkles, color: "from-amber-400 to-orange-500", soon: true },
        { label: "Clear Memory", desc: "Delete all stored memories", icon: Trash2, color: "from-rose-400 to-red-500", soon: true },
      ]}
    />
  );
}
