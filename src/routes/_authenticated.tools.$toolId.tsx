import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import {
  Languages, SpellCheck, FileUser, PenLine, Mail, Code2, Database, FileText,
  FileSearch, ScanText, Loader2, Copy, Check, Upload, Wrench, Palette, Volume2, Play, Pause, type LucideIcon,
} from "lucide-react";

import { PageShell, PageHeader } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { runTextTool, runOcrTool } from "@/lib/tools.functions";
import { awardPoints } from "@/lib/points";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/tools/$toolId")({
  component: ToolPage,
  head: ({ params }) => {
    const t = TOOLS[params.toolId];
    return pageHead({
      path: `/tools/${params.toolId}`,
      title: t ? `${t.label} — Nova Vision AI` : "AI Tool — Nova Vision AI",
      description: t?.desc ?? "Powerful AI tool.",
    });
  },
});

type ToolMode = "text" | "translate" | "ocr" | "pdf";
type ToolDef = {
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  mode: ToolMode;
  placeholder: string;
  cta: string;
  minChars?: number;
};

const TOOLS: Record<string, ToolDef> = {
  translator: {
    label: "Translator", desc: "Translate text into any language",
    icon: Languages, color: "from-indigo-400 to-violet-500",
    mode: "translate", placeholder: "Paste text to translate…", cta: "Translate",
  },
  "grammar-checker": {
    label: "Grammar Checker", desc: "Fix grammar, spelling & clarity",
    icon: SpellCheck, color: "from-rose-400 to-pink-500",
    mode: "text", placeholder: "Paste your writing to check…", cta: "Check Grammar",
  },
  "resume-builder": {
    label: "Resume Builder", desc: "Generate an ATS-friendly resume",
    icon: FileUser, color: "from-fuchsia-400 to-purple-500",
    mode: "text",
    placeholder: "Describe your role, years of experience, key skills, achievements, and education…",
    cta: "Build Resume", minChars: 30,
  },
  "blog-writer": {
    label: "Blog Writer", desc: "Write full SEO-friendly blog posts",
    icon: PenLine, color: "from-sky-400 to-blue-500",
    mode: "text", placeholder: "Topic and any details (audience, tone, keywords)…", cta: "Write Blog",
  },
  "email-writer": {
    label: "Email Writer", desc: "Polished emails in seconds",
    icon: Mail, color: "from-cyan-400 to-teal-500",
    mode: "text",
    placeholder: "What do you want to say? Include recipient, purpose, and tone.",
    cta: "Write Email",
  },
  "code-generator": {
    label: "Code Generator", desc: "Generate production-quality code",
    icon: Code2, color: "from-lime-400 to-green-500",
    mode: "text", placeholder: "Describe what the code should do (mention language if specific)…", cta: "Generate Code",
  },
  "sql-generator": {
    label: "SQL Generator", desc: "Natural language → SQL",
    icon: Database, color: "from-amber-400 to-orange-500",
    mode: "text", placeholder: "Describe the query in plain English (mention tables/columns if known)…", cta: "Generate SQL",
  },
  "text-summarizer": {
    label: "Text Summarizer", desc: "Condense long text into key points",
    icon: FileText, color: "from-orange-400 to-red-500",
    mode: "text", placeholder: "Paste the text you want summarized…", cta: "Summarize",
    minChars: 80,
  },
  "pdf-summarizer": {
    label: "PDF Summarizer", desc: "Upload a PDF and get a summary",
    icon: FileSearch, color: "from-slate-400 to-slate-600",
    mode: "pdf", placeholder: "", cta: "Summarize PDF",
  },
  ocr: {
    label: "OCR Scanner", desc: "Extract text from an image",
    icon: ScanText, color: "from-cyan-400 to-teal-500",
    mode: "ocr", placeholder: "", cta: "Extract Text",
  },
  "logo-generator": {
    label: "Logo Generator", desc: "Brand brief + image prompt",
    icon: Palette, color: "from-pink-400 to-rose-500",
    mode: "text",
    placeholder: "Describe your business/product: name, industry, audience, vibe (e.g. 'Nova Roast — specialty coffee brand, minimalist, warm').",
    cta: "Generate Logo Brief", minChars: 10,
  },
  "text-to-speech": {
    label: "Text-to-Speech", desc: "Speak any text aloud",
    icon: Volume2, color: "from-violet-400 to-fuchsia-500",
    mode: "text",
    placeholder: "Paste the text you want converted to a spoken script. Then tap Play on the result.",
    cta: "Prepare Script", minChars: 5,
  },
};


async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerMod = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")) as { default: string };
  pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const maxPages = Math.min(pdf.numPages, 40);
  let text = "";
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => ("str" in it ? (it as { str: string }).str : "")).join(" ");
    text += `\n\n--- Page ${i} ---\n${strings}`;
  }
  return text.trim();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

