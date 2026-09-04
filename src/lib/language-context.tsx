import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import i18n from "./i18n";
import { useAuth } from "./auth-context";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  language: string;
  setLanguage: (code: string) => Promise<void>;
};

const LanguageCtx = createContext<Ctx>({ language: "en", setLanguage: async () => {} });

export const LANGUAGES = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
  { code: "it", flag: "🇮🇹", label: "Italiano" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
  { code: "ha", flag: "🇳🇬", label: "Hausa" },
  { code: "yo", flag: "🇳🇬", label: "Yorùbá" },
  { code: "ig", flag: "🇳🇬", label: "Igbo" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "en-GB", flag: "🇬🇧", label: "English (UK)" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
  { code: "fr-CA", flag: "🇨🇦", label: "Français (Canada)" },
  { code: "pt-BR", flag: "🇧🇷", label: "Português (Brasil)" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "es-MX", flag: "🇲🇽", label: "Español (México)" },
  { code: "en-AU", flag: "🇦🇺", label: "English (Australia)" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "sv", flag: "🇸🇪", label: "Svenska" },
  { code: "es-AR", flag: "🇦🇷", label: "Español (Argentina)" },
  { code: "th", flag: "🇹🇭", label: "ไทย" },
  { code: "ms", flag: "🇲🇾", label: "Bahasa Melayu" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "tl", flag: "🇵🇭", label: "Filipino" },
  { code: "en-SG", flag: "🇸🇬", label: "English (Singapore)" },
  { code: "de-CH", flag: "🇨🇭", label: "Deutsch (Schweiz)" },
  { code: "nl-BE", flag: "🇧🇪", label: "Nederlands (België)" },
  { code: "de-AT", flag: "🇦🇹", label: "Deutsch (Österreich)" },
  { code: "no", flag: "🇳🇴", label: "Norsk" },
  { code: "da", flag: "🇩🇰", label: "Dansk" },
  { code: "fi", flag: "🇫🇮", label: "Suomi" },
  { code: "en-ZA", flag: "🇿🇦", label: "English (South Africa)" },
  { code: "ar-EG", flag: "🇪🇬", label: "العربية (مصر)" },
  { code: "ar-AE", flag: "🇦🇪", label: "العربية (الإمارات)" },
  { code: "he", flag: "🇮🇱", label: "עברית" },
  { code: "es-CO", flag: "🇨🇴", label: "Español (Colombia)" },
  { code: "es-CL", flag: "🇨🇱", label: "Español (Chile)" },
  { code: "ur", flag: "🇵🇰", label: "اردو" },
  { code: "bn", flag: "🇧🇩", label: "বাংলা" },
  { code: "fa", flag: "🇮🇷", label: "فارسی" },
  { code: "es-PE", flag: "🇵🇪", label: "Español (Perú)" },
  { code: "el", flag: "🇬🇷", label: "Ελληνικά" },
  { code: "en-IE", flag: "🇮🇪", label: "English (Ireland)" },
  { code: "en-NZ", flag: "🇳🇿", label: "English (New Zealand)" },
  { code: "cs", flag: "🇨🇿", label: "Čeština" },
  { code: "ro", flag: "🇷🇴", label: "Română" },
];

const RTL = new Set(["ar", "ar-EG", "ar-AE", "he", "fa", "ur"]);

function applyLang(code: string) {
  i18n.changeLanguage(code);
  if (typeof document !== "undefined") {
    const base = code.split("-")[0];
    document.documentElement.lang = base;
    document.documentElement.dir = RTL.has(code) || RTL.has(base) ? "rtl" : "ltr";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLang] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("nv-lang") || "en";
  });

  // Apply on mount
  useEffect(() => {
    applyLang(language);
  }, []); // eslint-disable-line

  // Load from user profile on sign-in
  useEffect(() => {
    if (!user) {
      // Reset to English on sign out
      localStorage.setItem("nv-lang", "en");
      setLang("en");
      applyLang("en");
      return;
    }
    supabase
      .from("profiles")
      .select("language")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const code = data?.language || "en";
        setLang(code);
        localStorage.setItem("nv-lang", code);
        applyLang(code);
      });
  }, [user?.id]); // eslint-disable-line

  async function setLanguage(code: string) {
    setLang(code);
    localStorage.setItem("nv-lang", code);
    applyLang(code);
    if (user) {
      await supabase.from("profiles").update({ language: code }).eq("id", user.id);
    }
  }

  return <LanguageCtx.Provider value={{ language, setLanguage }}>{children}</LanguageCtx.Provider>;
}

export const useLanguage = () => useContext(LanguageCtx);
