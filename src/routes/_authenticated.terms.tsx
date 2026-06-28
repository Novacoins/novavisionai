import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/terms")({
  component: TermsPage,
});

const SECTIONS = [
  ["Acceptable use", "Use Nova Vision AI for lawful, personal purposes. Don't abuse the service, harass others, or attempt to harm the platform."],
  ["User responsibilities", "You're responsible for the content you upload, the accuracy of the information you provide, and keeping your account credentials secure."],
  ["AI limitations", "AI responses are informational and may be inaccurate. Always verify critical decisions (medical, legal, safety) with qualified professionals."],
  ["Intellectual property", "Nova Vision AI's brand, code, and content are owned by us. Your scans and content remain yours; you grant us a limited license to process them."],
  ["Disclaimer", "The service is provided 'as is' without warranties. We are not liable for damages arising from use of the AI's responses."],
  ["Updates", "We may update these terms occasionally. Significant changes will be communicated in-app or by email."],
  ["Contact", "Questions about these terms? Reach us through Contact Support inside the app."],
];

function TermsPage() {
  return (
    <PageShell>
      <PageHeader title="Terms of Service" icon={<FileText className="size-5 text-primary" />} subtitle="The rules of the road" />
      <div className="space-y-3">
        {SECTIONS.map(([title, body]) => (
          <div key={title} className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