function ToolPage() {
  const { toolId } = Route.useParams();
  const tool = TOOLS[toolId];
  const runText = useServerFn(runTextTool);
  const runOcr = useServerFn(runOcrTool);

  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);


  const canSubmit = useMemo(() => {
    if (!tool) return false;
    if (busy) return false;
    if (tool.mode === "ocr" || tool.mode === "pdf") return !!file;
    return input.trim().length >= (tool.minChars ?? 1);
  }, [tool, input, file, busy]);

  if (!tool) {
    return (
      <PageShell>
        <PageHeader title="Tool not found" icon={<Wrench className="size-5" />} />
        <p className="text-sm text-muted-foreground">This tool does not exist.</p>
      </PageShell>
    );
  }

  const Icon = tool.icon;

  async function onSubmit() {
    if (!tool || !canSubmit) return;
    setBusy(true);
    setResult("");
    try {
      if (tool.mode === "ocr") {
        const dataUrl = imagePreview ?? (file ? await fileToDataUrl(file) : "");
        if (!dataUrl) throw new Error("Please choose an image.");
        const { text } = await runOcr({ data: { imageDataUrl: dataUrl } });
        setResult(text);
      } else if (tool.mode === "pdf") {
        if (!file) throw new Error("Please choose a PDF.");
        toast.message("Extracting PDF text…");
        const text = await extractPdfText(file);
        if (!text) throw new Error("Could not extract text from this PDF.");
        const trimmed = text.length > 18000 ? text.slice(0, 18000) : text;
        const { text: out } = await runText({ data: { toolId: "pdf-summarizer", input: trimmed } });
        setResult(out);
      } else if (tool.mode === "translate") {
        const { text } = await runText({
          data: { toolId: "translator", input, targetLanguage: targetLang || "English" },
        });
        setResult(text);
      } else {
        const { text } = await runText({ data: { toolId, input } });
        setResult(text);
      }
      awardPoints("chat");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setImagePreview(null);
    if (f && tool?.mode === "ocr") {
      fileToDataUrl(f).then(setImagePreview).catch(() => setImagePreview(null));
    }
  }

  return (
    <PageShell>
      <PageHeader
        title={tool.label}
        subtitle={tool.desc}
        icon={
          <span className={`size-8 rounded-xl grid place-items-center text-white bg-gradient-to-br ${tool.color}`}>
            <Icon className="size-4" />
          </span>
        }
      />

      <div className="space-y-4">
        {tool.mode === "translate" && (
          <div>
            <Label htmlFor="lang" className="text-xs">Target language</Label>
            <Input
              id="lang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              placeholder="e.g. Spanish, French, Japanese"
              className="mt-1"
            />
          </div>
        )}

        {(tool.mode === "text" || tool.mode === "translate") && (
          <div>
            <Label htmlFor="input" className="text-xs">Your input</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tool.placeholder}
              className="mt-1 min-h-[160px] resize-y"
              maxLength={20000}
            />
            <div className="mt-1 text-[11px] text-muted-foreground text-right">
              {input.length.toLocaleString()} / 20,000
            </div>
          </div>
        )}

        {(tool.mode === "ocr" || tool.mode === "pdf") && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept={tool.mode === "ocr" ? "image/*" : "application/pdf,.pdf"}
              onChange={onPickFile}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-input p-6 grid place-items-center gap-2 hover:bg-accent/40 transition"
              type="button"
            >
              <Upload className="size-6 text-muted-foreground" />
              <div className="text-sm font-medium">
                {file ? file.name : tool.mode === "ocr" ? "Choose an image" : "Choose a PDF"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {tool.mode === "ocr" ? "PNG, JPG, WEBP up to 10 MB" : "PDF up to 20 MB (first 40 pages)"}
              </div>
            </button>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-3 max-h-56 rounded-lg mx-auto object-contain" />
            )}
          </div>
        )}

        <Button onClick={onSubmit} disabled={!canSubmit} className="w-full h-11 text-base">
          {busy ? <Loader2 className="size-4 animate-spin" /> : tool.cta}
        </Button>

        {result && (
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Result</div>
              <div className="flex items-center gap-2">
                {toolId === "text-to-speech" && (
                  <button
                    onClick={() => {
                      const synth = window.speechSynthesis;
                      if (!synth) return toast.error("Speech not supported on this device");
                      if (synth.speaking) { synth.cancel(); setSpeaking(false); return; }
                      const u = new SpeechSynthesisUtterance(result.replace(/\[[^\]]+\]/g, ""));
                      u.onend = () => setSpeaking(false);
                      u.onerror = () => setSpeaking(false);
                      synth.speak(u);
                      setSpeaking(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    {speaking ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    {speaking ? "Stop" : "Play"}
                  </button>
                )}
                <button
                  onClick={onCopy}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-foreground prose-pre:rounded-lg prose-headings:mt-3 prose-headings:mb-2">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
