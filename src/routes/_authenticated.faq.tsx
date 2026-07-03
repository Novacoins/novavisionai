import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/faq")({
  head: () => ({
    ...pageHead({
      path: "/faq",
      title: "FAQ — Nova Vision AI Questions & Answers",
      description: "Answers to common questions about Nova Vision AI — scanning, accounts, privacy, languages, and billing.",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: QA.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

type Cat = { label: string; gradient: string };
const CATEGORIES: Record<string, Cat> = {
  general:  { label: "General",     gradient: "from-blue-500 to-cyan-500" },
  scanner:  { label: "AI Scanner",  gradient: "from-emerald-500 to-green-600" },
  account:  { label: "Account",     gradient: "from-amber-400 to-yellow-500" },
  security: { label: "Security",    gradient: "from-violet-500 to-purple-600" },
  language: { label: "Language",    gradient: "from-orange-500 to-red-500" },
  privacy:  { label: "Privacy",     gradient: "from-rose-500 to-pink-600" },
  billing:  { label: "Billing",     gradient: "from-slate-700 to-zinc-900" },
};

const QA: Array<{ q: string; a: string; cat: keyof typeof CATEGORIES }> = [
  { cat: "general",  q: "What is Nova Vision AI?", a: "Nova Vision AI is your intelligent visual assistant — scan, identify, and understand objects, food, plants, products and documents using your camera." },
  { cat: "scanner",  q: "How do I scan an object?", a: "Open Scan and point your camera at the object, or tap Upload Image to choose from your gallery." },
  { cat: "scanner",  q: "Can I scan plants?", a: "Yes — Nova Vision AI identifies plants, lists toxicity and edibility, and provides care tips." },
  { cat: "scanner",  q: "Can I scan food?", a: "Yes — the AI recognizes meals and ingredients and offers nutrition information and meal ideas." },
  { cat: "scanner",  q: "Can I scan documents?", a: "Yes — upload a clear photo of any document and ask the AI to summarize or extract text." },
  { cat: "account",  q: "How do I change my profile?", a: "Open Profile from the sidebar to update your name, avatar, and dietary preferences." },
  { cat: "security", q: "Is my data secure?", a: "Yes — your account and scans are protected with secure authentication, encrypted storage, and row-level security." },
  { cat: "language", q: "Can I change the app language?", a: "Yes — open Languages from the sidebar to pick your preferred language. The default is English." },
  { cat: "privacy",  q: "Who can see my scans?", a: "Only you. Scans are stored privately in your account and are never shared without your action." },
  { cat: "general",  q: "Do I need an internet connection?", a: "Yes — AI features require an internet connection to reach our servers." },
  { cat: "billing",  q: "Is Nova Vision AI free?", a: "Core features are free to use. Premium tiers may be introduced in the future and will be clearly communicated." },
  { cat: "general",  q: "How do I contact support?", a: "Open the sidebar and tap Contact Support to send us a message." },
];

function FaqPage() {
  return (
    <PageShell>
      <PageHeader title="FAQ" icon={<HelpCircle className="size-5 text-primary" />} subtitle="Common questions, answered" />
      <Accordion type="single" collapsible className="space-y-2">
        {QA.map((item, i) => {
          const cat = CATEGORIES[item.cat];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <AccordionItem value={`item-${i}`} className="glass-card border-0 px-4 overflow-hidden">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  <div className="flex items-start gap-3 flex-1 pr-2">
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase text-white bg-gradient-to-r ${cat.gradient} shadow-sm transition-transform hover:scale-105`}>
                      {cat.label}
                    </span>
                    <span className="flex-1">{item.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          );
        })}
      </Accordion>
    </PageShell>
  );
}
