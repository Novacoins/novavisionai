import { createFileRoute } from "@tanstack/react-router";
import { Info, Sparkles } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHeader title="About" icon={<Info className="size-5 text-primary" />} />
      <div className="glass-card p-6 text-center">
        <div className="size-20 rounded-3xl hero-gradient grid place-items-center mx-auto glow mb-4">
          <Sparkles className="size-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold">VisionNova AI</h2>
        <p className="text-xs text-muted-foreground">Version 9.7.1</p>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          VisionNova AI is an advanced AI vision assistant designed to identify, explain, analyze, and organize information from images captured through your device camera or uploaded from your gallery.
        </p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Powered by modern artificial intelligence, VisionNova AI helps you understand plants, food, products, animals, documents, objects, and much more.
        </p>
        <p className="text-sm font-semibold mt-4 text-primary">
          Our mission: make AI accessible, accurate, and helpful for everyone.
        </p>
      </div>
    </PageShell>
  );
}
