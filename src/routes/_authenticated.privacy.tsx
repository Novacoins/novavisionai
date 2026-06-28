import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/privacy")({
  component: PrivacyPage,
});

const SECTIONS = [
  ["Data we collect", "We collect the information you provide (email, profile details), the images you upload, and basic device data needed to deliver the service."],
  ["Camera permissions", "Camera access is used only when you actively scan. Frames are processed on demand and never recorded without your action."],
  ["Uploaded images", "Images you upload are stored privately in your account's secure bucket. Only you can access them via signed links."],
  ["Account information", "Your account details are stored securely in our authentication system. We never sell your personal data."],
  ["AI processing", "Images and prompts are sent to our AI provider for analysis. Results are returned to your device and stored in your scan history."],
  ["Security", "We use industry-standard encryption in transit and at rest, plus row-level security to isolate every user's data."],
  ["Data deletion", "You can delete any scan from History, clear your account from Settings, or contact support to remove all data."],
  ["Your rights", "You may access, export, correct, or delete your data at any time. Reach out via Contact Support for assistance."],
];

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader title="Privacy Policy" icon={<Shield className="size-5 text-primary" />} subtitle="How we protect your information" />
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
