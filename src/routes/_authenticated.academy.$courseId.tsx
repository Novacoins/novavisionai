import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Loader2,
  Star,
  Trophy,
  Check,
  X,
  GraduationCap,
  Search,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { COURSES, loadProgress, markComplete } from "@/lib/academy";
import { generateLesson } from "@/lib/academy.functions";
import { useAuth } from "@/lib/auth-context";
import { awardPoints } from "@/lib/points";
import { toast } from "sonner";
import { pageHead } from "@/lib/page-head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/academy/$courseId")({
  component: CoursePage,
  head: ({ params }) => {
    const c = COURSES[params.courseId];
    return pageHead({
      path: `/academy/${params.courseId}`,
      title: c ? `${c.title} — Nova Vision Academy` : "Academy — Nova Vision AI",
      description: c?.subtitle ?? "AI-powered learning.",
    });
  },
});

type Quiz = { questions: Array<{ q: string; options: string[]; answer: number; why: string }> };

function CoursePage() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const course = COURSES[courseId];
  const runGenerate = useServerFn(generateLesson);

  const [progress, setProgress] = useState(() => loadProgress(courseId, user?.id));
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lessonMd, setLessonMd] = useState("");
  const [quiz, setQuiz] = useState<Quiz>({ questions: [] });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!course) return [] as string[];
    const q = query.trim().toLowerCase();
    if (!q) return course.lessons;
    return course.lessons.filter((l) => l.toLowerCase().includes(q));
  }, [course, query]);

  if (!course) {
    return (
      <PageShell>
        <PageHeader title="Course not found" icon={<GraduationCap className="size-5" />} />
        <Link to="/academy" className="text-sm text-primary underline">
          Back to Academy
        </Link>
      </PageShell>
    );
  }

  const total = course.lessons.length;
  const done = progress.completed.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const certified = done === total && total > 0;

  async function openAndLoad(lesson: string) {
    setOpenLesson(lesson);
    setLessonMd("");
    setQuiz({ questions: [] });
    setAnswers({});
    setSubmitted(false);
    setBusy(true);
    try {
      const res = await runGenerate({ data: { course: course.title, lesson } });
      setLessonMd(res.lesson);
      setQuiz(res.quiz ?? { questions: [] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load lesson");
      setOpenLesson(null);
    } finally {
      setBusy(false);
    }
  }

  function submitQuiz() {
    if (!openLesson) return;
    const correct = quiz.questions.filter((q, i) => answers[i] === q.answer).length;
    const passed = quiz.questions.length === 0 || correct / quiz.questions.length >= 0.6;
    setSubmitted(true);
    if (passed) {
      const next = markComplete(courseId, openLesson, user?.id);
      setProgress(next);
      awardPoints("lesson_completed").catch(() => {});
      toast.success(`Lesson complete! +30 XP · ⭐ +30 AI Points`);
    } else {
      toast.error(`Score ${correct}/${quiz.questions.length} — try again to complete this lesson.`);
    }
  }

  if (openLesson) {
    return (
      <PageShell>
        <button
          onClick={() => setOpenLesson(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-4" /> Back to {course.title}
        </button>
        {busy ? (
          <div className="glass-card p-8 grid place-items-center gap-3">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparing your lesson…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass-card p-5 prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-pre:bg-muted prose-pre:text-foreground prose-pre:rounded-lg">
              <ReactMarkdown>{lessonMd}</ReactMarkdown>
            </div>

            {quiz.questions.length > 0 && (
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-amber-500" />
                  <div className="text-sm font-semibold">Quick Quiz</div>
                </div>
                {quiz.questions.map((q, qi) => (
                  <div key={qi} className="space-y-2">
                    <div className="text-sm font-medium">
                      {qi + 1}. {q.q}
                    </div>
                    <div className="grid gap-1.5">
                      {q.options.map((opt, oi) => {
                        const chosen = answers[qi] === oi;
                        const correct = submitted && oi === q.answer;
                        const wrong = submitted && chosen && oi !== q.answer;
                        return (
                          <button
                            key={oi}
                            disabled={submitted}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                            className={cn(
                              "text-left text-sm px-3 py-2 rounded-lg border transition",
                              !submitted && chosen && "border-primary bg-primary/10",
                              !submitted && !chosen && "border-border hover:bg-accent/40",
                              correct && "border-emerald-500 bg-emerald-500/10",
                              wrong && "border-rose-500 bg-rose-500/10",
                            )}
                          >
                            <span className="inline-flex items-center gap-2">
                              {submitted && correct && (
                                <Check className="size-3.5 text-emerald-600" />
                              )}
                              {submitted && wrong && <X className="size-3.5 text-rose-600" />}
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {submitted && <p className="text-[11px] text-muted-foreground">{q.why}</p>}
                  </div>
                ))}
                {!submitted ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length < quiz.questions.length}
                    className="w-full"
                  >
                    Submit Answers
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setOpenLesson(null)}
                    className="w-full"
                  >
                    Continue
                  </Button>
                )}
              </div>
            )}

            {quiz.questions.length === 0 && (
              <Button
                onClick={() => {
                  const next = markComplete(courseId, openLesson, user?.id);
                  setProgress(next);
                  awardPoints("lesson_completed").catch(() => {});
                  toast.success("Lesson complete! +30 XP");
                  setOpenLesson(null);
                }}
                className="w-full"
              >
                Mark as Complete
              </Button>
            )}
          </div>
        )}
      </PageShell>
    );
  }

  const nextLesson = course.lessons.find((l) => !progress.completed.includes(l));

  return (
    <PageShell>
      <PageHeader
        title={course.title}
        subtitle={course.subtitle}
        icon={
          <span
            className={cn(
              "size-8 rounded-xl grid place-items-center text-white bg-gradient-to-br",
              course.color,
            )}
          >
            <span className="text-lg">{course.emoji}</span>
          </span>
        }
      />

      <div className="glass-card p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="font-semibold">
            {done} / {total} lessons
          </div>
          <div className="inline-flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="size-4 fill-amber-500" /> {progress.xp} XP
          </div>
        </div>
        <Progress value={pct} className="h-2" />
        {certified ? (
          <div className="rounded-xl p-3 bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/40 flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <div className="text-sm">
              <div className="font-semibold">Course Certificate Unlocked</div>
              <div className="text-xs text-muted-foreground">
                You completed every lesson in {course.title}.
              </div>
            </div>
          </div>
        ) : nextLesson ? (
          <Button onClick={() => openAndLoad(nextLesson)} className="w-full">
            <BookOpen className="size-4 mr-1.5" /> Continue: {nextLesson}
          </Button>
        ) : null}
      </div>

      <div className="relative mb-3">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons…"
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((lesson, i) => {
          const done = progress.completed.includes(lesson);
          return (
            <button
              key={lesson}
              onClick={() => openAndLoad(lesson)}
              className="w-full glass-card p-3.5 flex items-center gap-3 text-left hover:bg-accent/30 transition"
            >
              <span className="text-xs text-muted-foreground w-6 shrink-0 text-center font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              {done ? (
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="size-5 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm font-medium leading-snug">{lesson}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No lessons match "{query}"
          </p>
        )}
      </div>
    </PageShell>
  );
}
