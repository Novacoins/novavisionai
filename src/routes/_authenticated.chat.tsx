import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Paperclip, Camera, Mic, Copy, RefreshCw, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PageHeader, PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatMessage } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string };

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function ensureConversation(title: string) {
    if (conversationId || !user) return conversationId;
    const { data } = await supabase.from("chat_conversations").insert({ user_id: user.id, title: title.slice(0, 60) }).select().single();
    if (data) setConversationId(data.id);
    return data?.id ?? null;
  }

  async function send(retryLast = false) {
    if (!user) return;
    const text = retryLast ? messages[messages.length - 2]?.content ?? "" : input.trim();
    const img = retryLast ? messages[messages.length - 2]?.imageUrl : attached ?? undefined;
    if (!text && !img) return;
    let next: Msg[];
    if (retryLast) {
      next = messages.slice(0, -1);
    } else {
      next = [...messages, { role: "user", content: text, imageUrl: img }];
      setInput("");
      setAttached(null);
    }
    setMessages(next);
    setBusy(true);
    try {
      const convId = await ensureConversation(text || "Image chat");
      if (convId && !retryLast) {
        await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: text, image_url: img ?? null });
      }
      const res = await chatMessage({
        data: { messages: next.map((m) => ({ role: m.role, content: m.content, imageUrl: m.imageUrl })) },
      });
      const reply: Msg = { role: "assistant", content: res.text };
      setMessages([...next, reply]);
      if (convId) await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: res.text });
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

  function startVoice() {
    const SR = (window as unknown as { webkitSpeechRecognition?: new () => unknown; SpeechRecognition?: new () => unknown }).webkitSpeechRecognition
      ?? (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition;
    if (!SR) return toast.error("Voice input not supported on this device");
    const rec = new SR() as { lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: () => void; start: () => void };
    rec.lang = "en-US";
    rec.onresult = (e) => setInput((p) => (p ? p + " " : "") + (e.results[0]?.[0]?.transcript ?? ""));
    rec.onerror = () => toast.error("Voice input failed");
    rec.start();
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-5rem)]">
      <div className="px-4 pt-3">
        <PageHeader title="AI Chat" icon={<MessageSquare className="size-5 text-primary" />} subtitle="Ask VisionNova anything" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="glass-card p-6 text-center mt-6">
            <MessageSquare className="size-10 mx-auto text-primary mb-2" />
            <p className="text-sm font-semibold">Start a conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Ask about food, plants, products, or attach an image.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"}`}>
              {m.imageUrl && <img src={m.imageUrl} alt="" className="rounded-lg mb-2 max-h-48" />}
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              )}
              {m.role === "assistant" && (
                <div className="flex gap-1 mt-2 -mb-1">
                  <button onClick={() => { navigator.clipboard.writeText(m.content); toast.success("Copied"); }} className="p-1 rounded hover:bg-accent text-xs flex items-center gap-1"><Copy className="size-3" /> Copy</button>
                  {i === messages.length - 1 && <button onClick={() => send(true)} className="p-1 rounded hover:bg-accent text-xs flex items-center gap-1"><RefreshCw className="size-3" /> Regenerate</button>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="glass-card px-4 py-3 flex gap-1">
              <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-background/80 backdrop-blur-xl">
        {attached && (
          <div className="relative mb-2 inline-block">
            <img src={attached} alt="" className="h-16 rounded-lg" />
            <button onClick={() => setAttached(null)} className="absolute -top-1 -right-1 size-5 bg-destructive text-destructive-foreground rounded-full grid place-items-center"><X className="size-3" /></button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg hover:bg-accent" aria-label="Attach"><Paperclip className="size-4" /></button>
            <button onClick={() => camRef.current?.click()} className="p-2 rounded-lg hover:bg-accent" aria-label="Camera"><Camera className="size-4" /></button>
            <button onClick={startVoice} className="p-2 rounded-lg hover:bg-accent" aria-label="Voice"><Mic className="size-4" /></button>
            <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <input ref={camRef} type="file" hidden accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message VisionNova…"
            rows={1}
            className="resize-none min-h-10 max-h-32"
          />
          <Button onClick={() => send()} disabled={busy || (!input.trim() && !attached)} size="icon" className="hero-gradient text-primary-foreground shrink-0">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
