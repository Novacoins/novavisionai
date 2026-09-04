import { createFileRoute } from "@tanstack/react-router";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { useLanguage, LANGUAGES } from "@/lib/language-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/languages")({
  component: LanguagesPage,
});

function LanguagesPage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  async function choose(code: string) {
    await setLanguage(code);
    toast.success(t("languages.updated"));
  }

  return (
    <PageShell>
      <PageHeader
        title={t("languages.title")}
        icon={<Globe className="size-5 text-primary" />}
        subtitle={t("languages.subtitle")}
      />
      <ul className="space-y-1.5">
        {LANGUAGES.map((l, i) => (
          <motion.li
            key={l.code}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.015, 0.4), duration: 0.2 }}
          >
            <button
              onClick={() => choose(l.code)}
              className={`w-full glass-card p-3 flex items-center gap-3 transition ${language === l.code ? "border-primary/50 bg-primary/5" : ""}`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="flex-1 text-left text-sm font-medium">{l.label}</span>
              {language === l.code && <Check className="size-5 text-primary" />}
            </button>
          </motion.li>
        ))}
      </ul>
    </PageShell>
  );
}
