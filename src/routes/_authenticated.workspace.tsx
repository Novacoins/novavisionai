import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, FolderOpen, MessageSquare, StickyNote, FileText, Image, Mic, Heart, FolderTree, Cloud } from "lucide-react";
import { HubGrid } from "@/components/HubGrid";

export const Route = createFileRoute("/_authenticated/workspace")({ component: Page });

function Page() {
  return (
    <HubGrid
      title="AI Workspace"
      subtitle="Your projects, chats and documents"
      icon={<Briefcase className="size-5 text-[color:var(--sky)]" />}
      tiles={[
        { label: "Projects", desc: "Organize your work", icon: FolderOpen, color: "from-indigo-400 to-violet-500", soon: true },
        { to: "/chat", label: "Saved Chats", desc: "Resume conversations", icon: MessageSquare, color: "from-emerald-400 to-green-500" },
        { label: "Notes", desc: "Quick thoughts", icon: StickyNote, color: "from-amber-400 to-orange-500", soon: true },
        { label: "Documents", desc: "PDFs & files", icon: FileText, color: "from-sky-400 to-blue-500", soon: true },
        { to: "/history", label: "Images", desc: "Your scan library", icon: Image, color: "from-pink-400 to-rose-500" },
        { label: "Voice Notes", desc: "Audio memos", icon: Mic, color: "from-fuchsia-400 to-purple-500", soon: true },
        { to: "/favorites", label: "Favorites", desc: "Saved items", icon: Heart, color: "from-rose-400 to-red-500" },
        { label: "Folders", desc: "Group your work", icon: FolderTree, color: "from-teal-400 to-cyan-500", soon: true },
        { to: "/cloud-sync", label: "Cloud Sync", desc: "Backup & restore", icon: Cloud, color: "from-slate-400 to-slate-600" },
      ]}
    />
  );
}
