import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/faq")({
  component: FaqPage,
});

const QA = [
  ["How do I scan an object?", "Open Scan and point your camera at the object, or tap Upload Image to choose from your gallery."],
  ["Can I scan plants?", "Yes — Nova Vision AI identifies plants, lists toxicity and edibility, and provides care tips."],
  ["Can I scan food?", "Yes — the AI recognizes meals and ingredients and offers nutrition information and meal ideas."],
  ["Can I scan documents?", "Yes — upload a clear photo of any document and ask the AI to summarize or extract text."],
  ["Is my data secure?", "Yes — your account and scans are protected with secure authentication and storage."],
  ["Do I need an internet connection?", "Yes — AI features require an internet connection to reach our servers."],
  ["How do I contact support?", "Open the sidebar and tap Contact Support to send us a message."],
];

function FaqPage() {
  return (
    <PageShell>
      <PageHeader title="FAQ" icon={<HelpCircle className="size-5 text-primary" />} subtitle="Common questions, answered" />
      <Accordion type="single" collapsible className="glass-card px-2">
        {QA.map(([q, a], i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="text-sm font-medium text-left">{q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageShell>
  );
}
