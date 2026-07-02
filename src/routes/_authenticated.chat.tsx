import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Paperclip, Camera, Mic, Copy, RefreshCw, Loader2, X,
  FileText, FilePlus, Construction, Plus, History as HistoryIcon, Trash2, Check, Sparkles, Square,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatMessage } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
  validateSearch: (s: Record<string, unknown>) => ({
    c: typeof s.c === "string" ? s.c : undefined,
  }),
});


type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; ts: number };
type Conversation = { id: string; title: string; createdAt: number; updatedAt: number; messages: Msg[] };

const DEFAULT_SUGGESTIONS = [
  "✍️ Write me a professional email",
  "🌿 Identify this plant from a photo",
  "🍽️ Analyze my meal nutrition",
  "💡 Give me a creative idea",
];

function storageKey(userId: string | undefined) {
  return `nova-chats-${userId ?? "anon"}`;
}

function loadConversations(userId: string | undefined): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversations(userId: string | undefined, convos: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep the most recent 50 conversations to stay well under quota
    const trimmed = [...convos].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 50);
    localStorage.setItem(storageKey(userId), JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
}


function groupConversations(convos: Conversation[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const start7 = startOfToday - 7 * 86400000;
  const buckets = { Today: [] as Conversation[], Yesterday: [] as Conversation[], "Previous 7 Days": [] as Conversation[], Older: [] as Conversation[] };
  for (const c of convos) {
    if (c.updatedAt >= startOfToday) buckets.Today.push(c);
    else if (c.updatedAt >= startOfYesterday) buckets.Yesterday.push(c);
    else if (c.updatedAt >= start7) buckets["Previous 7 Days"].push(c);
    else buckets.Older.push(c);
  }
  return buckets;
}

function extractFollowUps(text: string): string[] {
  // Try to find "Suggested next questions" section our system prompt asks for
  const m = text.split(/###?\s*Suggested next questions/i)[1];
  if (!m) return [];
  const lines = m
    .split("\n")
    .map((l) => l.replace(/^\s*[-*\d.]+\s*/, "").replace(/^["“]|["”]$/g, "").trim())
    .filter((l) => l.length > 3 && l.length < 140 && /[a-zA-Z]/.test(l));
  return lines.slice(0, 3);
}

function stripFollowUps(text: string): string {
  return text.split(/###?\s*Suggested next questions/i)[0].trimEnd();
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ---------- Code block with Copy ---------- */
function CodeBlock({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = String(children ?? "").replace(/\n$/, "");
  if (inline) {
    return <code className={cn("px-1.5 py-0.5 rounded bg-muted text-[0.85em] font-mono", className)}>{children}</code>;
  }
  const lang = /language-(\w+)/.exec(className || "")?.[1] ?? "";
  return (
    <div className="relative my-2 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 text-zinc-300 text-[11px]">
        <span className="font-mono uppercase tracking-wide">{lang || "code"}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="bg-zinc-950 text-zinc-100 text-[13px] leading-relaxed p-3 overflow-x-auto m-0">
        <code className={cn("font-mono", className)}>{text}</code>
      </pre>
    </div>
  );
}

/* ---------- Auto-grow textarea ---------- */
function AutoTextarea({
  value, onChange, onKeyDown, placeholder, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const line = 24; // ~15px * 1.6
    const max = line * 6 + 24;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value]);
  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={3}
      className="resize-none w-full rounded-2xl border-2 border-border bg-background/90 px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
      style={{ minHeight: 24 * 3 + 24 }}
    />
  );
}

/* ================================================= */

function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { c: cParam } = Route.useSearch();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<null | { title: string; icon: typeof FileText }>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount / user change
  useEffect(() => {
    const list = loadConversations(user?.id);
    setConversations(list);
  }, [user?.id]);

  // Sync active conversation with URL ?c=<id>. Absence = brand new empty chat.
  useEffect(() => {
    if (cParam && conversations.some((c) => c.id === cParam)) {
      setActiveId(cParam);
    } else {
      setActiveId(null);
    }
  }, [cParam, conversations]);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);
  const messages = active?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  // Refresh follow-ups from last assistant message
  useEffect(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (last) {
      const fu = extractFollowUps(last.content);
      setFollowUps(fu);
    } else {
      setFollowUps([]);
    }
  }, [messages]);

  const persist = useCallback((next: Conversation[]) => {
    setConversations(next);
    saveConversations(user?.id, next);
  }, [user?.id]);

  function newChat() {
    setActiveId(null);
    setInput("");
    setAttached(null);
    setHistoryOpen(false);
    navigate({ to: "/chat", search: {} });
  }

  function openConversation(id: string) {
    setActiveId(id);
    setHistoryOpen(false);
    navigate({ to: "/chat", search: { c: id } });
  }

  function deleteConversation(id: string) {
    const next = conversations.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) {
      setActiveId(null);
      navigate({ to: "/chat", search: {} });
    }
    setToDelete(null);
    toast.success("Conversation deleted");
  }

  function clearAll() {
    persist([]);
    setActiveId(null);
    setClearAllOpen(false);
    navigate({ to: "/chat", search: {} });
    toast.success("History cleared");
  }


  async function send(customText?: string, retryLast = false) {
    if (!user) return;
    const now = Date.now();
    let convo = active;
    let convos = conversations;

    const providedText = customText ?? input;
    const text = retryLast ? messages[messages.length - 2]?.content ?? "" : providedText.trim();
    const img = retryLast ? messages[messages.length - 2]?.imageUrl : attached ?? undefined;
    if (!text && !img) return;

    // Ensure conversation exists
    if (!convo) {
      convo = {
        id: crypto.randomUUID(),
        title: (text || "Image chat").slice(0, 40),
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      convos = [convo, ...convos];
      setActiveId(convo.id);
      navigate({ to: "/chat", search: { c: convo.id } });
    }


    let msgs: Msg[];
    if (retryLast) {
      msgs = convo.messages.slice(0, -1);
    } else {
      msgs = [...convo.messages, { role: "user", content: text, imageUrl: img, ts: now }];
      setInput("");
      setAttached(null);
    }

    const updatedConvo: Conversation = { ...convo, messages: msgs, updatedAt: now };
    let nextConvos = convos.map((c) => (c.id === updatedConvo.id ? updatedConvo : c));
    persist(nextConvos);

    setBusy(true);
    try {
      const res = await chatMessage({
        data: { messages: msgs.map((m) => ({ role: m.role, content: m.content, imageUrl: m.imageUrl })) },
      });
      const reply: Msg = { role: "assistant", content: res.text, ts: Date.now() };
      const finalConvo: Conversation = { ...updatedConvo, messages: [...msgs, reply], updatedAt: Date.now() };
      nextConvos = nextConvos.map((c) => (c.id === finalConvo.id ? finalConvo : c));
      persist(nextConvos);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setAttached(reader.result as string);
    reader.readAsDataURL(file);
  }

  function toggleVoice() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => unknown; SpeechRecognition?: new () => unknown }).webkitSpeechRecognition
      ?? (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition;
    if (!SR) return toast.error("Voice input not supported on this device");
    const rec = new SR() as {
      lang: string; interimResults: boolean; continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void;
      onerror: () => void; onend: () => void; start: () => void; stop: () => void;
    };
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if ((r as { isFinal?: boolean }).isFinal) finalText += t;
        else interim += t;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = () => { toast.error("Voice input failed"); setRecording(false); };
    rec.onend = () => {
      setRecording(false);
      if (finalText) {
        setHighlightInput(true);
        setTimeout(() => setHighlightInput(false), 900);
      }
    };
    try {
      rec.start();
      setRecording(true);
      recRef.current = { stop: () => rec.stop() };
    } catch {
      toast.error("Could not start microphone");
    }
  }

  function copyMessage(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  const grouped = useMemo(() => groupConversations([...conversations].sort((a, b) => b.updatedAt - a.updatedAt)), [conversations]);
  const charCount = input.length;

  const showEmpty = messages.length === 0;
  const suggestions = showEmpty ? DEFAULT_SUGGESTIONS : followUps;

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-5rem)]">
      <div className="px-4 pt-3 flex items-center justify-between gap-2">
        <PageHeader title="AI Chat" icon={<MessageSquare className="size-5 text-primary" />} subtitle="Ask Nova Vision anything" />
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2 rounded-xl hover:bg-accent border border-border"
            aria-label="Chat history"
          >
            <HistoryIcon className="size-4" />
          </button>
          <button
            onClick={newChat}
            className="p-2 rounded-xl hover:bg-accent border border-border flex items-center gap-1 text-xs font-medium px-3"
            aria-label="New chat"
          >
            <Plus className="size-4" /> New
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {showEmpty && (
          <div className="glass-card p-6 text-center mt-6">
            <div className="size-14 rounded-2xl hero-gradient grid place-items-center mx-auto mb-3 glow">
              <Sparkles className="size-6 text-primary-foreground" />
            </div>
            <p className="text-sm font-semibold">Start a conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Ask about anything — food, plants, code, writing, ideas.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const clean = isUser ? m.content : stripFollowUps(m.content);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
            >
              {!isUser && (
                <div className="size-8 shrink-0 rounded-full hero-gradient grid place-items-center glow mt-0.5">
                  <Sparkles className="size-4 text-primary-foreground" />
                </div>
              )}
              <div className={cn("max-w-[82%] group", isUser ? "items-end" : "items-start", "flex flex-col")}>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 shadow-sm",
                  isUser ? "bg-primary text-primary-foreground rounded-tr-md" : "glass-card rounded-tl-md",
                )}>
                  {m.imageUrl && <img src={m.imageUrl} alt="" className="rounded-lg mb-2 max-h-52" />}
                  {isUser ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{clean}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-pre:p-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none">
                      <ReactMarkdown
                        components={{
                          code: CodeBlock as never,
                          pre: ({ children }) => <>{children}</>,
                        }}
                      >
                        {clean}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "flex items-center gap-2 mt-1 text-[10px] text-muted-foreground px-1",
                  isUser ? "flex-row-reverse" : "flex-row",
                )}>
                  <span>{timeLabel(m.ts)}</span>
                  {!isUser && (
                    <>
                      <button onClick={() => copyMessage(clean)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Copy className="size-3" /> Copy
                      </button>
                      {i === messages.length - 1 && (
                        <button onClick={() => send(undefined, true)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <RefreshCw className="size-3" /> Regenerate
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {busy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
            <div className="size-8 shrink-0 rounded-full hero-gradient grid place-items-center glow">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <div className="glass-card px-4 py-3 flex gap-1 rounded-2xl rounded-tl-md">
              <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggestion chips */}
      {!busy && suggestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={s + i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => send(s)}
              className="px-3 py-1.5 rounded-full text-xs border border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {/* Recording banner */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mx-4 mb-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-2.5 flex items-center gap-3"
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
              <span className="relative size-3 rounded-full bg-primary block" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-primary">Listening… speak now</div>
              <div className="text-[11px] text-muted-foreground">Tap the mic again to stop</div>
            </div>
            <div className="flex items-end gap-0.5 h-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  style={{
                    animation: `voice-bar 900ms ease-in-out ${i * 100}ms infinite`,
                    height: "40%",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-border p-3 bg-background/80 backdrop-blur-xl">
        {attached && (
          <div className="relative mb-2 inline-block">
            <img src={attached} alt="" className="h-16 rounded-lg" />
            <button onClick={() => setAttached(null)} className="absolute -top-1 -right-1 size-5 bg-destructive text-destructive-foreground rounded-full grid place-items-center">
              <X className="size-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg hover:bg-accent" aria-label="Attach image"><Paperclip className="size-4" /></button>
            <button onClick={() => camRef.current?.click()} className="p-2 rounded-lg hover:bg-accent" aria-label="Camera"><Camera className="size-4" /></button>
          </div>
          <div className={cn("flex-1 relative transition-all", highlightInput && "animate-pulse")}>
            <AutoTextarea
              value={input}
              onChange={setInput}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Message Nova Vision…"
              disabled={busy}
            />
            {charCount > 400 && (
              <div className="absolute bottom-1 right-3 text-[10px] text-muted-foreground pointer-events-none">
                {charCount}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={toggleVoice}
              className={cn(
                "p-2 rounded-lg transition-all relative",
                recording
                  ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.25),0_0_24px_hsl(var(--primary)/0.6)]"
                  : "hover:bg-accent",
              )}
              aria-label={recording ? "Stop voice" : "Start voice"}
            >
              {recording ? <Square className="size-4" /> : <Mic className="size-4" />}
              {recording && <span className="absolute inset-0 rounded-lg border-2 border-primary animate-ping" />}
            </button>
            <button
              onClick={() => setComingSoon({ title: "Attach File", icon: FilePlus })}
              className="p-2 rounded-lg hover:bg-accent"
              aria-label="Attach file"
            >
              <FilePlus className="size-4" />
            </button>
          </div>
          <Button
            onClick={() => send()}
            disabled={busy || (!input.trim() && !attached)}
            size="icon"
            className={cn(
              "hero-gradient text-primary-foreground shrink-0 rounded-xl h-11 w-11 transition-all",
              input.trim() && !busy && "animate-pulse shadow-[0_0_18px_hsl(var(--primary)/0.55)]",
            )}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
          <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={camRef} type="file" hidden accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        <button
          onClick={() => setComingSoon({ title: "Document", icon: FileText })}
          className="mt-2 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <FileText className="size-3" /> Attach a document
        </button>
      </div>

      {/* Coming soon */}
      <Dialog open={!!comingSoon} onOpenChange={(o) => !o && setComingSoon(null)}>
        <DialogContent className="glass-card backdrop-blur-2xl border-border max-w-sm">
          <AnimatePresence>
            {comingSoon && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <div className="flex flex-col items-center text-center py-2">
                  <div className="size-16 rounded-3xl hero-gradient grid place-items-center glow mb-4">
                    <Construction className="size-8 text-primary-foreground" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-center text-lg">🚧 {comingSoon.title} — Coming Soon</DialogTitle>
                    <DialogDescription className="text-center mt-2">
                      This feature is under development and will be available in a future update.
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* History drawer */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="w-[88%] max-w-sm p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2"><HistoryIcon className="size-4 text-primary" /> Chat history</SheetTitle>
          </SheetHeader>
          <div className="p-3 border-b border-border flex gap-2">
            <Button onClick={newChat} className="flex-1 hero-gradient text-primary-foreground rounded-xl">
              <Plus className="size-4 mr-1" /> New chat
            </Button>
            {conversations.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setClearAllOpen(true)}
                className="rounded-xl text-destructive hover:bg-destructive/10"
                aria-label="Clear all history"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {conversations.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">No conversations yet.</p>
            )}
            {(Object.keys(grouped) as (keyof typeof grouped)[]).map((label) => {
              const items = grouped[label];
              if (!items.length) return null;
              return (
                <div key={label}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">{label}</div>
                  <ul className="space-y-1">
                    {items.map((c) => {
                      const last = c.messages[c.messages.length - 1];
                      const preview = last ? last.content.replace(/[#*`]/g, "").slice(0, 50) : "";
                      return (
                        <li key={c.id}>
                          <div className={cn(
                            "group flex items-start gap-2 p-2.5 rounded-xl cursor-pointer transition-colors",
                            activeId === c.id ? "bg-primary/10 border border-primary/30" : "hover:bg-accent border border-transparent",
                          )}>
                            <button onClick={() => openConversation(c.id)} className="flex-1 min-w-0 text-left">
                              <div className="text-sm font-medium truncate">{c.title}</div>
                              {preview && <div className="text-[11px] text-muted-foreground truncate mt-0.5">{preview}</div>}
                            </button>
                            <button
                              onClick={() => setToDelete(c.id)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-opacity"
                              aria-label="Delete conversation"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription>This chat will be removed from your history. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => toDelete && deleteConversation(toDelete)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear all confirm */}
      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear all history?</DialogTitle>
            <DialogDescription>Every saved conversation will be permanently removed from this device.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" onClick={() => setClearAllOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={clearAll}>Clear all</Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes voice-bar {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>

  );
}
