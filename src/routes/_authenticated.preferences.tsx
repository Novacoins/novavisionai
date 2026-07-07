import { createFileRoute } from "@tanstack/react-router";
import { Settings, Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/preferences")({
  component: PreferencesPage,
  head: () => pageHead({ path: "/preferences", title: "AI Preferences — Nova Vision AI", description: "Customize how Nova responds — model, tone, style, voice." }),
});

type Prefs = {
  ai_model: string;
  response_length: string;
  writing_style: string;
  tone: string;
  creativity: number;
  language: string;
  theme: string;
  voice: string;
  default_behavior: string;
};

const DEFAULTS: Prefs = {
  ai_model: "google/gemini-3-flash-preview",
  response_length: "balanced",
  writing_style: "clear",
  tone: "friendly",
  creativity: 0.7,
  language: "en",
  theme: "system",
  voice: "alloy",
  default_behavior: "",
};

const MODELS = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Fast, default)" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Balanced)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Highest quality)" },
];
const LENGTHS = ["short", "balanced", "detailed"];
const STYLES = ["clear", "formal", "casual", "creative", "technical"];
const TONES = ["friendly", "professional", "playful", "empathetic", "direct"];
const LANGS = [
  { id: "en", label: "English" }, { id: "es", label: "Spanish" }, { id: "fr", label: "French" },
  { id: "de", label: "German" }, { id: "pt", label: "Portuguese" }, { id: "it", label: "Italian" },
  { id: "ar", label: "Arabic" }, { id: "hi", label: "Hindi" }, { id: "zh", label: "Chinese" },
  { id: "ja", label: "Japanese" }, { id: "ko", label: "Korean" }, { id: "ru", label: "Russian" },
];
const THEMES = ["system", "light", "dark"];
const VOICES = ["alloy", "verse", "aria", "coral", "sage"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] | string[] }) {
  const opts = options.map((o) => (typeof o === "string" ? { id: o, label: o[0].toUpperCase() + o.slice(1) } : o));
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );
}

function PreferencesPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        setPrefs({
          ai_model: data.ai_model, response_length: data.response_length,
          writing_style: data.writing_style, tone: data.tone,
          creativity: Number(data.creativity), language: data.language,
          theme: data.theme, voice: data.voice, default_behavior: data.default_behavior ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: user.id, ...prefs }, { onConflict: "user_id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Preferences saved");
  }

  function update<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setPrefs((p) => ({ ...p, [k]: v }));
  }

  if (loading) {
    return (
      <PageShell>
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="AI Preferences"
        subtitle="Customize how Nova responds"
        icon={<Settings className="size-5 text-primary" />}
      />

      <div className="space-y-4">
        <div className="glass-card p-4 space-y-4">
          <Field label="AI Model">
            <Select value={prefs.ai_model} onChange={(v) => update("ai_model", v)} options={MODELS} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Response length">
              <Select value={prefs.response_length} onChange={(v) => update("response_length", v)} options={LENGTHS} />
            </Field>
            <Field label="Writing style">
              <Select value={prefs.writing_style} onChange={(v) => update("writing_style", v)} options={STYLES} />
            </Field>
            <Field label="Tone">
              <Select value={prefs.tone} onChange={(v) => update("tone", v)} options={TONES} />
            </Field>
            <Field label="Language">
              <Select value={prefs.language} onChange={(v) => update("language", v)} options={LANGS} />
            </Field>
            <Field label="Theme">
              <Select value={prefs.theme} onChange={(v) => update("theme", v)} options={THEMES} />
            </Field>
            <Field label="Voice (TTS)">
              <Select value={prefs.voice} onChange={(v) => update("voice", v)} options={VOICES} />
            </Field>
          </div>
          <Field label={`Creativity (${prefs.creativity.toFixed(1)})`}>
            <input
              type="range" min={0} max={1} step={0.1}
              value={prefs.creativity}
              onChange={(e) => update("creativity", Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Precise</span><span>Balanced</span><span>Creative</span>
            </div>
          </Field>
        </div>

        <div className="glass-card p-4">
          <Field label="Default assistant behavior">
            <Textarea
              value={prefs.default_behavior}
              onChange={(e) => update("default_behavior", e.target.value)}
              placeholder="e.g. Always answer in bullet points. Prefer TypeScript. Address me as 'Alex'."
              className="min-h-[100px]"
              maxLength={800}
            />
            <div className="text-[10px] text-muted-foreground text-right">{prefs.default_behavior.length}/800</div>
          </Field>
        </div>

        <Button onClick={save} disabled={saving} className="w-full h-11">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1.5" /> Save preferences</>}
        </Button>

        <div className="glass-card p-3 flex gap-2 items-start text-xs text-muted-foreground">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
          <p>Your preferences are stored securely and applied to future AI responses.</p>
        </div>
      </div>
    </PageShell>
  );
}
