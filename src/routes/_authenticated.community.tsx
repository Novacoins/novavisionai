import { createFileRoute } from "@tanstack/react-router";
import { Users, MessageCircle, Heart, Award, Camera } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/community")({
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <PageShell>
      <PageHeader title="Community" icon={<Users className="size-5 text-primary" />} subtitle="Welcome to the Nova Vision AI Community" />
      <div className="glass-card p-5 text-center">
        <div className="size-16 rounded-2xl hero-gradient grid place-items-center mx-auto glow mb-3">
          <Users className="size-7 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect with users around the world, share discoveries, discuss AI, request features, report bugs, and celebrate milestones together.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {[
          { icon: MessageCircle, label: "Discussions", value: "Coming soon" },
          { icon: Heart, label: "Likes & posts", value: "Coming soon" },
          { icon: Camera, label: "Image posts", value: "Coming soon" },
          { icon: Award, label: "Badges", value: "Coming soon" },
        ].map((f) => (
          <div key={f.label} className="glass-card p-4 text-center">
            <f.icon className="size-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-semibold">{f.label}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          The community feed is rolling out soon. For now, share your scans via the share button on any result.
        </p>
      </div>
    </PageShell>
  );
}
