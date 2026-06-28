import { createFileRoute } from "@tanstack/react-router";
import { Globe, Check } from "lucide-react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/languages")({
  component: LanguagesPage,
});

const LANGUAGES = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "en-GB", flag: "🇬🇧", label: "English (UK)" },
  { code: "en-CA", flag: "🇨🇦", label: "English (Canada)" },
  { code: "en-AU", flag: "🇦🇺", label: "English (Australia)" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी (Hindi)" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "zh", flag: "🇸🇬", label: "中文 (Singapore)" },
  { code: "ar", flag: "🇦🇪", label: "العربية" },
  { code: "pt-BR", flag: "🇧🇷", label: "Português (Brasil)" },
  { code: "es-MX", flag: "🇲🇽", label: "Español (México)" },
  { code: "ha", flag: "🇳🇬", label: "Hausa" },
  { code: "yo", flag: "🇳🇬", label: "Yorùbá" },
  { code: "ig", flag: "🇳🇬", label: "Igbo" },
  { code: "en-ZA", flag: "🇿🇦", label: "English (South Africa)" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
  { code: "it", flag: "🇮🇹", label: "Italiano" },
];

function LanguagesPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem("vn-lang") ?? "en" : "en"));

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("language").eq("id", user.id).single().then(({ data }) => {
      if (data?.language) setCurrent(data.language);
    });
  }, [user]);

  async function choose(code: string) {
    setCurrent(code);
    localStorage.setItem("vn-lang", code);
    if (user) await supabase.from("profiles").update({ language: code }).eq("id", user.id);
    toast.success("Language updated");
  }

  return (
    <PageShell>
      <PageHeader title="Languages" icon={<Globe className="size-5 text-primary" />} subtitle="Choose your preferred language" />
      <ul className="space-y-1.5">
        {LANGUAGES.map((l) => (
          <li key={l.code}>
            <button onClick={() => choose(l.code)} className={`w-full glass-card p-3 flex items-center gap-3 transition ${current === l.code ? "border-primary/50 bg-primary/5" : ""}`}>
              <span className="text-2xl">{l.flag}</span>
              <span className="flex-1 text-left text-sm font-medium">{l.label}</span>
              {current === l.code && <Check className="size-5 text-primary" />}
            </button>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
